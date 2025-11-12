from fastapi import APIRouter, HTTPException, status
from api.models.user import UserRegister, UserLogin
from api.models.request_response import TokenResponse
from api.services.auth_service import authenticate_user, register_user
from api.auth.jwt_handler import create_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    success = await register_user(user_data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    access_token = create_access_token(data={"sub": user_data.username})
    return TokenResponse(access_token=access_token, username=user_data.username)


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    success = await authenticate_user(user_data.username, user_data.password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(data={"sub": user_data.username})
    return TokenResponse(access_token=access_token, username=user_data.username)
