from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "your-supabase-jwt-secret"
    GROQ_API_KEY: str = "your-groq-api-key"
    GOOGLE_VISION_KEY: str = "path-to-google-credentials.json"
    OPENAI_API_KEY: str = "your-openai-key"
    TWILIO_ACCOUNT_SID: str = "your-twilio-sid"
    TWILIO_AUTH_TOKEN: str = "your-twilio-auth-token"
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    PINECONE_API_KEY: str = "your-pinecone-key"
    PINECONE_INDEX_NAME: str = "hisably-index"
    PINECONE_ENV: str = "us-east-1"
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    APP_ENV: str = "development"

    @model_validator(mode="after")
    def resolve_key_aliases(self):
        if not self.SUPABASE_KEY and self.SUPABASE_ANON_KEY:
            self.SUPABASE_KEY = self.SUPABASE_ANON_KEY
        if not self.SUPABASE_SERVICE_KEY and self.SUPABASE_SERVICE_ROLE_KEY:
            self.SUPABASE_SERVICE_KEY = self.SUPABASE_SERVICE_ROLE_KEY
        return self

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
