"""
AI Worker - Aplicación FastAPI para Oficina Virtual Multi-Agente
Punto de entrada principal
"""
import logging
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from models import TaskRequest, TaskResponse, HealthResponse, AgentEvent
from redis_events import event_publisher
from agents import AgencyTeam
from persistence import load_tasks, save_tasks

# Configurar logging
logging.basicConfig(
    level=settings.LOG_LEVEL.upper(),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Almacenamiento temporal de tareas (en producción usar BD)
tasks_store: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestionar el ciclo de vida de la aplicación
    """
    # Startup
    logger.info("🚀 AI Worker iniciando...")
    global tasks_store
    tasks_store = load_tasks()
    yield
    # Shutdown
    logger.info("🛑 AI Worker deteniendo...")
    save_tasks(tasks_store)
    event_publisher.close()


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Worker multi-agente para Oficina Virtual",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    """
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        redis_connected=event_publisher.connected,
    )


@app.post("/api/task", response_model=dict)
async def create_task(
    request: TaskRequest, background_tasks: BackgroundTasks
) -> dict:
    """
    Endpoint para crear y ejecutar una nueva tarea

    Args:
        request: Solicitud de tarea
        background_tasks: Cola de tareas en background

    Returns:
        dict: Información de la tarea creada
    """
    task_id = str(uuid.uuid4())

    logger.info(f"📝 Nueva tarea recibida: {task_id}")
    logger.info(f"   Título: {request.title}")
    logger.info(f"   Prioridad: {request.priority}")

    # Guardar tarea en almacenamiento
    tasks_store[task_id] = {
        "id": task_id,
        "status": "pending",
        "request": request.model_dump(),
    }
    save_tasks(tasks_store)

    # Publicar evento inicial
    event_publisher.publish_event(
        agent="Alice",
        action="recibida",
        message=f"Nueva tarea recibida: {request.title}",
        task_id=task_id,
        metadata={
            "title": request.title,
            "priority": request.priority,
        },
    )

    # Ejecutar crew en background
    background_tasks.add_task(
        execute_crew_task,
        task_id=task_id,
        title=request.title,
        description=request.description,
        priority=request.priority or "medium",
    )

    return {
        "task_id": task_id,
        "status": "pending",
        "message": "Tarea encolada para procesamiento",
    }


def update_task_in_store(task_id: str, data: dict):
    """Actualiza una tarea en el store y persiste a disco inmediatamente."""
    if task_id in tasks_store:
        # Si vienen issues de Alice, inicializarlos si no existen
        if "issues" in data and not tasks_store[task_id].get("issues"):
            tasks_store[task_id]["issues"] = data["issues"]
        
        # Si es una actualización de sub-issue
        if "issue_id" in data:
            issue_id = data["issue_id"]
            issue_status = data.get("issue_status", "processing")
            
            issues = tasks_store[task_id].get("issues", [])
            for i in issues:
                if i["id"] == issue_id:
                    i["status"] = issue_status
                    break
        else:
            # Actualización normal del proyecto
            tasks_store[task_id].update(data)
            
        save_tasks(tasks_store)
        logger.info(f"💾 Store actualizado para: {task_id}")

def execute_crew_task(
    task_id: str, title: str, description: str, priority: str
) -> None:
    """
    Ejecuta el crew de agentes en background
    """
    try:
        logger.info(f"⚙️ Iniciando ejecución del crew para tarea: {task_id}")

        # Actualizar estado inicial
        update_task_in_store(task_id, {"status": "processing"})

        # Crear equipo de agentes
        agency_team = AgencyTeam(task_id=task_id, state_callback=update_task_in_store)

        # Ejecutar
        result = agency_team.execute_task(
            title=title,
            description=description,
            priority=priority,
        )

        # Cierre final - Verificar si hubo fallo interno
        final_status = "completed"
        if isinstance(result, dict) and result.get("status") == "failed":
            final_status = "failed"
            
        update_task_in_store(task_id, {"status": final_status, "result": str(result)})
        logger.info(f"🏁 Tarea finalizada ({final_status}): {task_id}")

    except Exception as e:
        logger.error(f"❌ Error en ejecute_crew_task: {e}")
        tasks_store[task_id]["status"] = "failed"
        tasks_store[task_id]["error"] = str(e)
        save_tasks(tasks_store)


@app.get("/api/task/{task_id}", response_model=Optional[dict])
async def get_task(task_id: str) -> dict:
    """
    Obtener estado de una tarea

    Args:
        task_id: ID de la tarea

    Returns:
        dict: Información de la tarea
    """
    if task_id not in tasks_store:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    return tasks_store[task_id]


@app.get("/api/tasks")
async def list_tasks() -> dict:
    """
    Listar todas las tareas

    Returns:
        dict: Lista de tareas
    """
    return {
        "count": len(tasks_store),
        "tasks": list(tasks_store.values()),
    }


@app.post("/api/test-event")
async def test_event(event: AgentEvent) -> dict:
    """
    Endpoint de test para publicar eventos manualmente

    Args:
        event: Evento a publicar

    Returns:
        dict: Confirmación
    """
    success = event_publisher.publish_event(
        agent=event.agent,
        action=event.action,
        message=event.message,
        task_id=event.task_id,
        metadata=event.metadata,
    )

    return {
        "success": success,
        "event": event.model_dump(),
    }


import shutil
import zipfile
from pathlib import Path
from fastapi.responses import FileResponse

@app.get("/")
async def root() -> dict:
    """Endpoint raíz"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "create_task": "POST /api/task",
            "get_task": "GET /api/task/{task_id}",
            "list_tasks": "GET /api/tasks",
            "download_project": "GET /api/projects/{slug}/download",
            "test_event": "POST /api/test-event",
        },
    }

@app.get("/api/projects/{slug}/download")
async def download_project(slug: str):
    """
    Empaqueta un proyecto en un .zip y lo devuelve para descargar.
    """
    project_path = Path(settings.PROJECT_ROOT) / slug
    
    if not project_path.exists():
        raise HTTPException(status_code=404, detail=f"Proyecto '{slug}' no encontrado")

    # Crear directorio temporal para zips si no existe
    zip_dir = Path("/tmp/zips")
    zip_dir.mkdir(parents=True, exist_ok=True)
    
    zip_filename = f"{slug}.zip"
    zip_path = zip_dir / zip_filename
    
    logger.info(f"📦 Empaquetando proyecto {slug} en {zip_path}")
    
    try:
        # Usar shutil para crear el archive
        shutil.make_archive(str(zip_path).replace(".zip", ""), 'zip', project_path)
        
        return FileResponse(
            path=zip_path,
            filename=zip_filename,
            media_type='application/zip'
        )
    except Exception as e:
        logger.error(f"❌ Error al crear zip: {e}")
        raise HTTPException(status_code=500, detail=f"Error al empaquetar: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.WORKER_HOST,
        port=settings.WORKER_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
