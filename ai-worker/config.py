"""
Configuración global para el AI Worker
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # FastAPI
    APP_NAME: str = "Agency AI Worker"
    APP_VERSION: str = "0.3.0"
    DEBUG: bool = False

    # API Keys (Cloud)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

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

    # Model Routing: Arquitectura Híbrida (Gemini/OpenAI + Ollama)
    MODEL_ARCHITECT: str = "gemini/gemini-2.5-pro"   # Arquitectura (Cloud)
    MODEL_DESIGNER: str = "gemini/gemini-2.5-flash"  # UI/UX (Cloud)
    MODEL_QA: str = "openai/gpt-4o-mini"             # SDET/Tester (Cloud)
    MODEL_MANAGER: str = "ollama/llama3.2:latest"    # Scrum Master (Local)
    MODEL_DEV: str = "ollama/qwen2.5-coder:latest"   # Junior Dev (Local)
    MODEL_COPY: str = "ollama/mistral:latest"        # Copywriter (Local)

    # CrewAI
    CREW_VERBOSE: bool = True
    CREW_MEMORY: bool = False
    CREW_CACHE: bool = False  # DESACTIVADO: cache causa resultados stale en tools

    # Memory — rutas físicas bajo el volumen compartido para visibilidad total
    MEMORY_OUTPUT_PATH: str = "/memory/reports"
    PROJECT_ROOT: str = "/memory/projects"

    # Logging
    LOG_LEVEL: str = "info"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"  # Permite llaves extra en el .env sin crashear
    }


# Instancia global
settings = Settings()
