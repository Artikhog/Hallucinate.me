from api.models.user import UserRegister
import hashlib
import secrets
import uuid


def get_hash(salt: str, password: str) -> str:
    return hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        1000
    )


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = get_hash(salt, password)
    return f"{salt}:{password_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split(':')
        new_hash = get_hash(salt, plain_password).hex()
        return secrets.compare_digest(new_hash, stored_hash)
    except (ValueError, AttributeError):
        return False


async def authenticate_user(username: str, password: str):
    # TODO: Реализовать через БД
    user = "user" # await get_user_by_username(username)
    
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    
    return user


async def register_user(user_data: UserRegister):
    hashed_password = get_password_hash(user_data.password)
    
    # TODO: Реализовать через БД
    user_id = str(uuid.uuid4()) # await create_user(user_data.username, hashed_password)
    return user_id


async def get_user_by_id(user_id: str):
    # TODO: Реализовать через БД
    # Должна возвращать UserInDB или None
    return "user"