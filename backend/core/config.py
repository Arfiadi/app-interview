import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Interview Coach"
    VERSION: str = "1.0.0"
    
    # Security Config
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # API Keys
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")
    
    # AI Config
    LLM_MODEL: str = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")
    
    # Database Config
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://interview_user:interview_password@localhost:5432/interview_db"
    )
    
    # Redis Config
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Paths (Direktori Absolut agar aman dijalankan dari mana saja)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    TEMPLATE_DIR = os.path.join(DATA_DIR, "prompt_templates")

settings = Settings()