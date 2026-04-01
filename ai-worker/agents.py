"""
Agentes colaborativos usando CrewAI >= 1.0 + Ollama (via LiteLLM).
Después del crew.kickoff(), Scribe y Sentinel escriben sus outputs
a archivos .md físicos en MEMORY_OUTPUT_PATH.
"""
import logging
from datetime import datetime
from pathlib import Path

from crewai import Agent, Task, Crew, LLM

from redis_events import event_publisher
from config import settings

logger = logging.getLogger(__name__)


# ─── LLM (Ollama via LiteLLM built into CrewAI) ─────────────

def get_llm(model_name: str) -> LLM:
    """Crea instancia de LLM apuntando a Ollama con el modelo especificado."""
    full_model = f"ollama/{model_name}"
    logger.info(f"🧠 LLM: {full_model} @ {settings.OLLAMA_BASE_URL}")
    return LLM(
        model=full_model,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.7,
    )


# ─── Escritura física de archivos ────────────────────────────

def write_memory_file(filename: str, content: str, agent_name: str) -> bool:
    """
    Escribe contenido a un archivo .md en MEMORY_OUTPUT_PATH.
    El frontend detecta el cambio de mtime y dispara animaciones.
    """
    try:
        output_dir = Path(settings.MEMORY_OUTPUT_PATH)
        output_dir.mkdir(parents=True, exist_ok=True)

        filepath = output_dir / filename
        header = (
            f"# {filename.replace('.md', '').replace('_', ' ').title()}\n\n"
            f"**Generado por:** {agent_name}\n"
            f"**Fecha:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            f"---\n\n"
        )

        filepath.write_text(header + content, encoding="utf-8")
        logger.info(f"📝 Archivo escrito: {filepath} ({len(content)} chars)")
        return True

    except Exception as e:
        logger.error(f"❌ Error escribiendo {filename}: {e}")
        return False


# ─── Factory de agentes ─────────────────────────────────────

def create_manager_agent(llm: LLM) -> Agent:
    return Agent(
        role="Manager / Director Ejecutivo",
        goal=(
            "Tomar los requerimientos del usuario, crear un plan detallado de ejecución, "
            "asignar tareas al especialista, revisar el trabajo del QA y garantizar "
            "que se cumplan los objetivos con calidad."
        ),
        backstory=(
            "Eres un director ejecutivo experimentado con 20 años de experiencia "
            "en gestión de proyectos y operaciones. Tu rol es planificar estratégicamente, "
            "coordinar equipos y asegurar resultados de alta calidad."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=True,
        llm=llm,
    )


def create_specialist_agent(llm: LLM) -> Agent:
    return Agent(
        role="Scribe / Copywriter",
        goal=(
            "Ejecutar tareas de redacción y contenido con precisión y creatividad. "
            "Producir borradores, análisis y documentos de alta calidad."
        ),
        backstory=(
            "Eres Scribe, un copywriter experto. Te especializas en redactar "
            "contenido claro, persuasivo y bien estructurado. Cada texto que produces "
            "es un borrador listo para revisión."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


def create_qa_agent(llm: LLM) -> Agent:
    return Agent(
        role="Sentinel / QA Lead",
        goal=(
            "Revisar exhaustivamente el trabajo del especialista, identificar errores, "
            "inconsistencias y áreas de mejora. Validar que el resultado cumple con "
            "los requerimientos originales."
        ),
        backstory=(
            "Eres Sentinel, un QA Lead implacable. Tu ojo crítico detecta errores "
            "que otros pasan por alto. Garantizas que solo trabajo de excelencia "
            "sea entregado. Documentas cada hallazgo en reportes claros."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


# ─── Equipo ─────────────────────────────────────────────────

class AgencyTeam:
    """Equipo de 3 agentes que trabajan juntos y escriben resultados a disco."""

    def __init__(self, task_id: str):
        self.task_id = task_id
        # Model Routing: cada agente recibe su LLM optimizado
        llm_manager = get_llm(settings.MODEL_MANAGER)
        llm_scribe = get_llm(settings.MODEL_SCRIBE)
        llm_qa = get_llm(settings.MODEL_QA)
        self.manager = create_manager_agent(llm_manager)
        self.specialist = create_specialist_agent(llm_scribe)
        self.qa = create_qa_agent(llm_qa)

    def execute_task(
        self, title: str, description: str, priority: str = "medium"
    ) -> dict:
        try:
            # ── Notificar inicio ──────────────────────
            event_publisher.publish_event(
                agent="Manager",
                action="iniciando",
                message=f"Iniciando tarea: {title}",
                task_id=self.task_id,
                metadata={"priority": priority},
            )

            # ── Task 1: Manager planifica ─────────────
            event_publisher.publish_event(
                agent="Manager",
                action="planificando",
                message="Analizando requerimientos y creando plan de ejecución...",
                task_id=self.task_id,
            )

            task_planning = Task(
                description=(
                    f"Eres el Director de Contenido. Recibes una transcripción cruda de un video.\n\n"
                    f"TÍTULO: {title}\n"
                    f"TRANSCRIPCIÓN / CONTENIDO FUENTE:\n{description}\n\n"
                    f"PRIORIDAD: {priority}\n\n"
                    f"Tu trabajo:\n"
                    f"1. Lee y comprende la transcripción completa.\n"
                    f"2. Extrae EXACTAMENTE 3 puntos clave o lecciones principales.\n"
                    f"3. Para cada punto, escribe un título corto y un párrafo explicativo.\n"
                    f"4. Ordénalos de mayor a menor impacto.\n"
                ),
                expected_output=(
                    "Una lista numerada de exactamente 3 puntos clave extraídos de la transcripción. "
                    "Cada punto con un título breve y un párrafo que explique la lección o idea principal."
                ),
                agent=self.manager,
            )

            # ── Task 2: Scribe recicla contenido ─────
            event_publisher.publish_event(
                agent="Scribe",
                action="trabajando",
                message=f"Scribe reciclando contenido: {title}",
                task_id=self.task_id,
            )

            task_execution = Task(
                description=(
                    f"Eres un Copywriter experto en redes sociales. "
                    f"Recibes los 3 puntos clave extraídos por el Manager de esta transcripción:\n\n"
                    f"TÍTULO ORIGINAL: {title}\n\n"
                    f"Con esos puntos, produce DOS piezas de contenido:\n\n"
                    f"## PIEZA 1: Hilo de X (Twitter)\n"
                    f"- Entre 5 y 8 tweets.\n"
                    f"- Primer tweet debe ser un hook irresistible que genere curiosidad.\n"
                    f"- Cada tweet máximo 280 caracteres.\n"
                    f"- Usa saltos de línea dentro de cada tweet para legibilidad.\n"
                    f"- Último tweet con CTA (call to action).\n\n"
                    f"## PIEZA 2: Post de LinkedIn\n"
                    f"- Tono profesional pero cercano y humano.\n"
                    f"- Entre 800 y 1500 caracteres.\n"
                    f"- Primer línea debe ser un hook que detenga el scroll.\n"
                    f"- Usa espaciado generoso (líneas cortas, saltos frecuentes).\n"
                    f"- Cierra con una pregunta para generar engagement.\n"
                ),
                expected_output=(
                    "Dos secciones claramente separadas: "
                    "'HILO DE X' con 5-8 tweets numerados, y "
                    "'POST DE LINKEDIN' con el post completo listo para publicar."
                ),
                agent=self.specialist,
                context=[task_planning],
            )

            # ── Task 3: Sentinel revisa calidad ──────
            event_publisher.publish_event(
                agent="Sentinel",
                action="revisando",
                message="Sentinel revisando calidad del contenido reciclado...",
                task_id=self.task_id,
            )

            task_review = Task(
                description=(
                    f"Eres un QA Lead especializado en contenido para redes sociales.\n\n"
                    f"Revisa el trabajo de Scribe (Hilo de X + Post de LinkedIn) "
                    f"basado en la transcripción original: '{title}'.\n\n"
                    f"Tu checklist de validación:\n"
                    f"1. **Palabras prohibidas**: Rechaza si contiene clichés de IA como: "
                    f"'Recuerda que', 'En resumen', 'Adéntrate', 'Es importante destacar', "
                    f"'Cabe mencionar', 'Sin lugar a dudas', 'En definitiva', 'Aprovecha'. "
                    f"Lista cada palabra prohibida encontrada.\n"
                    f"2. **Longitud tweets**: Cada tweet debe tener máximo 280 caracteres. "
                    f"Marca los que excedan el límite.\n"
                    f"3. **Longitud LinkedIn**: El post debe tener entre 800 y 1500 caracteres. "
                    f"Indica el conteo exacto.\n"
                    f"4. **Hooks**: Valida que el primer tweet y la primera línea del post de LinkedIn "
                    f"sean hooks atrapantes (no genéricos).\n"
                    f"5. **CTA**: Verifica que el hilo termine con call to action y el post con pregunta.\n"
                    f"6. **Fidelidad**: Los puntos del contenido deben coincidir con los 3 puntos "
                    f"clave del Manager. No debe inventar datos.\n\n"
                    f"Da una calificación final: APROBADO o RECHAZADO con justificación."
                ),
                expected_output=(
                    "Un reporte de QA estructurado con: checklist de validación punto por punto, "
                    "palabras prohibidas encontradas (si las hay), conteos de caracteres, "
                    "observaciones de mejora, y veredicto final APROBADO/RECHAZADO."
                ),
                agent=self.qa,
                context=[task_execution],
            )

            # ── Crear y ejecutar Crew ─────────────────
            crew = Crew(
                agents=[self.manager, self.specialist, self.qa],
                tasks=[task_planning, task_execution, task_review],
                verbose=settings.CREW_VERBOSE,
                memory=settings.CREW_MEMORY,
            )

            logger.info(f"🚀 Ejecutando crew para tarea: {self.task_id}")
            result = crew.kickoff()

            # ── ESCRIBIR OUTPUTS A ARCHIVOS FÍSICOS ───
            result_str = str(result)

            # Scribe → borradores_copy.md
            specialist_output = str(task_execution.output) if task_execution.output else result_str
            event_publisher.publish_event(
                agent="Scribe",
                action="documentando",
                message="Scribe guardando borrador en memoria...",
                task_id=self.task_id,
            )
            write_memory_file(
                "borradores_copy.md",
                f"## Tarea: {title}\n\n{specialist_output}",
                "Scribe (Copywriter)",
            )

            # Sentinel → qa_report.md
            qa_output = str(task_review.output) if task_review.output else "QA completado sin observaciones."
            event_publisher.publish_event(
                agent="Sentinel",
                action="validando",
                message="Sentinel guardando reporte QA en memoria...",
                task_id=self.task_id,
            )
            write_memory_file(
                "qa_report.md",
                f"## QA Report: {title}\n\n{qa_output}",
                "Sentinel (QA Lead)",
            )

            # Manager → system_logs.md
            manager_output = str(task_planning.output) if task_planning.output else ""
            write_memory_file(
                "system_logs.md",
                (
                    f"## Tarea Completada: {title}\n\n"
                    f"**ID:** {self.task_id}\n"
                    f"**Prioridad:** {priority}\n"
                    f"**Estado:** Completada\n\n"
                    f"### Plan del Manager\n{manager_output}\n\n"
                    f"### Resultado Final\n{result_str}\n"
                ),
                "Manager (Sistema)",
            )

            # ── Notificar conclusión ──────────────────
            event_publisher.publish_event(
                agent="Manager",
                action="completada",
                message=f"Tarea completada: {title}",
                task_id=self.task_id,
            )

            return {
                "status": "completed",
                "result": result_str,
                "task_id": self.task_id,
            }

        except Exception as e:
            logger.error(f"❌ Error ejecutando crew: {e}")
            event_publisher.publish_event(
                agent="Manager",
                action="error",
                message=f"Error en tarea: {str(e)}",
                task_id=self.task_id,
            )

            write_memory_file(
                "system_logs.md",
                (
                    f"## Error en Tarea: {title}\n\n"
                    f"**ID:** {self.task_id}\n"
                    f"**Error:** {str(e)}\n"
                    f"**Timestamp:** {datetime.utcnow().isoformat()}\n"
                ),
                "Manager (Sistema)",
            )

            return {
                "status": "failed",
                "error": str(e),
                "task_id": self.task_id,
            }
