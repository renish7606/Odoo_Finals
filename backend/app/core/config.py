"""Read application settings from the environment."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Keep deployment settings in one simple place."""

    app_name: str = "DealFlow360 API"
    environment: str = "development"
    database_url: str = "sqlite:///./dealflow.db"
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    portal_token_expire_minutes: int = 15
    redis_url: str = "redis://localhost:6379/0"
    portal_magic_link_base_url: str = "http://localhost:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Other modules import this shared settings object.
settings = Settings()
