"""
Manejo de eventos y Redis - Sistema de Event Streaming
"""
import json
import logging
from datetime import datetime
from typing import Optional, Callable
import redis
from config import settings

logger = logging.getLogger(__name__)


class RedisEventPublisher:
    """Publicador de eventos a Redis"""

    def __init__(self):
        """Inicializa conexión a Redis"""
        self.redis_client = None
        self.connected = False
        self._connect()

    def _connect(self) -> bool:
        """Conecta a Redis"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30,
            )
            self.redis_client.ping()
            self.connected = True
            logger.info("✅ Conectado a Redis")
            return True
        except Exception as e:
            logger.error(f"❌ Error conectando a Redis: {e}")
            self.connected = False
            return False

    def publish_event(
        self,
        agent: str,
        action: str,
        message: str,
        task_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> bool:
        """
        Publica un evento a Redis

        Args:
            agent: Nombre del agente (Manager, Especialista, QA)
            action: Tipo de acción (hablando, pensando, revisando)
            message: Contenido del evento
            task_id: ID de la tarea (opcional)
            metadata: Datos adicionales (opcional)

        Returns:
            bool: True si se publicó correctamente
        """
        try:
            if not self.connected:
                self._connect()

            event_data = {
                "agent": agent,
                "action": action,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
                "task_id": task_id,
                "metadata": metadata or {},
            }

            # Publicar a Redis
            channel = settings.REDIS_EVENTS_CHANNEL
            self.redis_client.publish(channel, json.dumps(event_data))

            logger.debug(f"📤 Evento publicado: {agent} - {action}")
            return True

        except Exception as e:
            logger.error(f"❌ Error publicando evento: {e}")
            return False

    def subscribe_to_events(self, callback: Callable) -> None:
        """
        Suscribirse a eventos (para testing)

        Args:
            callback: Función a ejecutar cuando se reciba un evento
        """
        try:
            if not self.connected:
                self._connect()

            pubsub = self.redis_client.pubsub()
            pubsub.subscribe(settings.REDIS_EVENTS_CHANNEL)

            logger.info(f"📻 Suscrito al canal: {settings.REDIS_EVENTS_CHANNEL}")

            for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    callback(data)

        except Exception as e:
            logger.error(f"❌ Error en suscripción: {e}")

    def close(self) -> None:
        """Cierra conexión a Redis"""
        if self.redis_client:
            self.redis_client.close()
            self.connected = False
            logger.info("Conexión a Redis cerrada")


# Instancia global
event_publisher = RedisEventPublisher()
