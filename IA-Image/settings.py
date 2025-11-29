# settings.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    XRPL_RPC_URL: str = "https://s.altnet.rippletest.net:51234"
    PLATFORM_SEED: str = "snFAKEFAKEFAKEFAKE"
    DATABASE_URL: str = "sqlite:///./impact_map.db"

    XRPL_MOCK: bool = True

    # <<< NOUVEAU
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()