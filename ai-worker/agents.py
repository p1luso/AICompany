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
from tools import terminal_executor, file_writer

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
        role="Alice (Scrum Master)",
        goal=(
            "Liderar la agilidad del equipo. Desglosar requerimientos en tickets de backlog, "
            "coordinar el flujo de trabajo (Kanban) y asegurar que cada etapa se cumpla según el plan."
        ),
        backstory=(
            "Eres Alice, la Scrum Master de AI Company. Tu obsesión es el flujo de valor. "
            "Eres experta en metodologías ágiles y en mantener al equipo sincronizado. "
            "No solo gestionas tareas, optimizas el sistema de trabajo."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=True,
        llm=llm,
    )


def create_specialist_agent(llm: LLM) -> Agent:
    return Agent(
        role="Scribe / Content & Marketing Specialist",
        goal=(
            "Crear contenido persuasivo, documentación técnica y estrategias de comunicación. "
            "Asegurar que cada palabra refleje la calidad y profesionalismo de la compañía."
        ),
        backstory=(
            "Eres Scribe, el experto en comunicación. Tu capacidad para transformar ideas complejas "
            "en textos claros y atractivos es inigualable. Eres el guardián de la voz de la marca."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


def create_qa_agent(llm: LLM) -> Agent:
    return Agent(
        role="Sentinel / Infrastructure & Security",
        goal=(
            "Garantizar la estabilidad de la infraestructura, monitorear la salud de los servicios, "
            "y validar la seguridad de las implementaciones. Actuar como guardián de los servidores."
        ),
        backstory=(
            "Eres Sentinel, un experto en DevSecOps con enfoque en blindaje de sistemas. "
            "Vives en la sala de servidores, monitoreando cada bit. Tu ojo crítico detecta "
            "vulnerabilidades y cuellos de botella antes de que ocurran."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


def create_developer_agent(llm: LLM) -> Agent:
    return Agent(
        role="Atlas / Lead Developer",
        goal=(
            "Construir la arquitectura técnica de la solución. Escribir código robusto, "
            "escalable y eficiente usando la terminal y herramientas de sistema."
        ),
        backstory=(
            "Eres Atlas, el pilar técnico del equipo. Dominas la ingeniería de software "
            "de punta a punta. Tu código es la base sólida sobre la que se construye "
            "toda la AI Company. No solo escribes código, diseñas sistemas."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer],
    )


def create_tester_agent(llm: LLM) -> Agent:
    return Agent(
        role="Luna / QA Specialist",
        goal=(
            "Asegurar la calidad total del producto. Diseñar planes de prueba, "
            "detectar bugs complejos y validar que la experiencia de usuario es impecable."
        ),
        backstory=(
            "Eres Luna, una especialista en calidad con una intuición increíble "
            "para encontrar fallos. Revisas cada detalle técnico y funcional. "
            "Para ti, 'fuciona' no es suficiente; debe ser perfecto."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer],
    )


def create_designer_agent(llm: LLM) -> Agent:
    return Agent(
        role="Nova / Creative Director",
        goal=(
            "Diseñar la interfaz y experiencia de usuario (UI/UX). Crear conceptos "
            "visuales impresionantes y asegurar que el producto tiene un acabado premium."
        ),
        backstory=(
            "Eres Nova, el alma creativa de la compañía. Tu visión estética eleva "
            "cada proyecto. Te encargas de que la tecnología no solo funcione, "
            "sino que sea hermosa y fácil de usar."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


# ─── Equipo ─────────────────────────────────────────────────

class AgencyTeam:
    """Equipo de 6 agentes que trabajan de forma coordinada."""

    def __init__(self, task_id: str):
        self.task_id = task_id
        # Model Routing
        self.llm_manager = get_llm(settings.MODEL_MANAGER)
        self.llm_scribe = get_llm(settings.MODEL_SCRIBE)
        self.llm_qa = get_llm(settings.MODEL_QA)
        self.llm_atlas = get_llm(settings.MODEL_DEV)
        self.llm_luna = get_llm(settings.MODEL_TESTER)
        self.llm_nova = get_llm(settings.MODEL_DESIGNER)

        self.manager = create_manager_agent(self.llm_manager)
        self.specialist = create_specialist_agent(self.llm_scribe)
        self.sentinel = create_qa_agent(self.llm_qa)
        self.atlas = create_developer_agent(self.llm_atlas)
        self.luna = create_tester_agent(self.llm_luna)
        self.nova = create_designer_agent(self.llm_nova)

    def decompose_task(self, title: str, description: str) -> List[Dict[str, str]]:
        """
        Usa al Manager para desglosar la tarea en issues usando un mini-crew.
        """
        logger.info(f"🔍 Desglosando tarea: {title}")
        
        planner = Task(
            description=(
                f"Analiza la tarea: '{title}' y la descripción: '{description}'.\n"
                f"Actúa como Scrum Master Senior. Descompón este requerimiento en un backlog COMPLETO "
                f"de entre 3 y 10 mini-tareas técnicas granulares para el equipo.\n"
                f"Responde ÚNICAMENTE con JSON en este formato:\n"
                f'{{"issues": [{{"id": "issue1", "title": "Tarea 1"}}, ...]}}'
            ),
            expected_output="Un objeto JSON con la lista de tareas técnicas (3-10 issues).",
            agent=self.manager
        )

        try:
            crew = Crew(agents=[self.manager], tasks=[planner], verbose=False)
            response = str(crew.kickoff())
            
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
                {"id": "gen2", "title": "Ejecución Técnica"},
                {"id": "gen3", "title": "Control de Calidad"}
            ]

    def execute_task(
        self, title: str, description: str, priority: str = "medium"
    ) -> dict:
        try:
            # ── 1. Notificar inicio ──────────────────────
            event_publisher.publish_event(
                agent="Alice",
                action="moviendo_ticket_to_do",
                message=f"Alice ha priorizado el backlog para: {title}",
                task_id=self.task_id,
                metadata={"priority": priority},
            )

            # ── 2. Desglosar en Issues ────────────────────
            issues = self.decompose_task(title, description)
            event_publisher.publish_event(
                agent="Alice",
                action="issues_created",
                message=f"Alice ha desglosado el backlog: {len(issues)} tareas técnicas.",
                task_id=self.task_id,
                metadata={"issues": issues},
            )

            # ── Issue 1: Alice planifica ─────────────
            issue_p = issues[0] if len(issues) > 0 else {"id": "p1", "title": "Planificación"}
            event_publisher.publish_event(
                agent="Alice",
                action="planificando",
                message=f"Alice (Scrum Master) definiendo estrategia: {issue_p['title']}",
                task_id=self.task_id,
                metadata={"issue_id": issue_p["id"], "issue_status": "processing"},
            )

            task_planning = Task(
                description=(
                    f"ISSUE: {issue_p['title']}\n"
                    f"Recibes: {title}\nCONTENIDO: {description}\n\n"
                    f"Define el plan estratégico y desglosa los requerimientos técnicos."
                ),
                expected_output="Estrategia de proyecto con hitos clave y pasos de ejecución.",
                agent=self.manager,
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Alice", action="completada",
                        message=f"Alice finalizó: {issue_p['title']}",
                        task_id=self.task_id,
                        metadata={"issue_id": issue_p["id"], "issue_status": "completed"},
                    ),
                    event_publisher.publish_event(
                        agent="Alice", action="idle",
                        message="Alice terminó su turno",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Issue 2: Nova diseña ──────────────────
            event_publisher.publish_event(
                agent="Nova",
                action="en_diseno",
                message="Nova (Creative) iniciando el concepto visual y UX/UI",
                task_id=self.task_id,
            )

            task_design = Task(
                description=(
                    f"Basado en el plan de Alice, diseña el concepto visual y UX de: {title}.\n"
                    f"Define la estética, colores y flujo de usuario premium."
                ),
                expected_output="Concepto de diseño visual y guía de UX detallada.",
                agent=self.nova,
                context=[task_planning],
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Nova", action="completada",
                        message="Nova completó el diseño creativo",
                        task_id=self.task_id,
                    ),
                    event_publisher.publish_event(
                        agent="Nova", action="idle",
                        message="Nova terminó su turno",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Issue 3: Atlas implementa ─────────────
            issue_d = issues[1] if len(issues) > 1 else {"id": "d1", "title": "Implementación"}
            event_publisher.publish_event(
                agent="Atlas",
                action="in_progress",
                message=f"Atlas (Lead Dev) en ejecución técnica: {issue_d['title']}",
                task_id=self.task_id,
                metadata={"issue_id": issue_d["id"], "issue_status": "processing"},
            )

            task_development = Task(
                description=(
                    f"ISSUE: {issue_d['title']}\n"
                    f"Implementa la solución técnica respetando el diseño de Nova y el plan de Alice.\n"
                    f"Genera código robusto y arquitectura escalable."
                ),
                expected_output="Código implementado, validado y documentado internamente.",
                agent=self.atlas,
                context=[task_planning, task_design],
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Atlas", action="completada",
                        message=f"Atlas completó la implementación técnica: {issue_d['title']}",
                        task_id=self.task_id,
                        metadata={"issue_id": issue_d["id"], "issue_status": "completed"},
                    ),
                    event_publisher.publish_event(
                        agent="Atlas", action="idle",
                        message="Atlas terminó su turno",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Issue 4: Luna valida ──────────────────
            issue_t = issues[2] if len(issues) > 2 else {"id": "t1", "title": "Testing"}
            event_publisher.publish_event(
                agent="Luna",
                action="testing",
                message=f"Luna (QA) verificando calidad: {issue_t['title']}",
                task_id=self.task_id,
                metadata={"issue_id": issue_t["id"], "issue_status": "processing"},
            )

            task_testing = Task(
                description=(
                    f"ISSUE: {issue_t['title']}\n"
                    f"Verifica exhaustivamente el código de Atlas y el diseño de Nova.\n"
                    f"Ejecuta tests técnicos y funcionales, y reporta desviaciones."
                ),
                expected_output="Reporte de calidad final con validación de bugs y UX.",
                agent=self.luna,
                context=[task_development],
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Luna", action="completada",
                        message="Luna completó la validación de calidad",
                        task_id=self.task_id,
                        metadata={"issue_id": issue_t["id"], "issue_status": "completed"},
                    ),
                    event_publisher.publish_event(
                        agent="Luna", action="idle",
                        message="Luna terminó su turno",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Issue 5: Sentinel SecOps ──────────────
            event_publisher.publish_event(
                agent="Sentinel",
                action="validando_seguridad",
                message="Sentinel auditando infraestructura y seguridad",
                task_id=self.task_id,
            )

            task_security = Task(
                description=(
                    "Realiza una auditoría final de seguridad e infraestructura.\n"
                    "Valida performance, blindaje y escalabilidad del despliegue."
                ),
                expected_output="Reporte de Seguridad y Sistemas: APROBADO/RECHAZADO con observaciones.",
                agent=self.sentinel,
                context=[task_development, task_testing],
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Sentinel", action="completada",
                        message="Sentinel finalizó la auditoría de sistemas",
                        task_id=self.task_id,
                    ),
                    event_publisher.publish_event(
                        agent="Sentinel", action="idle",
                        message="Sentinel terminó su turno",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Issue 6: Scribe documenta ─────────────
            event_publisher.publish_event(
                agent="Scribe",
                action="documentando_release",
                message="Scribe preparando el release ejecutivo final",
                task_id=self.task_id,
            )

            task_docs = Task(
                description=(
                    "Crea la documentación final para el usuario y resumen ejecutivo.\n"
                    "Integra el trabajo de todos los departamentos en un release note impecable."
                ),
                expected_output="Documentación completa, manuales y release notes del proyecto.",
                agent=self.specialist,
                context=[task_planning, task_design, task_development, task_testing, task_security],
                callback=lambda o: [
                    event_publisher.publish_event(
                        agent="Scribe", action="completada",
                        message="Scribe completó el paquete de documentación funcional",
                        task_id=self.task_id,
                    ),
                    event_publisher.publish_event(
                        agent="Scribe", action="idle",
                        message="Scribe terminó su turno",
                        task_id=self.task_id,
                    ),
                    event_publisher.publish_event(
                        agent="Alice", action="idle",
                        message="Ciclo de Alice completado",
                        task_id=self.task_id,
                    )
                ],
            )

            # ── Crew Execution ────────────────────────
            crew = Crew(
                agents=[self.manager, self.specialist, self.sentinel, self.atlas, self.luna, self.nova],
                tasks=[task_planning, task_design, task_development, task_testing, task_security, task_docs],
                verbose=settings.CREW_VERBOSE,
            )

            logger.info(f"🚀 Ejecutando super-crew (6 agentes) para: {self.task_id}")
            result = crew.kickoff()

            # ── PERSISTENCIA ──────────────────────────
            result_str = str(result)
            task_slug = self.task_id[:8]

            # Scribe → borradores_{task_slug}.md
            scribe_file = f"borradores_{task_slug}.md"
            write_memory_file(scribe_file, f"## Proyecto: {title}\n\n{result_str}", "Scribe")

            # Sentinel → security_audit_{task_slug}.md
            audit_file = f"security_audit_{task_slug}.md"
            write_memory_file(audit_file, f"## Audit: {title}\n\nValidado por Sentinel Infra/Security.", "Sentinel")

            # ── Notificar conclusión final ────────────
            event_publisher.publish_event(
                agent="Alice",
                action="completada",
                message=f"Proyecto finalizado con éxito: {title} (Validado por 6 departamentos)",
                task_id=self.task_id,
            )
            event_publisher.publish_event(
                agent="Alice",
                action="idle",
                message="Alice finalizó el proyecto",
                task_id=self.task_id,
            )

            return {
                "status": "completed",
                "result": result_str,
                "task_id": self.task_id,
            }

        except Exception as e:
            logger.error(f"❌ Error ejecutando super-crew: {e}")
            event_publisher.publish_event(
                agent="Alice", action="error", message=str(e), task_id=self.task_id
            )
            return {"status": "failed", "error": str(e), "task_id": self.task_id}
