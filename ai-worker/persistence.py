import json
import os
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"
TASKS_FILE = DATA_DIR / "tasks.json"

def ensure_data_dir():
    """Crea el directorio de datos si no existe."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

def save_tasks(tasks: Dict[str, Any]):
    """Guarda el diccionario de tareas en a un archivo JSON con backup."""
    try:
      ensure_data_dir()
      # Primero escribir a un temporal para evitar corrupción
      TEMP_FILE = TASKS_FILE.with_suffix(".tmp")
      with open(TEMP_FILE, "w", encoding="utf-8") as f:
          json.dump(tasks, f, indent=2, ensure_ascii=False)
      
      # Renombrar atómico
      TEMP_FILE.replace(TASKS_FILE)
      logger.info(f"💾 Tareas guardadas en {TASKS_FILE}")
    except Exception as e:
      logger.error(f"❌ Error guardando tareas: {e}")

def load_tasks() -> Dict[str, Any]:
    """Carga las tareas desde el archivo JSON con validación."""
    if not TASKS_FILE.exists():
        logger.warning(f"⚠️ No existe {TASKS_FILE}, iniciando store vacío.")
        return {}
    
    try:
        with open(TASKS_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            if not content:
                logger.warning(f"⚠️ {TASKS_FILE} está vacío.")
                return {}
            data = json.loads(content)
            logger.info(f"📂 Tareas cargadas desde {TASKS_FILE} ({len(data)} items)")
            return data
    except Exception as e:
        logger.error(f"❌ Error cargando tareas (JSON corrupto?): {e}")
        # Intentar buscar backup si existiera (por ahora solo devolver vacío para no crashear)
        return {}
