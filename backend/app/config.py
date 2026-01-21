from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./checkout.db"
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llava"
    upload_dir: str = "./uploads"

    class Config:
        env_file = ".env"


settings = Settings()
