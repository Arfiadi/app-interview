import json
import os
import uuid
from typing import Optional
from backend.models.user import UserInDB, UserCreate
from backend.core.security import get_password_hash

# Setup Path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

def _ensure_users_file():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w") as f:
            json.dump([], f)

def get_user_by_username(username: str) -> Optional[UserInDB]:
    _ensure_users_file()
    try:
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
            for u in users:
                if u["username"] == username or u["email"] == username:
                    return UserInDB(**u)
    except json.JSONDecodeError:
        return None
    return None

def create_user(user: UserCreate):
    _ensure_users_file()
    
    if get_user_by_username(user.username) or get_user_by_username(user.email):
        return None 
        
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "email": user.email,
        "hashed_password": get_password_hash(user.password),
        "disabled": False
    }
    
    # Read-Append-Write
    try:
        with open(USERS_FILE, "r") as f:
            data = json.load(f)
    except:
        data = []
        
    data.append(new_user)
    
    with open(USERS_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    return new_user