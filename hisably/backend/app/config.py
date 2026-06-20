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
    VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    VISION_CONFIDENCE_THRESHOLD: float = 0.7
    OCR_MIN_TEXT_LENGTH: int = 20
    APP_ENV: str = "development"

    # Gemini (Google AI Studio) — used for handwritten invoice vision and as a
    # fallback when Groq hits its daily rate limit. Get a free key at
    # https://aistudio.google.com/apikey
    GEMINI_API_KEY: str = ""
    GEMINI_VISION_MODEL: str = "gemini-2.0-flash"
    GEMINI_TEXT_MODEL: str = "gemini-2.0-flash"
    USE_GEMINI_VISION: bool = True

    @model_validator(mode="after")
    def resolve_key_aliases(self):
        if not self.SUPABASE_KEY and self.SUPABASE_ANON_KEY:
            self.SUPABASE_KEY = self.SUPABASE_ANON_KEY
        if not self.SUPABASE_SERVICE_KEY and self.SUPABASE_SERVICE_ROLE_KEY:
            self.SUPABASE_SERVICE_KEY = self.SUPABASE_SERVICE_ROLE_KEY
        return self

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
