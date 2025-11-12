from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from urllib.parse import quote_plus as quote
import certifi
import os
from bson import objectid

from .mongo_mock import TableMock

load_dotenv()

# from .env
MONGO_HOSTS = os.getenv("MONGO_HOSTS")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_REPLICA_SET = os.getenv("MONGO_REPLICA_SET", "rs01")
IS_LOCAL_CONNECTION = os.getenv("IS_LOCAL", "false") == "true"

MONGO_SILENT = os.getenv("MONGO_SILENT", "false") == "true"


def maybe_print(s):
    if not MONGO_SILENT:
        print(s)


def fix_id(doc):
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


def download_yandex_ca_certificate():
    import urllib.request

    cert_url = "https://storage.yandexcloud.net/cloud-certs/CA.pem"
    cert_path = "yandex_ca.pem"

    if not os.path.exists(cert_path):
        try:
            urllib.request.urlretrieve(cert_url, cert_path)
            maybe_print(f"✅ Cert successfully downloaded: {cert_path}")
        except Exception as e:
            maybe_print(f"❌ Unable to download a cert: {e}")
            return None
    else:
        maybe_print(f"✅ Using existing cert: {cert_path}")
    return cert_path


def connect_to_mongodb(db_name):
    try:
        if not db_name:
            db_name = MONGO_DB or "hallucinate_me"
        
        # Check if connecting to local MongoDB
        hosts = (MONGO_HOSTS or "localhost").split(",")
        is_local = IS_LOCAL_CONNECTION or any(host.lower().strip().split(":")[0] in ["localhost", "127.0.0.1", "mongo"] for host in hosts)
        
        # Build connection URL
        if is_local:
            # Local MongoDB connection (Docker)
            user = MONGO_USER or "admin"
            password = MONGO_PASSWORD or "admin"
            host = hosts[0].strip() if hosts else "localhost"
            
            url = "mongodb://{user}:{pw}@{host}/{db}?authSource=admin".format(
                user=quote(user),
                pw=quote(password),
                host=host,
                db=db_name,
            )
            
            print(url)
            
            client = MongoClient(url, serverSelectionTimeoutMS=5000)
            maybe_print(f"✅ Connecting to local MongoDB at {host}")
        else:
            # Cloud MongoDB connection (Yandex Cloud)
            cert_path = download_yandex_ca_certificate()
            if not cert_path:
                cert_path = certifi.where()
                maybe_print("⚠️ using default certs: certifi")

            user = MONGO_USER
            password = MONGO_PASSWORD
            auth_src = db_name
            
            url = "mongodb://{user}:{pw}@{hosts}/?authSource={auth_src}&replicaSet={rs}".format(
                user=quote(user),
                pw=quote(password),
                hosts=",".join(hosts),
                rs=MONGO_REPLICA_SET,
                auth_src=auth_src,
            )

            client = MongoClient(
                url, tls=True, tlsCAFile=cert_path, serverSelectionTimeoutMS=5000
            )
            maybe_print("✅ Connecting to cloud MongoDB")

        client.admin.command("ping")
        maybe_print("✅ Connected to MongoDB")

        return client[db_name]

    except Exception as e:
        maybe_print(f"❌ Error during connection: {e}")
        return None


def init_collections(db):
    # login - password hash
    if "users" not in db.list_collection_names():
        users = db.create_collection("users")
        users.create_index("login", unique=True)
        maybe_print("✅ 'users' collection created")

    # login - points
    if "scores" not in db.list_collection_names():
        scores = db.create_collection("scores")
        scores.create_index("login", unique=True)
        maybe_print("✅ 'scores' collection created")

    # login - history - updated_at
    if "chat_histories" not in db.list_collection_names():
        chat_histories = db.create_collection("chat_histories")
        chat_histories.create_index([("login", 1), ("updated_at", -1)])

    if "levels" not in db.list_collection_names():
        db.create_collection("levels")


class DatabaseHelper:
    def __init__(self, db_name=None):
        self.db = connect_to_mongodb(db_name)
        if self.db is not None:
            self.users = self.db.users
            self.scores = self.db.scores
            self.chat_histories = self.db.chat_histories
            self.levels = self.db.levels
            init_collections(self.db)
        else:
            maybe_print(
                "❌ Unable to connect to db, using local storage (dict), some features such as login check may not work"
            )
            self.db = {}
            self.users = TableMock()
            self.scores = TableMock()
            self.chat_histories = TableMock()
            self.levels = TableMock()

    def add_user(self, login: str, password: str):
        try:
            self.users.insert_one(
                {
                    "login": login,
                    "password": password,
                }
            )

            self.scores.insert_one({"login": login, "points": 0})

            maybe_print(f"✅ {login} successfully added")
            return True

        except Exception as e:
            maybe_print(f"❌ Error during processing {login}: {e}")
            return False

    def update_score(self, login: str, points: int):
        result = self.scores.update_one(
            {"login": login},
            {"$set": {"points": points}},
            upsert=True,
        )
        return result.modified_count > 0 or result.upserted_id is not None

    def add_score(self, login: str, session_id):
        history = self.get_user_chat_history(session_id)
        level = self.get_level(history["level_id"])
        points = level["base_score"]
        current = self.get_score(login)
        return self.update_score(login, current + points)

    def get_score(self, login: str):
        doc = self.scores.find_one({"login": login})
        return doc["points"] if doc else 0

    def get_all_scores(self):
        return list(self.scores.find({}, {"_id": 0}).sort("points", -1))

    # returns id
    def start_history(self, login: str, level_id):
        result = self.chat_histories.insert_one(
            {
                "login": login,
                "data": [],
                "level_id": level_id,
                "is_valid": False,
                "updated_at": datetime.now(),
            }
        )

        return str(result.inserted_id) if result else None

    def update_history(self, history_id, new_data_text, type):
        return self.chat_histories.update_one(
            {"_id": objectid.ObjectId(history_id)},
            {
                "$push": {"data": {"text": new_data_text, "type": type}},
                "$set": {"updated_at": datetime.now()},
            },
        )

    def save_user_report(self, history_id, report):
        return self.chat_histories.update_one(
            {"_id": objectid.ObjectId(history_id)},
            {"$set": {"updated_at": datetime.now(), "report": report}},
        )

    def save_assistant_verdict(self, history_id, verdict, is_valid):
        return self.chat_histories.update_one(
            {"_id": objectid.ObjectId(history_id)},
            {
                "$set": {
                    "updated_at": datetime.now(),
                    "verdict": verdict,
                    "is_valid": is_valid,
                }
            },
        )

    def add_report_with_verdict(self, history_id, report, verdict):
        """
        Добавляет запись с репортом пользователя и вердиктом ассистента
        в массив reports внутри истории.
        Структура элемента:
        {
            "report": {incorrect_fact, source_url},
            "verdict": {...},
            "is_valid": <bool>,  # валиден ли репорт (т.е. факт действительно ложный)
            "created_at": datetime
        }
        """
        is_valid = bool(verdict.get("is_valid", False))
        entry = {
            "report": report,
            "verdict": verdict,
            "is_valid": is_valid,
            "created_at": datetime.now(),
        }
        return self.chat_histories.update_one(
            {"_id": objectid.ObjectId(history_id)},
            {
                "$push": {"reports": entry},
                "$set": {"updated_at": datetime.now()},
            },
        )

    def get_user_reports(self, login: str):
        """
        Возвращает список всех репортов пользователя по всем его сессиям.
        Каждый элемент содержит идентификатор сессии, level_id и сам репорт с вердиктом.
        """
        cursor = self.chat_histories.find(
            {"login": login, "reports": {"$exists": True, "$ne": []}}
        ).sort("updated_at", -1)
        results = []
        for doc in cursor:
            session_id = str(doc["_id"])
            level_id = doc.get("level_id")
            for entry in doc.get("reports", []):
                results.append(
                    {
                        "session_id": session_id,
                        "level_id": level_id,
                        "report": entry.get("report"),
                        "verdict": entry.get("verdict"),
                        "is_valid": entry.get("is_valid"),
                        "created_at": entry.get("created_at"),
                    }
                )
        return results

    def get_user_chat_history(self, history_id):
        return self.chat_histories.find_one({"_id": objectid.ObjectId(history_id)}, {"_id": 0})

    def get_user_chat_histories(self, login: str):
        return [
            fix_id(doc)
            for doc in self.chat_histories.find(
                {"login": login}
            ).sort("updated_at", -1)
        ]

    def authenticate_user(self, login: str, password: str):
        user = self.users.find_one({"login": login, "password": password})
        return user is not None

    def get_all_users(self):
        return [doc["login"] for doc in self.users.find({}, {"password": 0})]

    def delete_user(self, login: str):
        self.users.delete_one({"login": login})
        self.scores.delete_one({"login": login})
        self.chat_histories.delete_many({"login": login})
        maybe_print(f"✅ User {login} successfully deleted")

    def create_level(self, data):
        return self.levels.insert_one(data).inserted_id

    def get_level(self, level_id):
        return self.levels.find_one({"_id": objectid.ObjectId(level_id)})

    def get_all_levels(self):
        return [fix_id(doc) for doc in self.levels.find({})]

    def clear_all(self):
        self.users.delete_many({})
        self.scores.delete_many({})
        self.chat_histories.delete_many({})
        self.levels.delete_many({})


db = DatabaseHelper()
