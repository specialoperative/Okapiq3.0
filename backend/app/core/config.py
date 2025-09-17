import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Okapiq API"
    debug: bool = True
    
    # API Keys - Set these in your environment variables
    GOOGLE_MAPS_API_KEY: str = os.getenv('GOOGLE_MAPS_API_KEY', '')
    YELP_API_KEY: str = os.getenv('YELP_API_KEY', '')
    
    # Enhanced API Keys for comprehensive market intelligence
    US_CENSUS_API_KEY: str = os.getenv('US_CENSUS_API_KEY', '')
    APOLLO_API_KEY: str = os.getenv('APOLLO_API_KEY', '')
    SERP_API_KEY: str = os.getenv('SERP_API_KEY', '')
    
    # OpenAI API Key for chatbot
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    
    # Smarty Property Data Keys
    SMARTY_AUTH_ID: str = os.getenv('SMARTY_AUTH_ID', '')
    SMARTY_AUTH_TOKEN: str = os.getenv('SMARTY_AUTH_TOKEN', '')
    SMARTY_LICENSE_KEY_1: str = os.getenv('SMARTY_LICENSE_KEY_1', '')
    SMARTY_LICENSE_KEY_2: str = os.getenv('SMARTY_LICENSE_KEY_2', '')
    
    # Authentication settings
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production-please')
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Trial settings
    TRIAL_DAYS: int = 14
    ETALAUNCH_CODE: str = "ETALAUNCH2024"
    ETALAUNCH_TRIAL_DAYS: int = 90
    
    # Additional settings that may be in environment
    serpapi_key: str = ""
    database_url: str = "sqlite:///./okapiq.db"
    redis_url: str = "redis://localhost:6379"
    data_axle_api_key: str = ""
    arcgis_api_key: str = ""
    
    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields

settings = Settings()