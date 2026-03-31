"""
Configuración global para el AI Worker
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # FastAPI
    APP_NAME: str = "Agency AI Worker"
    APP_VERSION: str = "0.2.0"
    DEBUG: bool = False

    # Servidor
    WORKER_HOST: str = "0.0.0.0"
    WORKER_PORT: int = 8001

    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://redis:6379"

    # Eventos
    REDIS_EVENTS_CHANNEL: str = "agency_events"

    # LLM — Ollama (host macOS)
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # CrewAI
    CREW_VERBOSE: bool = True
    CREW_MEMORY: bool = False
    CREW_CACHE: bool = True

    # Memory — ruta física donde los agentes escriben sus outputs
    MEMORY_OUTPUT_PATH: str = "/memory"

    # Logging
    LOG_LEVEL: str = "info"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global
settings = Settings()
