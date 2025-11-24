import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Interview Coach"
    VERSION: str = "1.0.0"
    
    # API Keys
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")
    
    # AI Config
    LLM_MODEL: str = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")
    
    # Paths (Direktori Absolut agar aman dijalankan dari mana saja)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    TEMPLATE_DIR = os.path.join(DATA_DIR, "prompt_templates")

settings = Settings()