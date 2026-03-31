"""
Definición de los 3 agentes colaborativos usando CrewAI
"""
import logging
from typing import Optional
from crewai import Agent, Task, Crew
from redis_events import event_publisher
from config import settings

logger = logging.getLogger(__name__)


class EventCapturingAgent(Agent):
    """Extensión de Agent que captura eventos y los publica a Redis"""

    def __init__(self, *args, task_id: Optional[str] = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.task_id = task_id

    def _emit_event(self, action: str, message: str, metadata: dict = None):
        """Publica un evento a Redis"""
        event_publisher.publish_event(
            agent=self.name,
            action=action,
            message=message,
            task_id=self.task_id,
            metadata=metadata,
        )


def create_manager_agent(task_id: str) -> Agent:
    """
    Crea el agente Manager
    - Toma el requerimiento del usuario
    - Planifica los pasos
    - Dirige la ejecución (Daily)
    """
    return EventCapturingAgent(
        role="Manager / Director Ejecutivo",
        goal="""
        Tomar los requerimientos del usuario, crear un plan detallado de ejecución,
        asignar tareas al especialista, revisar el trabajo del QA y garantizar
        que se cumplan los objetivos con calidad.
        """,
        backstory="""
        Eres un director ejecutivo experimentado con 20 años de experiencia
        en gestión de proyectos y operaciones. Tu rol es planificar estratégicamente,
        coordinar equipos y asegurar resultados de alta calidad.
        """,
        verbose=settings.CREW_VERBOSE,
        allow_delegation=True,
        task_id=task_id,
    )


def create_specialist_agent(task_id: str) -> Agent:
    """
    Crea el agente Especialista
    - Ejecuta tareas específicas
    - Investigación, redacción, análisis
    - Trabaja bajo dirección del Manager
    """
    return EventCapturingAgent(
        role="Especialista / Ejecutor",
        goal="""
        Ejecutar tareas específicas con precisión y creatividad. Realizar
        investigaciones profundas, redactar contenido de calidad, analizar
        datos y producir resultados tangibles y medibles.
        """,
        backstory="""
        Eres un especialista técnico y creativo con experiencia en múltiples
        disciplinas: investigación, escritura, análisis de datos y resolución
        de problemas complejos. Te enfocas en la ejecución eficiente y en
        la calidad del trabajo entregado.
        """,
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        task_id=task_id,
    )


def create_qa_agent(task_id: str) -> Agent:
    """
    Crea el agente QA/Reviewer
    - Revisa el trabajo del especialista
    - Busca errores y mejoras
    - Valida contra los requerimientos originales
    """
    return EventCapturingAgent(
        role="QA / Revisor de Calidad",
        goal="""
        Revisar exhaustivamente el trabajo del especialista, identificar errores,
        inconsistencias y áreas de mejora. Validar que el resultado cumple con
        los requerimientos originales y que es de alta calidad.
        """,
        backstory="""
        Eres un revisor experto con ojo crítico para los detalles. Tu experiencia
        en QA y validación te permite identificar problemas que otros pasan por alto.
        Garantizas que solo trabajo de excelencia sea entregado al cliente.
        """,
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        task_id=task_id,
    )


class AgencyTeam:
    """Equipo de agentes que trabajan juntos"""

    def __init__(self, task_id: str):
        self.task_id = task_id
        self.manager = create_manager_agent(task_id)
        self.specialist = create_specialist_agent(task_id)
        self.qa = create_qa_agent(task_id)

    def execute_task(
        self, title: str, description: str, priority: str = "medium"
    ) -> dict:
        """
        Ejecuta una tarea con el equipo de agentes

        Args:
            title: Título de la tarea
            description: Descripción detallada
            priority: Prioridad (low, medium, high)

        Returns:
            dict: Resultado de la ejecución
        """
        try:
            # Notificar inicio
            event_publisher.publish_event(
                agent="Manager",
                action="iniciando",
                message=f"Iniciando tarea: {title}",
                task_id=self.task_id,
                metadata={"priority": priority},
            )

            # Tarea 1: Manager analiza y planifica
            task_planning = Task(
                description=f"""
                Analiza el siguiente requerimiento y crea un plan detallado de ejecución:

                TÍTULO: {title}
                DESCRIPCIÓN: {description}
                PRIORIDAD: {priority}

                Debes:
                1. Entender completamente el requerimiento
                2. Identificar los pasos necesarios
                3. Estimar tiempo y recursos
                4. Crear un plan ejecutable
                """,
                expected_output="""
                Un plan estructurado con:
                - Análisis del requerimiento
                - Pasos a seguir numerados
                - Recursos necesarios
                - Cronograma estimado
                """,
                agent=self.manager,
            )

            # Tarea 2: Especialista ejecuta
            task_execution = Task(
                description=f"""
                Basándote en el plan del Manager, ejecuta la siguiente tarea:

                TÍTULO: {title}
                DESCRIPCIÓN: {description}

                Debes:
                1. Seguir el plan del Manager
                2. Realizar investigación si es necesario
                3. Producir un resultado de alta calidad
                4. Documentar el proceso
                """,
                expected_output="""
                Un resultado completo y documentado que incluya:
                - Análisis o contenido producido
                - Pasos realizados
                - Conclusiones
                - Cualquier dato o evidencia relevante
                """,
                agent=self.specialist,
                context=[task_planning],
            )

            # Tarea 3: QA revisa
            task_review = Task(
                description=f"""
                Revisa exhaustivamente el trabajo completado en la tarea anterior.

                Requerimiento original:
                TÍTULO: {title}
                DESCRIPCIÓN: {description}

                Debes:
                1. Validar que el resultado cumple con los requerimientos
                2. Buscar errores o inconsistencias
                3. Proponer mejoras si es necesario
                4. Dar aprobación o indicar cambios requeridos
                """,
                expected_output="""
                Un reporte de QA que incluya:
                - Validación de requerimientos
                - Errores encontrados (si existen)
                - Mejoras propuestas
                - Aprobación final o cambios requeridos
                - Calidad general del resultado
                """,
                agent=self.qa,
                context=[task_execution],
            )

            # Crear Crew (equipo de trabajo)
            crew = Crew(
                agents=[self.manager, self.specialist, self.qa],
                tasks=[task_planning, task_execution, task_review],
                verbose=settings.CREW_VERBOSE,
                memory=settings.CREW_MEMORY,
            )

            # Ejecutar
            logger.info(f"🚀 Ejecutando crew para tarea: {self.task_id}")
            result = crew.kickoff()

            # Notificar conclusión
            event_publisher.publish_event(
                agent="Manager",
                action="completada",
                message=f"Tarea completada: {title}",
                task_id=self.task_id,
            )

            return {"status": "completed", "result": str(result), "task_id": self.task_id}

        except Exception as e:
            logger.error(f"❌ Error ejecutando crew: {e}")
            event_publisher.publish_event(
                agent="Manager",
                action="error",
                message=f"Error en tarea: {str(e)}",
                task_id=self.task_id,
            )
            return {
                "status": "failed",
                "error": str(e),
                "task_id": self.task_id,
            }
