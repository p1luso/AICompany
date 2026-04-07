"""
Herramientas personalizadas para los agentes CrewAI.
TerminalExecutorTool: ejecuta comandos bash en el contenedor.
FileWriterTool: escribe archivos de código a disco.
"""
import subprocess
import requests
import os
from pathlib import Path

from crewai.tools import tool


@tool("Terminal Executor")
def terminal_executor(command: str) -> str:
    """
    Ejecuta un comando bash real en el contenedor Docker.
    El directorio de trabajo es /memory/projects.

    REGLAS OBLIGATORIAS:
    - Para npm/npx: SIEMPRE usa '--yes' o '-y' (ej: 'npx create-vite@latest my-app --yes -- --template react').
    - Usa '&&' para encadenar comandos (ej: 'cd my-app && npm install').
    - NUNCA uses 'echo' para crear archivos. Usa la herramienta 'File Writer' para eso.
    - Si un comando falla, ANALIZA el error y reintenta con una corrección.

    Args:
        command: El comando bash exacto a ejecutar.
    """
    try:
        from config import settings
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=settings.PROJECT_ROOT,
        )
        output = ""
        if result.stdout:
            output += f"STDOUT:\n{result.stdout[-2000:]}\n"
        if result.stderr:
            # Filtrar warnings de npm que no son errores reales
            stderr_lines = result.stderr.strip().split('\n')
            real_errors = [l for l in stderr_lines if 'npm warn' not in l.lower()]
            if real_errors:
                filtered = "\n".join(real_errors[-30:])
                output += f"STDERR:\n{filtered}\n"
        output += f"EXIT_CODE: {result.returncode}"
        return output or "Comando ejecutado con éxito (sin output)."
    except subprocess.TimeoutExpired:
        return "ERROR: El comando excedió el timeout de 120 segundos. Intenta un comando más simple."
    except Exception as e:
        return f"ERROR: {e}"


@tool("File Writer")
def file_writer(file_path: str, content: str) -> str:
    """
    Escribe o sobrescribe un archivo en el disco. ÚSALA SIEMPRE para crear archivos de código.
    NUNCA uses 'echo' en la terminal para crear archivos — usa ESTA herramienta.

    Ejemplos de uso:
    - file_path="/memory/projects/mi-app/src/App.jsx", content="import React..."
    - file_path="/memory/projects/mi-app/package.json", content='{"name": "mi-app"...}'

    Args:
        file_path: Ruta absoluta del archivo (ej: /memory/projects/mi-app/index.html).
        content: El contenido completo del archivo.
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Verificar que se escribió correctamente
        size = os.path.getsize(file_path)
        return f"ÉXITO: Archivo creado en {file_path} ({size} bytes, {len(content)} caracteres)."
    except Exception as e:
        return f"ERROR: No se pudo escribir en {file_path}: {e}"


@tool("Image Generator")
def image_generator_tool(prompt: str, file_path: str) -> str:
    """
    Genera una imagen IA basada en un prompt y la guarda en el disco.

    Args:
        prompt: Descripción de la imagen a generar.
        file_path: Ruta absoluta donde guardar la imagen (ej: /memory/projects/mi-app/assets/hero.png).
    """
    try:
        formatted_prompt = prompt.replace(" ", "%20")
        url = f"https://image.pollinations.ai/prompt/{formatted_prompt}"

        response = requests.get(url, timeout=30)
        response.raise_for_status()

        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(response.content)

        return f"ÉXITO: Imagen generada y guardada en {file_path}."
    except Exception as e:
        return f"ERROR: No se pudo generar la imagen: {e}"


@tool("Directory Lister")
def directory_lister(directory_path: str) -> str:
    """
    Lista el contenido de una carpeta para ver la estructura del proyecto.

    Args:
        directory_path: Ruta de la carpeta (ej: '/memory/projects/mi-app').
    """
    try:
        path = Path(directory_path)
        if not path.exists():
            return f"La ruta {directory_path} no existe todavía. Puedes crearla con Terminal Executor: 'mkdir -p {directory_path}'"

        items = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name))
        result = [f"{'[DIR]' if i.is_dir() else '[FILE]'} {i.name}" for i in items]
        return "\n".join(result) or "Carpeta vacía."
    except Exception as e:
        return f"ERROR: No se pudo listar {directory_path}: {e}"
