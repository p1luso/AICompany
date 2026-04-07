"""
Herramientas personalizadas para los agentes CrewAI.
TerminalExecutorTool: ejecuta comandos bash en el contenedor.
FileWriterTool: escribe archivos de código a disco.
"""
import subprocess
from pathlib import Path

from crewai.tools import tool


@tool("Terminal Executor")
def terminal_executor(command: str) -> str:
    """
    Ejecuta un comando de bash en el contenedor y devuelve el output.
    Útil para instalar dependencias, correr scripts, compilar código,
    ejecutar tests o cualquier operación de terminal.

    Args:
        command: El comando bash a ejecutar (ej: 'python -m pytest tests/')
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120,
            cwd="/app",
        )
        output = ""
        if result.stdout:
            output += f"STDOUT:\n{result.stdout}\n"
        if result.stderr:
            output += f"STDERR:\n{result.stderr}\n"
        output += f"EXIT_CODE: {result.returncode}"
        return output or "Comando ejecutado sin output."
    except subprocess.TimeoutExpired:
        return "ERROR: El comando excedió el timeout de 120 segundos."
    except Exception as e:
        return f"ERROR: {e}"


@tool("File Writer")
def file_writer(file_path: str, content: str) -> str:
    """
    Crea o sobrescribe un archivo en disco con el contenido proporcionado.
    Útil para generar archivos de código, configuraciones, scripts, etc.

    Args:
        file_path: Ruta del archivo a crear (ej: '/app/output/main.py')
        content: Contenido completo del archivo
    """
    try:
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return f"OK: Archivo creado en {file_path} ({len(content)} chars)"
    except Exception as e:
        return f"ERROR: No se pudo escribir {file_path}: {e}"
