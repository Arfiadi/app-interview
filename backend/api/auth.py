from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession

# Import dari layer Services & Core (Aman)
from backend.services.user_service import create_user, get_user_by_username, update_user_password
from backend.core.security import verify_password, create_access_token
from backend.core.database import get_session
from backend.models.user import User, UserCreate, Token

router = APIRouter()

# Token URL ini hanya string referensi, tidak memicu import
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@router.post("/register", response_model=User)
async def register(user: UserCreate, db: AsyncSession = Depends(get_session)):
    """
    Mendaftarkan user baru ke dalam sistem.
    """
    db_user = await create_user(db, user)
    if not db_user:
        raise HTTPException(
            status_code=400, 
            detail="Username atau Email sudah terdaftar"
        )
    
    # Return user model by converting UUID to string
    return User(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session)
):
    """
    Endpoint Login (OAuth2 Standard).
    Menerima username & password, mengembalikan JWT Token.
    """
    user = await get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Auto-upgrade OLD SHA256 hashes to bcrypt if they successfully authenticated
    if not user.hashed_password.startswith("$2"):
        await update_user_password(db, user, form_data.password)
        
    access_token_expires = timedelta(minutes=60 * 24) # 1 Hari
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}