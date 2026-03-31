"""
Utilidades y funciones auxiliares
"""
import json
import logging
from datetime import datetime
from typing import Any, Dict

logger = logging.getLogger(__name__)


def safe_json_serialize(obj: Any) -> str:
    """
    Serializa un objeto a JSON de forma segura

    Args:
        obj: Objeto a serializar

    Returns:
        str: JSON serializado
    """
    try:
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif hasattr(obj, "__dict__"):
            return json.dumps(obj.__dict__, default=str)
        else:
            return json.dumps(obj, default=str)
    except Exception as e:
        logger.error(f"Error serializando a JSON: {e}")
        return "{}"


def format_event_message(agent: str, action: str, message: str) -> str:
    """
    Formatea un mensaje de evento

    Args:
        agent: Nombre del agente
        action: Acción realizada
        message: Mensaje principal

    Returns:
        str: Mensaje formateado
    """
    return f"[{agent}] {action.upper()}: {message}"


def parse_task_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parsea y valida una solicitud de tarea

    Args:
        data: Datos de la solicitud

    Returns:
        Dict: Datos validados

    Raises:
        ValueError: Si los datos no son válidos
    """
    required_fields = ["title", "description"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Campo requerido faltante: {field}")

    return {
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "priority": data.get("priority", "medium").lower(),
        "deadline": data.get("deadline", None),
    }


def truncate_message(message: str, max_length: int = 500) -> str:
    """
    Trunca un mensaje a una longitud máxima

    Args:
        message: Mensaje a truncar
        max_length: Longitud máxima

    Returns:
        str: Mensaje truncado
    """
    if len(message) > max_length:
        return message[: max_length - 3] + "..."
    return message


def extract_error_message(error: Exception) -> str:
    """
    Extrae un mensaje de error limpio

    Args:
        error: Excepción

    Returns:
        str: Mensaje de error
    """
    if hasattr(error, "message"):
        return error.message
    return str(error)
