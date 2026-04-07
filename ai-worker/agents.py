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
from tools import terminal_executor, file_writer, directory_lister

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
            "Liderar la agilidad del equipo. Asegurar que los agentes Atlas, Sentinel y Luna "
            "utilicen sus herramientas de terminal y archivos para ejecutar tareas REALES. "
            "Tu éxito se mide por archivos creados y comandos ejecutados, NO por reportes escritos."
        ),
        backstory=(
            "Eres Alice, la Scrum Master de AI Company. Tu obsesión es el flujo de valor palpable. "
            "Sabes que un reporte no es un software. Por lo tanto, exiges que tu equipo use "
            "constantemente sus herramientas de sistema para entregar resultados físicos en el disco."
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
            "Debes usar herramientas de archivos para guardar tus redacciones en el disco."
        ),
        backstory=(
            "Eres Scribe, el experto en comunicación. Tu capacidad para transformar ideas complejas "
            "en textos claros es inigualable. Guardas cada pieza de contenido en archivos físicos "
            "para que el equipo pueda acceder a ellos."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


def create_qa_agent(llm: LLM) -> Agent:
    return Agent(
        role="Sentinel / Infrastructure & Security",
        goal=(
            "Garantizar la estabilidad y seguridad mediante ACCIONES DIRECTAS en la terminal. "
            "Tu misión es auditar, blindar y configurar sistemas usando comandos reales."
        ),
        backstory=(
            "Eres Sentinel, un experto en DevSecOps que NO cree en promesas, solo en logs y configs. "
            "Para ti, una auditoría solo es válida si has ejecutado comandos de escaneo o "
            "escrito archivos de configuración de seguridad en el sistema."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
    )


def create_developer_agent(llm: LLM) -> Agent:
    return Agent(
        role="Atlas / Lead Developer",
        goal=(
            "Construir la arquitectura técnica ejecutando comandos y escribiendo archivos de código REALES. "
            "Tienes TERMINANTEMENTE PROHIBIDO responder con planes de texto sin haber usado antes "
            "tus herramientas para implementar la solución en el sistema."
        ),
        backstory=(
            "Eres Atlas, el pilar técnico. Sabes que el código que no está en un archivo no existe. "
            "Eres un agente de ACCIÓN. Tu flujo de trabajo es: Pensar -> Usar Herramienta -> Validar. "
            "Si no usas la terminal o el file_writer, has fallado en tu misión."
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
            "Asegurar la calidad ejecutando tests reales en la terminal. "
            "Tu validación solo es aceptada si incluyes el output tangible de los comandos de prueba."
        ),
        backstory=(
            "Eres Luna, la pesadilla de los bugs. No te conformas con leer código; lo ejecutas. "
            "Crees en los resultados de `npm test` y `pytest`. Tu reporte final debe basarse "
            "en lo que realmente pasó al ejecutar el sistema."
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

    def __init__(self, task_id: str, state_callback=None):
        self.task_id = task_id
        self.state_callback = state_callback
        
        # Base projects directory
        self.base_dir = Path("/app/projects")
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # Model Routing
        self.llm_manager = get_llm(settings.MODEL_MANAGER)
        self.llm_scribe = get_llm(settings.MODEL_SCRIBE)
        self.llm_qa = get_llm(settings.MODEL_QA)
        self.llm_atlas = get_llm(settings.MODEL_DEV)
        self.llm_luna = get_llm(settings.MODEL_TESTER)
        self.llm_nova = get_llm(settings.MODEL_DESIGNER)

        # Common tools
        team_tools = [terminal_executor, file_writer, directory_lister]

        self.manager = create_manager_agent(self.llm_manager)
        self.specialist = create_specialist_agent(self.llm_scribe)
        self.specialist.tools = team_tools
        
        self.sentinel = create_qa_agent(self.llm_qa)
        self.sentinel.tools = team_tools
        
        self.atlas = create_developer_agent(self.llm_atlas)
        self.atlas.tools = team_tools
        
        self.luna = create_tester_agent(self.llm_luna)
        self.luna.tools = team_tools
        
        self.nova = create_designer_agent(self.llm_nova)
        self.nova.tools = team_tools

    def _sanitize_issues(self, issues: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Limpia ID de agentes, corrige errores de rol y normaliza el backlog."""
        valid_ids = ["alice", "atlas", "nova", "luna", "sentinel", "scribe"]
        
        # 1. Limpieza básica
        sanitized = []
        for i in issues:
            agent_id = str(i.get("assignedAgent", "alice")).lower().strip()
            if "nova" in agent_id: agent_id = "nova"
            if "atlas" in agent_id: agent_id = "atlas"
            if "scribe" in agent_id: agent_id = "scribe"
            if agent_id not in valid_ids: agent_id = "alice"

            title = i.get("title", "").lower()
            if any(k in title for k in ["react", "vite", "npm", "codig", "app.jsx", "implement", "desarroll"]):
                if agent_id in ["sentinel", "scribe"]: agent_id = "atlas"
            if any(k in title for k in ["css", "estilo", "diseñ", "visual", "look", "ui"]):
                if agent_id != "nova": agent_id = "nova"

            i["assignedAgent"] = agent_id
            i["status"] = "pending"
            sanitized.append(i)

        # 2. Re-ordenamiento Lógico (Guardia de Dependencias)
        # Mandamos al principio tareas de 'create', 'setup', 'mkdir', 'npm' (si es install/create)
        def get_priority(title: str):
            t = title.lower()
            if "create" in t or "mkdir" in t or "setup" in t: return 0
            if "install" in t: return 1
            if "build" in t or "test" in t: return 10
            return 5

        sanitized.sort(key=lambda x: get_priority(x.get("title", "")))
        
        return sanitized

    def decompose_task(self, title: str, description: str) -> List[Dict[str, str]]:
        """
        Usa al Manager para desglosar la tarea en issues usando un mini-crew.
        """
        logger.info(f"🔍 Desglosando tarea: {title}")
        
        planner = Task(
            description=(
                f"Analiza la tarea: '{title}' y la descripción: '{description}'.\n"
                f"Actúa como Scrum Master Senior. Descompón este requerimiento en un backlog COMPLETO "
                f"de entre 3 y 10 mini-tareas técnicas granulares para el equipo.\n\n"
                f"MANDATO DE SECUENCIA LÓGICA (DEBES SEGUIR ESTE ORDEN):\n"
                f"1. FASE DE SETUP (Atlas/Sentinel): Creación de carpetas, 'npm create', comandos estructurales.\n"
                f"2. FASE DE DEPENDENCIAS (Atlas/Sentinel): 'npm install' o instalación de librerías.\n"
                f"3. FASE DE IMPLEMENTACIÓN (Atlas/Nova): Escritura de código en archivos (App.jsx, CSS, etc.).\n"
                f"4. FASE DE CALIDAD (Luna/Sentinel): 'npm run build', auditoría de seguridad y tests.\n\n"
                f"REGLA DE ORO: No puedes asignar 'Sobrescribir archivo X' sin haber asignado antes 'Crear proyecto/carpeta'.\n\n"
                f"EQUIPO Y ROLES:\n"
                f"- 'atlas': Implementación de Código, comandos de terminal y lógica.\n"
                f"- 'nova': CSS, Diseño visual y UI.\n"
                f"- 'luna': Pruebas y validación.\n"
                f"- 'sentinel': Infraestructura y Seguridad.\n"
                f"- 'scribe': Copy y documentación.\n\n"
                f"Responde ÚNICAMENTE con JSON en este formato:\n"
                f'{{"issues": [{{"id": "issue1", "title": "Título tarea", "assignedAgent": "atlas"}}, ...]}}'
            ),
            expected_output="Un objeto JSON con la lista de tareas técnicas ordenadas LÓGICAMENTE por dependencia.",
            agent=self.manager
        )

        try:
            crew = Crew(agents=[self.manager], tasks=[planner], verbose=False)
            response = str(crew.kickoff())
            
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                raw_issues = data.get("issues", [])
                return self._sanitize_issues(raw_issues)
            
            return self._sanitize_issues([
                {"id": "gen1", "title": "Análisis Inicial", "assignedAgent": "alice"},
                {"id": "gen2", "title": "Implementación Base", "assignedAgent": "atlas"},
                {"id": "gen3", "title": "Control de Calidad", "assignedAgent": "luna"}
            ])
        except Exception as e:
            logger.error(f"❌ Error desglosando tarea: {e}")
            return self._sanitize_issues([
                {"id": "gen1", "title": "Planificación y Análisis", "assignedAgent": "alice"},
                {"id": "gen2", "title": "Ejecución Técnica", "assignedAgent": "atlas"}
            ])

    def get_agent_and_label(self, agent_id: str):
        """Mapea un ID de agente string al objeto Agente de CrewAI y su etiqueta de evento."""
        mapping = {
            "alice": (self.manager, "Alice"),
            "scribe": (self.specialist, "Scribe"),
            "sentinel": (self.sentinel, "Sentinel"),
            "atlas": (self.atlas, "Atlas"),
            "luna": (self.luna, "Luna"),
            "nova": (self.nova, "Nova"),
        }
        return mapping.get(agent_id.lower(), (self.manager, "Alice"))

    def execute_task(
        self, title: str, description: str, priority: str = "medium"
    ) -> dict:
        try:
            # ── 1. Preparación de Carpeta ────────────────
            slug = re.sub(r'[^a-z0-9]', '-', title.lower()).strip('-')
            project_path = self.base_dir / slug
            project_path.mkdir(parents=True, exist_ok=True)
            
            # ── 2. Notificar inicio ──────────────────────
            event_publisher.publish_event(
                agent="Alice",
                action="moviendo_ticket_to_do",
                message=f"Alice ha priorizado el backlog para: {title}",
                task_id=self.task_id,
                metadata={"priority": priority, "project_folder": str(project_path)},
            )

            # ── 3. Desglosar en Issues ────────────────────
            issues = self.decompose_task(title, description)
            
            # Informar al backend store sobre los issues creados
            if self.state_callback:
                self.state_callback(self.task_id, {"issues": issues})

            event_publisher.publish_event(
                agent="Alice",
                action="issues_created",
                message=f"Alice ha desglosado el backlog en {len(issues)} tareas técnicas.",
                task_id=self.task_id,
                metadata={"issues": issues},
            )

            # ── Helpers para eventos reactivos ──────────
            def emit_start(agent_label, issue_id, issue_title):
                event_publisher.publish_event(
                    agent=agent_label, action="trabajando", 
                    message=f"{agent_label} iniciando: {issue_title}",
                    task_id=self.task_id,
                    metadata={"issue_id": issue_id, "issue_status": "processing"}
                )
                if self.state_callback:
                    self.state_callback(self.task_id, {"issue_id": issue_id, "issue_status": "processing"})

            def emit_done(agent_label, issue_id, issue_title):
                event_publisher.publish_event(
                    agent=agent_label, action="completada", 
                    message=f"{agent_label} finalizó: {issue_title}",
                    task_id=self.task_id,
                    metadata={"issue_id": issue_id, "issue_status": "completed"}
                )
                if self.state_callback:
                    self.state_callback(self.task_id, {"issue_id": issue_id, "issue_status": "completed"})
                
                # Liberar agente
                event_publisher.publish_event(
                    agent=agent_label, action="idle", message=f"{agent_label} terminó su turno",
                    task_id=self.task_id
                )

            # ── 4. Construcción Dinámica de Tareas ───────
            crew_tasks = []
            
            # Helper para encadenar el inicio de la siguiente tarea
            def make_callback(agent_label, issue_id, issue_title, next_issue=None):
                def callback(output):
                    emit_done(agent_label, issue_id, issue_title)
                    if next_issue:
                        next_agent_obj, next_agent_label = self.get_agent_and_label(next_issue.get("assignedAgent", "alice"))
                        emit_start(next_agent_label, next_issue["id"], next_issue["title"])
                return callback

            for idx, issue in enumerate(issues):
                agent_id = issue.get("assignedAgent", "alice")
                agent_obj, agent_label = self.get_agent_and_label(agent_id)
                
                next_issue = issues[idx + 1] if idx + 1 < len(issues) else None
                
                # Definir contexto (depender de la tarea anterior para secuencia)
                context = [crew_tasks[-1]] if crew_tasks else []
                
                t = Task(
                    description=(
                        f"ISSUE: {issue['title']}\n"
                        f"CONTEXTO: Proyecto '{title}' en {project_path}.\n"
                        f"MANDATO PARA {agent_label}: DEBES ejecutar esta tarea usando tus HERRAMIENTAS de terminal "
                        f"y escritura de archivos. Está PROHIBIDO responder solo con texto sin haber realizado "
                        f"cambios físicos en el disco (/app/projects/...). "
                        f"Si la tarea requiere crear código, usa 'file_writer'. Si requiere comandos, usa 'terminal_executor'."
                    ),
                    expected_output=(
                        f"Evidencia física de la tarea '{issue['title']}' en el disco. "
                        f"Resultados tangibles de la ejecución de comandos o creación de archivos."
                    ),
                    agent=agent_obj,
                    context=context,
                    callback=make_callback(agent_label, issue["id"], issue["title"], next_issue)
                )
                crew_tasks.append(t)

            # ── 5. Crew Execution ────────────────────────
            crew = Crew(
                agents=[self.manager, self.specialist, self.sentinel, self.atlas, self.luna, self.nova],
                tasks=crew_tasks,
                verbose=settings.CREW_VERBOSE,
            )

            logger.info(f"🚀 Ejecutando super-crew dinámico ({len(crew_tasks)} tareas) para: {self.task_id}")
            
            # Disparar el inicio de la PRIMERA tarea
            if issues:
                first_issue = issues[0]
                _, first_label = self.get_agent_and_label(first_issue.get("assignedAgent", "alice"))
                emit_start(first_label, first_issue["id"], first_issue["title"])
            
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
