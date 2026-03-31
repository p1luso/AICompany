"""
Modelos Pydantic para validación de datos
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TaskRequest(BaseModel):
    """Solicitud de tarea del cliente"""

    title: str = Field(..., min_length=5, max_length=200, description="Título de la tarea")
    description: str = Field(
        ..., min_length=10, max_length=2000, description="Descripción detallada"
    )
    priority: Optional[str] = Field(
        "medium", pattern="^(low|medium|high)$", description="Nivel de prioridad"
    )
    deadline: Optional[str] = Field(None, description="Plazo de entrega (ISO format)")

    class Config:
        example = {
            "title": "Análisis de mercado para producto X",
            "description": "Realizar un análisis competitivo completo del mercado de productos similares",
            "priority": "high",
            "deadline": "2026-04-15",
        }


class AgentEvent(BaseModel):
    """Evento de un agente para Redis/WebSocket"""

    agent: str = Field(..., description="Nombre del agente (Manager, Especialista, QA)")
    action: str = Field(..., description="Tipo de acción (hablando, pensando, revisando, etc)")
    message: str = Field(..., description="Contenido del evento")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    task_id: Optional[str] = Field(None, description="ID de la tarea asociada")
    metadata: Optional[dict] = Field(None, description="Datos adicionales")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class TaskResponse(BaseModel):
    """Respuesta de la tarea completada"""

    task_id: str
    status: str = Field(pattern="^(pending|processing|completed|failed)$")
    result: Optional[str] = None
    manager_analysis: Optional[str] = None
    specialist_output: Optional[str] = None
    qa_feedback: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class HealthResponse(BaseModel):
    """Respuesta de health check"""

    status: str
    version: str
    redis_connected: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
