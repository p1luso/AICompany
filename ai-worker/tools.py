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
    REQUIRED: Ejecuta un comando bash real en el contenedor. 
    MANDATORIO para: 'npm install', 'npm run build', 'ls', 'mkdir', etc.
    Usa esta herramienta cuando debas realizar una acción física o técnica en el sistema.
    
    Args:
        command: El comando bash exacto a ejecutar.
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
        return output or "Comando ejecutado con éxito (sin output)."
    except subprocess.TimeoutExpired:
        return "ERROR: El comando excedió el timeout de 120 segundos."
    except Exception as e:
        return f"ERROR: {e}"


@tool("File Writer")
def file_writer(file_path: str, content: str) -> str:
    """
    REQUIRED: Escribe o sobrescribe archivos físicos en el disco.
    MANDATORIO para: crear código (.js, .jsx, .py), archivos de estilo (.css), o documentos (.md).
    Usa esta herramienta SIEMPRE que debas entregar código o documentación técnica.
    
    Args:
        file_path: Ruta absoluta o relativa del archivo (ej: '/app/projects/mi-app/src/App.jsx').
        content: El contenido completo y final que debe tener el archivo.
    """
    try:
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return f"ÉXITO: Archivo creado en {file_path} ({len(content)} caracteres escritos)."
    except Exception as e:
        return f"ERROR: No se pudo escribir en {file_path}: {e}"

@tool("Directory Lister")
def directory_lister(directory_path: str) -> str:
    """
    Explora el contenido de una carpeta para entender la estructura del proyecto actual.
    Útil antes de escribir archivos para no duplicarlos o para verificar qué se ha creado.
    
    Args:
        directory_path: Ruta de la carpeta a listar (ej: '/app/projects/mi-app').
    """
    try:
        path = Path(directory_path)
        if not path.exists():
            return f"ERROR: La ruta {directory_path} no existe."
        
        items = list(path.iterdir())
        result = [f"{'[DIR]' if i.is_dir() else '[FILE]'} {i.name}" for i in items]
        return "\n".join(result) or "Carpeta vacía."
    except Exception as e:
        return f"ERROR: No se pudo listar {directory_path}: {e}"
