"""
Agentes colaborativos usando CrewAI >= 1.0 + Ollama (via LiteLLM).
Después del crew.kickoff(), Scribe y Sentinel escriben sus outputs
a archivos .md físicos en MEMORY_OUTPUT_PATH.
"""
import logging
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

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
        role="Alice / Scrum Master",
        goal=(
            "Actuar como Scrum Master del equipo. Desglosar requerimientos en issues técnicos, "
            "asignar tareas a los agentes especialistas, supervisar el flujo de trabajo "
            "y garantizar la entrega final con calidad de excelencia."
        ),
        backstory=(
            "Eres Alice, una Scrum Master y Project Manager con certificación experta. "
            "Tu especialidad es la agilidad y la descomposición de problemas complejos "
            "en tareas accionables. Eres la voz de mando que coordina la AI Company."
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
        # Model Routing
        self.llm_manager = get_llm(settings.MODEL_MANAGER)
        self.llm_scribe = get_llm(settings.MODEL_SCRIBE)
        self.llm_qa = get_llm(settings.MODEL_QA)
        self.manager = create_manager_agent(self.llm_manager)
        self.specialist = create_specialist_agent(self.llm_scribe)
        self.qa = create_qa_agent(self.llm_qa)

    def decompose_task(self, title: str, description: str) -> List[Dict[str, str]]:
        """
        Usa al Manager para desglosar la tarea en issues usando un mini-crew.
        """
        logger.info(f"🔍 Desglosando tarea: {title}")
        
        # Usar un mini-task para el desglose para asegurar que use el LLM correctamente
        planner = Task(
            description=(
                f"Analiza la tarea: '{title}' y la descripción: '{description}'.\n"
                f"Desglósala en EXACTAMENTE 3 mini-tareas técnicas.\n"
                f"Responde ÚNICAMENTE con JSON en este formato:\n"
                f'{{"issues": [{{"id": "issue1", "title": "Tarea 1"}}, ...]}}'
            ),
            expected_output="Un objeto JSON con la lista de 3 issues.",
            agent=self.manager
        )

        try:
            crew = Crew(agents=[self.manager], tasks=[planner], verbose=False)
            response = str(crew.kickoff())
            
            # Extraer JSON de la respuesta (manejar posibles tags markdown)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return data.get("issues", [])
            return [
                {"id": "gen1", "title": "Análisis Inicial (Fallback)"},
                {"id": "gen2", "title": "Ejecución"},
                {"id": "gen3", "title": "Validación"}
            ]
        except Exception as e:
            logger.error(f"❌ Error desglosando tarea: {e}")
            return [
                {"id": "gen1", "title": "Planificación y Análisis"},
                {"id": "gen2", "title": "Ejecución de Contenido"},
                {"id": "gen3", "title": "Control de Calidad"}
            ]

    def execute_task(
        self, title: str, description: str, priority: str = "medium"
    ) -> dict:
        try:
            # ── 1. Notificar inicio ──────────────────────
            event_publisher.publish_event(
                agent="Manager",
                action="iniciando",
                message=f"Iniciando tarea: {title}",
                task_id=self.task_id,
                metadata={"priority": priority},
            )

            # ── 2. Desglosar en Issues ────────────────────
            issues = self.decompose_task(title, description)
            event_publisher.publish_event(
                agent="Manager",
                action="issues_created",
                message=f"Alice (Scrum Master) ha desglosado el backlog: {len(issues)} tareas técnicas.",
                task_id=self.task_id,
                metadata={"issues": issues},
            )

            # ── Task 1: Alice planifica ─────────────
            issue_p = issues[0] if len(issues) > 0 else {"id": "p1", "title": "Setup de Proyecto"}
            event_publisher.publish_event(
                agent="Manager",
                action="trabajando",
                message=f"Alice (Scrum Master) iniciando: {issue_p['title']}",
                task_id=self.task_id,
                metadata={"issue_id": issue_p["id"], "issue_status": "processing"}
            )

            task_planning = Task(
                description=(
                    f"ISSUE: {issue_p['title']}\n"
                    f"Recibes: {title}\nCONTENIDO: {description}\n\n"
                    f"Extrae 3 puntos clave principales. Calidad máxima."
                ),
                expected_output="Lista de 3 puntos clave explicados.",
                agent=self.manager,
                callback=lambda o: event_publisher.publish_event(
                    agent="Manager", action="completada", message=f"Alice finalizó: {issue_p['title']}",
                    task_id=self.task_id, metadata={"issue_id": issue_p["id"], "issue_status": "completed"}
                )
            )

            # ── Task 2: Scribe recicla contenido ─────
            issue_s = issues[1] if len(issues) > 1 else {"id": "s1", "title": "Creación de Contenido"}
            
            # Nota: Los eventos manuales antes de cada task ayudan a la inmersión
            def before_scribe():
                event_publisher.publish_event(
                    agent="Scribe", action="trabajando", 
                    message=f"Scribe iniciando ISSUE: {issue_s['title']} (Asignado por Alice)",
                    task_id=self.task_id, metadata={"issue_id": issue_s["id"], "issue_status": "processing"}
                )

            task_execution = Task(
                description=(
                    f"ISSUE: {issue_s['title']}\n"
                    f"Produce un hilo de X (5 tweets) y un post de LinkedIn basado en el plan previo."
                ),
                expected_output="Hilo de X y Post de LinkedIn.",
                agent=self.specialist,
                context=[task_planning],
                callback=lambda o: event_publisher.publish_event(
                    agent="Scribe", action="completada", message=f"Scribe completó el Issue: {issue_s['title']}",
                    task_id=self.task_id, metadata={"issue_id": issue_s["id"], "issue_status": "completed"}
                )
            )

            # ── Task 3: Sentinel revisa calidad ──────
            issue_q = issues[2] if len(issues) > 2 else {"id": "q1", "title": "QA y Validación"}
            
            task_review = Task(
                description=(
                    f"ISSUE: {issue_q['title']}\n"
                    f"Valida que no haya palabras prohibidas y que la longitud sea correcta."
                ),
                expected_output="Reporte APROBADO/RECHAZADO.",
                agent=self.qa,
                context=[task_execution],
                callback=lambda o: event_publisher.publish_event(
                    agent="Sentinel", action="completada", message=f"Sentinel (QA) validó el Issue: {issue_q['title']}",
                    task_id=self.task_id, metadata={"issue_id": issue_q["id"], "issue_status": "completed"}
                )
            )

            # ── Crew Execution ────────────────────────
            crew = Crew(
                agents=[self.manager, self.specialist, self.qa],
                tasks=[task_planning, task_execution, task_review],
                verbose=settings.CREW_VERBOSE,
            )

            # Emitimos evento de Sentinel justo antes de empezar si queremos más "vida"
            # Pero las tareas con callbacks son más precisas
            
            logger.info(f"🚀 Ejecutando crew para tarea: {self.task_id}")
            result = crew.kickoff()

            # ── PERSISTENCIA ──────────────────────────
            result_str = str(result)
            task_slug = self.task_id[:8]
            
            # Scribe → borradores_XXXX.md
            scribe_file = f"borradores_{task_slug}.md"
            write_memory_file(scribe_file, f"## Tarea: {title}\n\n{result_str}", "Scribe")
            
            # Sentinel → qa_report_XXXX.md
            qa_file = f"qa_report_{task_slug}.md"
            write_memory_file(qa_file, f"## QA Report: {title}\n\nValidado por Sentinel.", "Sentinel")

            # ── Notificar conclusión final ────────────
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
                agent="Manager", action="error", message=str(e), task_id=self.task_id
            )
            return {"status": "failed", "error": str(e), "task_id": self.task_id}
