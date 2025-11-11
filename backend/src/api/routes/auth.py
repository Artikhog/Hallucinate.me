from fastapi import APIRouter, HTTPException, status
from api.models.user import UserRegister, UserLogin
from api.models.request_response import TokenResponse
from api.services.auth_service import authenticate_user, register_user
from api.auth.jwt_handler import create_access_token

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # TODO: Проверить, что пользователь не существует
    user_id = await register_user(user_data)
    
    access_token = create_access_token(data={"sub": user_id})
    return TokenResponse(access_token=access_token, user_id=user_id)

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await authenticate_user(user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, user_id=user.id)
