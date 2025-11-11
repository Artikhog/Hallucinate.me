from api.models.user import UserRegister, User
from mongodb.db_helper import db
import hashlib
import secrets
import uuid


def get_hash(salt: str, password: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 1000
    )


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = get_hash(salt, password)
    return f"{salt}:{password_hash.hex()}"


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
    if not score:
        return None
    return User(username=login, score=score)
