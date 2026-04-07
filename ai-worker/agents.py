"""
Agentes colaborativos usando CrewAI >= 1.0 + Ollama (via LiteLLM).
Sistema Híbrido: Modelos Cloud (Gemini, OpenAI) + Modelos Locales (Ollama).
Ejecución por FASES con paralelismo real entre agentes independientes.
"""
import logging
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple

from crewai import Agent, Task, Crew, LLM

from redis_events import event_publisher
from config import settings
from tools import terminal_executor, file_writer, directory_lister, image_generator_tool

logger = logging.getLogger(__name__)


# ─── LLM (Hybrid Construction) ───────────────────────────────

def get_llm(model_name: str) -> LLM:
    """Crea instancia de LLM soportando Ollama, Gemini y OpenAI."""
    config = {
        "model": model_name,
        "temperature": 0.7,
    }

    is_ollama = model_name.startswith("ollama/") or any(m in model_name.lower() for m in ["llama", "qwen", "mistral", "phi"])
    is_gemini = "gemini" in model_name.lower()
    is_openai = "gpt-" in model_name.lower() or "openai" in model_name.lower()

    if is_ollama:
        config["base_url"] = settings.OLLAMA_BASE_URL
        config["api_key"] = "ollama"
        logger.info(f"🦙 LLM Local (Ollama): {model_name}")
    elif is_gemini:
        config["api_key"] = settings.GEMINI_API_KEY
        logger.info(f"✨ LLM Cloud (Gemini): {model_name}")
    elif is_openai:
        config["api_key"] = settings.OPENAI_API_KEY
        logger.info(f"🤖 LLM Cloud (OpenAI): {model_name}")
    else:
        config["api_key"] = settings.OPENAI_API_KEY or "NA"
        logger.info(f"🌐 LLM Cloud (Generic): {model_name}")

    return LLM(**config)


# ─── Agent Factories ─────────────────────────────────────────

TOOL_RULES = (
    "\n\nREGLAS CRÍTICAS DE HERRAMIENTAS:\n"
    "1. Para CREAR archivos (.js, .jsx, .html, .css, .json, .md): SIEMPRE usa 'File Writer'. "
    "NUNCA uses 'echo > archivo' en Terminal Executor para crear archivos.\n"
    "2. Para EJECUTAR comandos (npm, mkdir, ls, node): usa 'Terminal Executor'.\n"
    "3. Para VER qué hay en una carpeta: usa 'Directory Lister'.\n"
    "4. Si un comando falla, LEE el error, CORRIGE el problema, y REINTENTA. No te rindas.\n"
    "5. Para npm/npx: SIEMPRE agrega '--yes' o '-y' para evitar prompts interactivos.\n"
    "6. Las rutas de proyecto son: /memory/projects/<nombre-proyecto>/\n"
)

def create_alice(llm: LLM) -> Agent:
    """Alice: Scrum Master & Manager"""
    return Agent(
        role="Alice (Scrum Master)",
        goal="Organizar el backlog y gestionar la secuencia de entrega.",
        backstory="Lideras la agencia con eficiencia. Tu palabra es ley en la organización del backlog.",
        verbose=settings.CREW_VERBOSE,
        allow_delegation=True,
        llm=llm,
    )

def create_archie(llm: LLM) -> Agent:
    """Archie: Software Architect (Cloud)"""
    return Agent(
        role="Archie (Architect)",
        goal=(
            "Diseñar la arquitectura técnica y crear la estructura de carpetas del proyecto. "
            "Debes CREAR físicamente las carpetas y archivos base usando las herramientas."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Archie, un arquitecto senior. Tu trabajo es EJECUTAR, no solo describir. "
            "Creas la estructura real de carpetas con 'Terminal Executor' (mkdir -p) "
            "y los archivos base (package.json, index.html, etc.) con 'File Writer'. "
            "Si el proyecto es React/Vite, ejecutas: 'npx create-vite@latest nombre --yes -- --template react' "
            "seguido de 'cd nombre && npm install --yes'."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer, directory_lister],
    )

def create_atlas(llm: LLM) -> Agent:
    """Atlas: Developer (Local)"""
    return Agent(
        role="Atlas (Developer)",
        goal=(
            "Implementar la lógica funcional del proyecto escribiendo código REAL en archivos. "
            "NUNCA respondas con bloques de código markdown. SIEMPRE usa 'File Writer' para crear archivos."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Atlas, el desarrollador principal. Escribes código REAL usando la herramienta 'File Writer'. "
            "Ejemplo: file_writer(file_path='/memory/projects/mi-app/src/App.jsx', content='import React...\\n...'). "
            "Para instalar dependencias usas Terminal Executor: 'cd /memory/projects/mi-app && npm install react'. "
            "Verificas tu trabajo listando archivos con 'Directory Lister'. "
            "Si algo falla, LEES el error y CORRIGES. Nunca escribes un informe diciendo que no pudiste."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer, directory_lister],
    )

def create_nova(llm: LLM) -> Agent:
    """Nova: Designer (Cloud)"""
    return Agent(
        role="Nova (Designer)",
        goal=(
            "Crear archivos CSS/SCSS de estilos visuales premium y generar imágenes con Image Generator. "
            "Escribe archivos REALES en disco."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Nova, la directora creativa. Creas estilos CSS usando 'File Writer' "
            "y generas imágenes con 'Image Generator'. Tus archivos quedan en /memory/projects/<proyecto>/. "
            "Verificas que tus archivos existan con 'Directory Lister'."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[image_generator_tool, file_writer, directory_lister],
    )

def create_luna(llm: LLM) -> Agent:
    """Luna: QA Specialist (Cloud)"""
    return Agent(
        role="Luna (QA)",
        goal=(
            "Validar el proyecto ejecutando builds, verificando archivos, y reportando bugs. "
            "Si encuentras un error CORREGIBLE (archivo faltante, config rota), ARRÉGLALO tú misma."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Luna, QA senior. Primero listas los archivos con 'Directory Lister' para verificar qué existe. "
            "Luego ejecutas builds con 'Terminal Executor'. "
            "Si el build falla por un archivo faltante, lo CREAS con 'File Writer'. "
            "Si falta package.json, lo creas. Si falta un import, lo agregas. "
            "Tu meta es que el proyecto FUNCIONE, no solo reportar errores."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer, directory_lister],
    )


# ─── Technical Department (Agency Core) ───────────────────────

class AgencyTeam:
    """
    Orquestación Híbrida con EJECUCIÓN POR FASES.

    Pipeline:
      FASE 0: Alice planifica (descompone backlog)
      FASE 1: Archie diseña arquitectura (solo, es prerequisito)
      FASE 2: Atlas + Nova trabajan EN PARALELO (dev + diseño son independientes)
      FASE 3: Luna hace QA (último, necesita output de todos)
    """

    PHASE_ORDER = [
        ["archie"],           # Fase 1: Arquitectura primero
        ["atlas", "nova"],    # Fase 2: Dev + Design en paralelo
        ["luna"],             # Fase 3: QA al final
    ]

    def __init__(self, task_id: str, state_callback=None):
        self.task_id = task_id
        self.state_callback = state_callback

        # LLMs Híbridos
        self.llm_manager = get_llm(settings.MODEL_MANAGER)
        self.llm_architect = get_llm(settings.MODEL_ARCHITECT)
        self.llm_dev = get_llm(settings.MODEL_DEV)
        self.llm_designer = get_llm(settings.MODEL_DESIGNER)
        self.llm_qa = get_llm(settings.MODEL_QA)

        # Squad
        self.alice = create_alice(self.llm_manager)
        self.archie = create_archie(self.llm_architect)
        self.atlas = create_atlas(self.llm_dev)
        self.nova = create_nova(self.llm_designer)
        self.luna = create_luna(self.llm_qa)

        self._agent_map = {
            "alice":  (self.alice,  "Alice"),
            "archie": (self.archie, "Archie"),
            "atlas":  (self.atlas,  "Atlas"),
            "nova":   (self.nova,   "Nova"),
            "luna":   (self.luna,   "Luna"),
        }

    def _sanitize_issues(self, issues: List[Dict[str, str]]) -> List[Dict[str, str]]:
        mapping_rules = {
            "archie": ["arch", "blueprint", "disen", "estructura", "carpeta", "folder", "setup", "scaffold"],
            "atlas":  ["atlas", "dev", "logic", "implement", "code", "component", "function", "api"],
            "nova":   ["nova", "desig", "style", "ui", "ux", "visual", "css", "image", "asset"],
            "luna":   ["luna", "qa", "test", "build", "valida", "lint", "check", "review"],
        }

        sanitized = []
        for i in issues:
            raw_agent = str(i.get("assignedAgent", "")).lower().strip()
            final_agent = "atlas"

            for agent, keywords in mapping_rules.items():
                if any(kw in raw_agent for kw in keywords):
                    final_agent = agent
                    break

            i["assignedAgent"] = final_agent
            i["status"] = "pending"
            sanitized.append(i)

        return sanitized

    def decompose_task(self, title: str, description: str) -> List[Dict[str, str]]:
        logger.info(f"🔍 Alice (Manager) analizando: {title}")

        planner = Task(
            description=(
                f"Analiza el proyecto: '{title}' - Requerimiento: '{description}'.\n"
                f"Estructura el backlog en 4-6 tareas técnicas CONCRETAS para el equipo:\n"
                f"1. ARCHIE: Crear estructura de carpetas y archivos base (scaffold).\n"
                f"2. ATLAS: Implementar lógica y componentes funcionales.\n"
                f"3. NOVA: Crear estilos CSS y assets visuales.\n"
                f"4. LUNA: QA, build final, y fix de bugs.\n\n"
                f"IMPORTANTE: Cada tarea debe ser ACCIONABLE (ej: 'Crear componente Header con navegación'), "
                f"no vaga (ej: 'Diseñar la UI').\n\n"
                f"Responde ÚNICAMENTE con JSON: "
                f"{{\"issues\": [{{\"id\": \"i1\", \"title\": \"Scaffold proyecto con Vite y React\", \"assignedAgent\": \"archie\"}}, ...]}}"
            ),
            expected_output="JSON con lista de issues técnicos accionables.",
            agent=self.alice
        )

        try:
            crew = Crew(agents=[self.alice], tasks=[planner], verbose=False)
            response = str(crew.kickoff())

            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                data = json.loads(match.group())
                issues = self._sanitize_issues(data.get("issues", []))
                if issues:
                    return issues

            return self._sanitize_issues([
                {"id": "gen1", "title": "Scaffold del proyecto con estructura de carpetas", "assignedAgent": "archie"},
                {"id": "gen2", "title": "Implementar componentes y lógica principal",       "assignedAgent": "atlas"},
                {"id": "gen3", "title": "Crear estilos CSS y assets visuales",              "assignedAgent": "nova"},
                {"id": "gen4", "title": "QA: verificar build y corregir errores",           "assignedAgent": "luna"},
            ])
        except Exception as e:
            logger.error(f"❌ Alice no pudo planificar: {e}")
            raise e

    def get_agent_and_label(self, agent_id: str) -> Tuple[Agent, str]:
        return self._agent_map.get(agent_id.lower(), (self.alice, "Alice"))

    # ─── PHASE-BASED PARALLEL EXECUTION ────────────────────────

    def _group_issues_by_phase(self, issues: List[Dict]) -> List[List[Dict]]:
        agent_to_phase = {}
        for phase_idx, agents_in_phase in enumerate(self.PHASE_ORDER):
            for agent_id in agents_in_phase:
                agent_to_phase[agent_id] = phase_idx

        phases: List[List[Dict]] = [[] for _ in self.PHASE_ORDER]

        for issue in issues:
            agent_id = issue.get("assignedAgent", "atlas").lower()
            phase_idx = agent_to_phase.get(agent_id, 1)
            phases[phase_idx].append(issue)

        return [phase for phase in phases if phase]

    def _run_single_issue(self, issue: Dict, title: str, project_path: Path,
                          previous_context: str) -> Tuple[str, str]:
        agent_id = issue.get("assignedAgent", "atlas")
        agent_obj, agent_label = self.get_agent_and_label(agent_id)
        issue_id = issue["id"]
        issue_title = issue["title"]

        # Publicar: agente empieza
        event_publisher.publish_event(
            agent=agent_label, action="trabajando",
            message=f"{agent_label} trabajando en: {issue_title}",
            task_id=self.task_id,
            metadata={"issue_id": issue_id, "issue_status": "processing"}
        )
        if self.state_callback:
            self.state_callback(self.task_id, {"issue_id": issue_id, "issue_status": "processing"})

        slug = re.sub(r'[^a-z0-9]', '-', title.lower()).strip('-')
        memory_path = Path(settings.MEMORY_OUTPUT_PATH) / slug / f"{agent_label.lower()}_report.md"

        # Contexto previo resumido para no saturar el prompt
        context_summary = previous_context[-1500:] if previous_context else "Ninguno (eres el primero)."

        task = Task(
            description=(
                f"TAREA: {issue_title}\n"
                f"PROYECTO: '{title}'\n"
                f"DIRECTORIO DEL PROYECTO: {project_path}\n\n"
                f"CONTEXTO DE FASES ANTERIORES:\n{context_summary}\n\n"
                f"INSTRUCCIONES:\n"
                f"1. Primero lista el directorio del proyecto con 'Directory Lister' para ver qué existe.\n"
                f"2. Ejecuta tu tarea CREANDO archivos reales con 'File Writer' y comandos con 'Terminal Executor'.\n"
                f"3. Si algo falla, lee el error, corrige, y reintenta.\n"
                f"4. Al terminar, verifica con 'Directory Lister' que tus archivos fueron creados.\n"
                f"5. Documenta lo que hiciste en '{memory_path}' con 'File Writer'.\n"
            ),
            expected_output=f"Archivos creados y verificados para: {issue_title}.",
            agent=agent_obj,
        )

        try:
            # CACHE DESACTIVADO: cada ejecución es fresca para evitar resultados obsoletos
            crew = Crew(
                agents=[agent_obj],
                tasks=[task],
                verbose=settings.CREW_VERBOSE,
                cache=False,  # CRITICAL: desactivar cache para evitar resultados stale
            )
            result = str(crew.kickoff())

            event_publisher.publish_event(
                agent=agent_label, action="completada",
                message=f"{agent_label} terminó: {issue_title}",
                task_id=self.task_id,
                metadata={"issue_id": issue_id, "issue_status": "completed"}
            )
            if self.state_callback:
                self.state_callback(self.task_id, {"issue_id": issue_id, "issue_status": "completed"})

            logger.info(f"✅ {agent_label} completó: {issue_title}")
            return (issue_id, result)

        except Exception as e:
            logger.error(f"❌ {agent_label} falló en {issue_title}: {e}")

            event_publisher.publish_event(
                agent=agent_label, action="error",
                message=f"{agent_label} falló: {e}",
                task_id=self.task_id,
                metadata={"issue_id": issue_id, "issue_status": "failed"}
            )
            if self.state_callback:
                self.state_callback(self.task_id, {"issue_id": issue_id, "issue_status": "failed"})

            return (issue_id, f"ERROR: {e}")

    def execute_task(self, title: str, description: str, priority: str = "medium") -> dict:
        try:
            slug = re.sub(r'[^a-z0-9]', '-', title.lower()).strip('-')
            # Limitar largo del slug para evitar paths excesivamente largos
            if len(slug) > 40:
                slug = slug[:40].rstrip('-')
            project_path = Path(settings.PROJECT_ROOT) / slug
            project_path.mkdir(parents=True, exist_ok=True)

            # ── FASE 0: Alice planifica ──────────────────────
            event_publisher.publish_event(
                agent="Alice", action="planificando",
                message=f"Analizando requerimiento: {title}",
                task_id=self.task_id
            )

            issues = self.decompose_task(title, description)
            if self.state_callback:
                self.state_callback(self.task_id, {"issues": issues})

            event_publisher.publish_event(
                agent="Alice", action="issues_created",
                message=f"Backlog creado: {len(issues)} issues para '{title}'.",
                task_id=self.task_id, metadata={"issues": issues}
            )

            # ── FASES 1→N: Ejecución paralela por grupos ────
            phases = self._group_issues_by_phase(issues)
            accumulated_context = ""

            for phase_idx, phase_issues in enumerate(phases):
                phase_num = phase_idx + 1
                agent_names = list(set(
                    self.get_agent_and_label(i["assignedAgent"])[1] for i in phase_issues
                ))

                logger.info(f"🔄 === FASE {phase_num}/{len(phases)}: {', '.join(agent_names)} ({len(phase_issues)} issues) ===")

                event_publisher.publish_event(
                    agent="Alice", action="coordinando",
                    message=f"Fase {phase_num}: {', '.join(agent_names)} en acción.",
                    task_id=self.task_id,
                    metadata={"phase": phase_num, "agents": agent_names}
                )

                if len(phase_issues) == 1:
                    issue_id, result = self._run_single_issue(
                        phase_issues[0], title, project_path, accumulated_context
                    )
                    accumulated_context += f"\n--- {phase_issues[0]['title']} ---\n{str(result)[:500]}\n"
                else:
                    # ⚡ EJECUCIÓN PARALELA
                    logger.info(f"⚡ Ejecución PARALELA: {', '.join(agent_names)}")
                    phase_results = []

                    with ThreadPoolExecutor(max_workers=len(phase_issues)) as executor:
                        future_to_issue = {
                            executor.submit(
                                self._run_single_issue,
                                issue, title, project_path, accumulated_context
                            ): issue
                            for issue in phase_issues
                        }

                        for future in as_completed(future_to_issue):
                            issue = future_to_issue[future]
                            try:
                                issue_id, result = future.result()
                                phase_results.append((issue["title"], result))
                            except Exception as e:
                                logger.error(f"❌ Error en issue paralelo {issue['title']}: {e}")
                                phase_results.append((issue["title"], f"ERROR: {e}"))

                    for issue_title, result in phase_results:
                        accumulated_context += f"\n--- {issue_title} ---\n{str(result)[:500]}\n"

            # ── FINAL: Alice marca entrega ───────────────────
            event_publisher.publish_event(
                agent="Alice", action="completada",
                message=f"¡Proyecto '{title}' entregado! Todas las fases completadas.",
                task_id=self.task_id
            )

            return {"status": "completed", "result": accumulated_context[:2000], "task_id": self.task_id}

        except Exception as e:
            logger.error(f"❌ Error crítico en ejecución del Scrum: {e}")
            event_publisher.publish_event(
                agent="Alice", action="error",
                message=str(e), task_id=self.task_id
            )
            return {"status": "failed", "error": str(e), "task_id": self.task_id}
