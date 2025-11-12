from api.models.user import UserRegister, User
from mongodb.db_helper import db
import hashlib
import secrets
import uuid

from dotenv import load_dotenv
import os


load_dotenv()

PASSWORD_SALT = os.getenv("PASSWORD_SALT")


def get_hash(salt: str, password: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 1000
    )


def get_password_hash(password: str) -> str:
    password_hash = get_hash(PASSWORD_SALT, password)
    return f"{PASSWORD_SALT}:{password_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split(":")
        new_hash = get_hash(salt, plain_password).hex()
        return secrets.compare_digest(new_hash, stored_hash)
    except (ValueError, AttributeError):
        return False


async def authenticate_user(username: str, password: str):
    return db.authenticate_user(username, get_password_hash(password))


async def register_user(user_data: UserRegister):
    hashed_password = get_password_hash(user_data.password)
    return db.add_user(user_data.username, hashed_password)


async def get_user_by_login(login: str):
    score = db.get_score(login)
    return User(username=login, score=score)
