from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from backend.models.user import UserCreate, Token, User
from backend.services.user_service import create_user, get_user_by_username
from backend.core.security import verify_password, create_access_token
from datetime import timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@router.post("/register", response_model=User)
def register(user: UserCreate):
    db_user = create_user(user)
    if not db_user:
        raise HTTPException(status_code=400, detail="Username atau Email sudah terdaftar")
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60 * 24) # 1 Hari
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency untuk memproteksi route lain
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Di sini nanti logic decode token & validasi user
    # Untuk MVP Login sederhana, kita return username dari token saja
    # ... (Implementasi full JWT decode ada di security.py jika diperlukan)
    pass