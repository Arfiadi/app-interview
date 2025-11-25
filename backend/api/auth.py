from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta

# Import dari layer Services & Core (Aman)
# Pastikan services/user_service.py TIDAK mengimpor api/auth.py
from backend.services.user_service import create_user, get_user_by_username
from backend.core.security import verify_password, create_access_token
from backend.models.user import User, UserCreate, Token

router = APIRouter()

# Token URL ini hanya string referensi, tidak memicu import
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@router.post("/register", response_model=User)
def register(user: UserCreate):
    """
    Mendaftarkan user baru ke dalam sistem.
    """
    db_user = create_user(user)
    if not db_user:
        raise HTTPException(
            status_code=400, 
            detail="Username atau Email sudah terdaftar"
        )
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint Login (OAuth2 Standard).
    Menerima username & password, mengembalikan JWT Token.
    """
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