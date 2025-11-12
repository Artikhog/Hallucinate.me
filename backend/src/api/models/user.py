from pydantic import BaseModel, Field
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)


class UserRegister(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    username: str
    score: int
