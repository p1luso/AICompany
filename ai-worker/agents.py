"""
Agentes colaborativos usando CrewAI >= 1.0 + Ollama (via LiteLLM).
Sistema Híbrido: Modelos Cloud (Gemini, OpenAI) + Modelos Locales (Ollama).
Ejecución por FASES con paralelismo real entre agentes independientes.
"""
import logging
import json
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple

from crewai import Agent, Task, Crew, LLM

from redis_events import event_publisher
from config import settings
from tools import (
    terminal_executor,
    file_writer,
    project_scaffolder,
    image_generator_tool,
    web_auditor,
    directory_lister,
    web_search_tool,
)

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
    "6. EL DIRECTORIO OFICIAL DEL PROYECTO ES: /memory/projects/{PROJECT_NAME}/\n"
    "   SIEMPRE usa rutas ABSOLUTAS que empiecen con /memory/projects/{PROJECT_NAME}/ para File Writer.\n"
    "7. ¡PROHIBIDO EL BOILERPLATE VACÍO!: Tu tarea es escribir LÓGICA FUNCIONAL (useState, useEffect, funciones de cálculo).\n"
    "   Si entregas un archivo que solo tiene texto estático sin lógica, HAS FALLADO.\n"
)

def create_alice(llm: LLM) -> Agent:
    """Alice: Scrum Master & Manager"""
    return Agent(
        role="Alice (Scrum Master)",
        goal="Organizar el backlog y gestionar la secuencia de entrega para CUALQUIER lenguaje o stack técnico.",
        backstory=(
            "Eres Alice, la Coordinadora Principal de Luva Agency. Tu misión es tomar los deseos del CEO "
            "y convertirlos en un plan de ejecución IMPECABLE, sin importar si es Python, Node, Go o Bash.\n\n"
            "TU EQUIPO (DIRECTORY):\n"
            "- SAGE (Researcher): Investiga profundamente en internet. Genera RESEARCH.md y TECHNICAL_SPEC.md.\n"
            "- ARCHIE (Architect): Diseña la estructura de archivos y carpetas para cualquier stack.\n"
            "- ATLAS (Full-Stack Dev): Implementa la lógica core, scripts, APIs y lógica de negocio.\n"
            "- NOVA (Designer): Estilos UI (si aplica), assets visuales e imágenes hero.\n"
            "- SENTINEL (Infra): Setup del servidor, instalaciones globales y seguridad.\n"
            "- LUNA (QA Specialist): Pruebas finales, auditoría técnica y corrección de bugs.\n\n"
            "REGLAS DE OPERACIÓN (CRÍTICO):\n"
            "1. DISTRIBUYE EL TRABAJO: Usa a los 7 especialistas según el TECHNICAL_SPEC de Sage.\n"
            "2. AGNOSTICISMO TÉCNICO: No asumas React. Si Sage pide un Bot en Python, asume Python.\n"
            "3. JSON PURO: Tus respuestas deben ser solo JSON."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=True,
        llm=llm,
    )

def create_archie(llm: LLM) -> Agent:
    """Archie: Software Architect (Cloud)"""
    return Agent(
        role="Archie (Architect)",
        goal=(
            "Diseñar la arquitectura técnica y carpetas para CUALQUIER stack (Python, Node, Go, etc.). "
            "PUNTO CRÍTICO: Si el proyecto NO es Web, usa File Writer para crear la estructura manual."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Archie, un arquitecto senior. Tu trabajo es definir DÓNDE va cada script o módulo.\n\n"
            "REGLA DE ORO:\n"
            "- Si es Web (React/Vite) -> Usa 'Project Scaffolder'.\n"
            "- Si es un Bot/Script/Backend -> Usa mkdir y File Writer para crear carpetas base, main.py, .env, README.md, etc.\n\n"
            "Tu misión es que el esqueleto sea profesional y escalable."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[project_scaffolder, terminal_executor, file_writer, directory_lister],
    )

def create_sage(llm: LLM) -> Agent:
    """Sage: Tech Researcher (Google/Docs)"""
    return Agent(
        role="Sage (Researcher)",
        goal=(
            "Investigar profundamente las mejores tecnologías, librerías y pasos para resolver "
            "el requerimiento del CEO, y crear un TECHNICAL_SPEC.md exhaustivo."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Sage, el cerebro analítico. No tomas decisiones a ciegas.\n\n"
            "TU PROCESO:\n"
            "1. Usa 'Web Search Tool' para buscar las librerías más modernas (ej: 'best telegram bot library python 2024').\n"
            "2. Define la estructura de datos ideal en el Spec.\n"
            "3. Entrega un TECHNICAL_SPEC.md que sea una biblia para Archie y Atlas.\n\n"
            "Si no investigas, el proyecto fallará. Sé meticuloso."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[web_search_tool, directory_lister, file_writer],
    )

def create_atlas(llm: LLM) -> Agent:
    """Atlas: Full-Stack & DevOps Specialist"""
    return Agent(
        role="Atlas (Lead Developer)",
        goal=(
            "Implementar la lógica pura, scripts, APIs o configuraciones necesarias. "
            "Puedes trabajar en Python, Node, Go, Bash o cualquier lenguaje."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Atlas, el ejecutor técnico. No haces maquetado visual, haces que las cosas FUNCIONEN.\n\n"
            "TU CAPACIDAD:\n"
            "- Dominas la terminal. Si necesitas `pip install` o `go build`, házlo.\n"
            "- Eres experto en lógica de negocio, integración de APIs y scrapers.\n\n"
            "Si el ticket dice 'implementar bot', escribes el código core y lo pruebas."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer, directory_lister],
    )

def create_nova(llm: LLM) -> Agent:
    """Nova: Creative UI/UX Designer"""
    return Agent(
        role="Nova (Designer)",
        goal=(
            "Diseñar interfaces premium si el proyecto tiene UI. Si el proyecto es puramente "
            "Backend/Script, simplemente aprueba la fase sin cambios."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Nova, la artista del equipo. Tu obsesión es la estética 'Premium'.\n\n"
            "CONDICIÓN DE ACTUACIÓN:\n"
            "- Si el proyecto es una App Web/Landing -> Crea estilos CSS vibrantes y assets.\n"
            "- Si el proyecto NO TIENE UI (ej: un script de consola) -> Escribe un comentario "
            "indicando que no se requiere diseño y finaliza tu tarea."
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
            "Eres Luna, la Guardiana de la Excelencia. Si el código es mediocre, lo RECHAZARÁS.\n\n"
            "CHECKLIST DE CRUELDAD:\n"
            "1. ¿Existe lógica de negocio? (funciones, cálculos, manipulación de arrays). Si es solo HTML, RECHAZA.\n"
            "2. ¿Usa los datos de la Spec? Si Sage pidió 'Market Data' y Atlas puso 'Item 1', RECHAZA.\n"
            "3. ¿Es dinámico? Si no hay useState ni useEffect en un dashboard, RECHAZA.\n\n"
            "Misión: Si el código es pobre, bórralo y reescribe la lógica tú misma con tu nivel Senior."
        ),
        verbose=settings.CREW_VERBOSE,
        allow_delegation=False,
        llm=llm,
        tools=[terminal_executor, file_writer, directory_lister, web_auditor],
    )

def create_sentinel(llm: LLM) -> Agent:
    """Sentinel: Infra & Security Specialist"""
    return Agent(
        role="Sentinel (Infra)",
        goal=(
            "Configurar el entorno del servidor, instalar dependencias, configurar despliegues y "
            "realizar auditorías de seguridad del sistema."
            + TOOL_RULES
        ),
        backstory=(
            "Eres Sentinel, el Guardián de la Infraestructura. Eres 'el chico del servidor'.\n\n"
            "TU RESPONSABILIDAD:\n"
            "1. Setup de dependencias: Eres el único que debe ejecutar 'npm install' masivos.\n"
            "2. Seguridad: Verifica que no haya vulnerabilidades en package.json.\n"
            "3. Despliegue: Asegúrate de que los archivos de build estén en su lugar.\n\n"
            "Si Alice te asigna una tarea de 'Setup', tu misión es que el comando termine en 0 (éxito)."
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
        ["sage"],               # Fase 1: Investigación
        ["archie"],             # Fase 2: Arquitectura (Scaffold) - SECUENCIAL
        ["sentinel"],           # Fase 3: Infra (Install) - SECUENCIAL
        ["atlas", "nova"],      # Fase 4: Dev + Design - PARALELO
        ["luna"],               # Fase 5: QA
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
        self.llm_researcher = get_llm(settings.MODEL_RESEARCHER)
        self.llm_infra = get_llm(settings.MODEL_RESEARCHER) # Sentinel usa el mismo que Sage para estabilidad

        # Squad
        self.alice = create_alice(self.llm_manager)
        self.archie = create_archie(self.llm_architect)
        self.sage = create_sage(self.llm_researcher)
        self.atlas = create_atlas(self.llm_dev)
        self.nova = create_nova(self.llm_designer)
        self.luna = create_luna(self.llm_qa)
        self.sentinel = create_sentinel(self.llm_infra)

        self._agent_map = {
            "alice":    (self.alice,    "Alice"),
            "sage":     (self.sage,     "Sage"),
            "archie":   (self.archie,   "Archie"),
            "atlas":    (self.atlas,    "Atlas"),
            "nova":     (self.nova,     "Nova"),
            "luna":     (self.luna,     "Luna"),
            "sentinel": (self.sentinel, "Sentinel"),
        }

    def _sanitize_issues(self, issues: List[Dict[str, str]]) -> List[Dict[str, str]]:
        mapping_rules = {
            "archie": ["arch", "blueprint", "disen", "estructura", "carpeta", "folder", "setup", "scaffold"],
            "sage":   ["sage", "research", "investig", "spec", "tecnica", "analisis", "expert"],
            "atlas":  ["atlas", "dev", "logic", "implement", "code", "component", "function", "api"],
            "nova":   ["nova", "desig", "style", "ui", "ux", "visual", "css", "image", "asset"],
            "luna":   ["luna", "qa", "test", "build", "valida", "lint", "check", "review"],
            "sentinel": ["sentinel", "infra", "security", "server", "install", "deploy", "setup"],
        }

        sanitized = []
        archie_issues = []

        for i in issues:
            raw_agent = str(i.get("assignedAgent", "")).lower().strip()
            final_agent = "atlas"

            for agent, keywords in mapping_rules.items():
                if any(kw in raw_agent for kw in keywords):
                    final_agent = agent
                    break

            i["assignedAgent"] = final_agent
            i["status"] = "pending"

            # Separar issues de Archie
            if final_agent == "archie":
                archie_issues.append(i)
            else:
                sanitized.append(i)

        # GARANTIZAR: El PRIMER issue de Archie es SIEMPRE el scaffold (estructura base)
        if archie_issues:
            # Buscar si ya hay un scaffold entre los issues de Archie
            has_scaffold = any(
                "scaffold" in str(issue.get("title", "")).lower()
                or "estructura" in str(issue.get("title", "")).lower()
                for issue in archie_issues
            )

            if not has_scaffold:
                # Si no hay scaffold explícito, crear uno como PRIMER issue
                scaffold_issue = {
                    "id": "scaffold-001",
                    "title": "Scaffold: Crear estructura de carpetas y archivos base del proyecto",
                    "assignedAgent": "archie",
                    "status": "pending"
                }
                archie_issues.insert(0, scaffold_issue)
            else:
                # Si hay scaffold, asegurar que esté al inicio
                scaffold_idx = next(
                    (i for i, issue in enumerate(archie_issues)
                     if "scaffold" in str(issue.get("title", "")).lower() or "estructura" in str(issue.get("title", "")).lower()),
                    -1
                )
                if scaffold_idx > 0:
                    scaffold = archie_issues.pop(scaffold_idx)
                    archie_issues.insert(0, scaffold)

        # Archie issues al inicio
        return archie_issues + sanitized

    def decompose_task(self, title: str, description: str) -> List[Dict[str, str]]:
        logger.info(f"🔍 Alice (Manager) analizando: {title}")

        planner = Task(
            description=(
                f"Analiza el proyecto: '{title}' - Requerimiento: '{description}'.\n"
                f"Estructura el backlog en 4-6 tareas técnicas CONCRETAS para el equipo.\n\n"
                f"LÓGICA DE DESCOMPOSICIÓN (CRÍTICO):\n"
                f"1. EL PRIMER ISSUE ES SIEMPRE PARA SAGE: 'Investigación técnica profunda y generación de TECHNICAL_SPEC.md'.\n"
                f"2. EL SEGUNDO ISSUE ES PARA ARCHIE: 'Scaffold de arquitectura base y diseño de estructura React'.\n"
                f"3. EL TERCER ISSUE ES PARA SENTINEL: 'Setup inicial del entorno y aseguramiento de dependencias (npm install)'.\n"
                f"4. Issues adicionales para ATLAS (lógica funcional), NOVA (estilos premium Tailwind), LUNA (QA final y build check).\n\n"
                f"REGLA DE ORO: USA A LOS 7 AGENTES. No delegues todo en uno solo."
                f"IMPORTANTE:\n"
                f"1. Piensa qué TIPO de proyecto es antes de decidir si necesita scaffold.\n"
                f"2. SANITIZA EL INPUT: Si el usuario incluyó instrucciones técnicas de bajo nivel (ej: 'ejecuta npm install' o 'usa Tailwind'), "
                f"IGNORA los comandos literales y conviértelos en un REQUERIMIENTO FUNCIONAL para los agentes (ej: 'Implementar estilos modernos con utilidades CSS').\n\n"
                f"Responde ÚNICAMENTE con JSON: {{\"issues\": [{{\"id\": \"i1\", \"title\": \"...\", \"assignedAgent\": \"archie/atlas/nova/luna\"}}, ...]}}"
            ),
            expected_output="JSON con lista de issues adaptados al tipo de proyecto (scaffold si es software, tareas flexibles si es otro tipo).",
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

            logger.error("❌ Error parseando backlog JSON")
            # Fallback agnóstico al lenguaje
            return [
                {"id": "i1", "title": "Investigación técnica profunda y TECHNICAL_SPEC.md", "assignedAgent": "sage", "status": "pending"},
                {"id": "i2", "title": "Scaffold de la estructura base del proyecto", "assignedAgent": "archie", "status": "pending"},
                {"id": "i3", "title": "Setup de dependencias y entorno técnico", "assignedAgent": "sentinel", "status": "pending"},
                {"id": "i4", "title": "Desarrollo de lógica core y funcionalidad principal", "assignedAgent": "atlas", "status": "pending"},
                {"id": "i5", "title": "Diseño de UI y experiencia visual (si aplica)", "assignedAgent": "nova", "status": "pending"},
                {"id": "i6", "title": "Testing final, QA y auditoría de calidad", "assignedAgent": "luna", "status": "pending"},
            ]
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
                          previous_context: str, slug: str) -> Tuple[str, str]:
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

        memory_path = Path(settings.MEMORY_OUTPUT_PATH) / slug / f"{agent_label.lower()}_report.md"

        # Contexto previo resumido para no saturar el prompt
        context_summary = previous_context[-1500:] if previous_context else "Ninguno (eres el primero)."

        # Instrucciones especiales para Archie (scaffold)
        archie_extra = ""
        if agent_id == "archie":
            archie_extra = (
                f"\n⚠️ PASO 1 OBLIGATORIO: Usa 'Project Scaffolder' para crear la base del proyecto.\n"
                f"   Ejemplo: project_scaffolder(project_name='{slug}', template='landing')\n"
                f"   Templates: 'react' (apps), 'vanilla' (JS simple), 'landing' (HTML estático)\n"
                f"   Esto crea TODA la estructura base con configs correctas. NO crees package.json manualmente.\n"
            )

        # Inyectar PROJECT_NAME en las reglas
        formatted_tool_rules = TOOL_RULES.format(PROJECT_NAME=slug)

        task = Task(
            description=(
                f"TAREA: {issue_title}\n"
                f"PROYECTO: '{title}'\n"
                f"NOMBRE OFICIAL DEL PROYECTO (USAR ESTE): {slug}\n"
                f"DIRECTORIO DEL PROYECTO: {project_path}\n\n"
                f"⚠️ REGLA DE ORO: USA EL NOMBRE '{slug}'. Ignora cualquier nombre diferente propuesto por el usuario en su texto descriptivo.\n\n"
                f"CONTEXTO DE FASES ANTERIORES:\n{context_summary}\n\n"
                f"{archie_extra}"
                f"INSTRUCCIONES:\n"
                f"1. Primero lista el directorio del proyecto con 'Directory Lister' para ver qué existe.\n"
                f"2. Ejecuta tu tarea CREANDO archivos reales con 'File Writer' y comandos con 'Terminal Executor'.\n"
                f"3. Si algo falla, lee el error, corrige, y reintenta.\n"
                f"4. Al terminar, verifica con 'Directory Lister' que tus archivos fueron creados.\n"
                f"5. Documenta lo que hiciste en '{memory_path}' con 'File Writer'.\n"
                f"{formatted_tool_rules}"
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

    def _generate_slug(self, text: str) -> str:
        """Genera un slug limpio, sin acentos y ASCII-safe."""
        text = str(text)
        # Normalizar caracteres (acentos -> base)
        normalized = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
        # Quitar caracteres especiales y pasar a minúsculas
        slug = re.sub(r'[^a-z0-9]+', '-', normalized.lower()).strip('-')
        # Limitar largo para evitar paths rotos en algunos OS
        return slug[:45].rstrip('-')

    def execute_task(self, title: str, description: str, priority: str = "medium") -> dict:
        try:
            slug = self._generate_slug(title)
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
                        phase_issues[0], title, project_path, accumulated_context, slug
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
                                issue, title, project_path, accumulated_context, slug
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
