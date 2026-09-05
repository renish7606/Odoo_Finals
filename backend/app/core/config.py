from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DealFlow API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://dealflow:dealflow@localhost:5432/dealflow"
    secret_key: str = "change-me-in-development"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
