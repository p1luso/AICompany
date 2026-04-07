"""
Herramientas personalizadas para los agentes CrewAI.
Incluye: Terminal, File Writer, Scaffolder, Image Generator, Directory Lister.
"""
import subprocess
import requests
import os
import json
import re
from pathlib import Path

from crewai.tools import tool


# ─── ENVIRONMENT INFO (injected into tool descriptions) ───────
# Container: Python 3.11-slim + Node 20.x + npm 10.x
# NO TypeScript global. Projects should use vanilla JS or install TS locally.
# Working dir for projects: /memory/projects/

ENV_RULES = """
ENTORNO DEL CONTAINER:
- Node.js v20, npm 10. NO hay TypeScript global instalado.
- Directorio de proyectos: /memory/projects/<nombre>/
- Para npm/npx: SIEMPRE '--yes' o '-y' para evitar prompts.
- NUNCA uses 'echo' para crear archivos. Usa 'File Writer'.
- Si un comando falla, LEE el error, CORRIGE, y REINTENTA.
"""


@tool("Terminal Executor")
def terminal_executor(command: str) -> str:
    """
    Ejecuta un comando bash real en el contenedor Docker.
    El directorio de trabajo es /memory/projects.

    REGLAS:
    - Para npm/npx: SIEMPRE '--yes' o '-y'.
    - Usa '&&' para encadenar comandos.
    - NUNCA uses 'echo' para crear archivos → usa 'File Writer'.
    - Si falla, ANALIZA el error y reintenta.

    Args:
        command: El comando bash a ejecutar.
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
            stderr_lines = result.stderr.strip().split('\n')
            real_errors = [l for l in stderr_lines if 'npm warn' not in l.lower()]
            if real_errors:
                filtered = "\n".join(real_errors[-30:])
                output += f"STDERR:\n{filtered}\n"
        output += f"EXIT_CODE: {result.returncode}"
        return output or "Comando ejecutado con éxito (sin output)."
    except subprocess.TimeoutExpired:
        return "ERROR: Timeout de 120s. Intenta un comando más simple."
    except Exception as e:
        return f"ERROR: {e}"


@tool("File Writer")
def file_writer(file_path: str, content: str) -> str:
    """
    Escribe o sobrescribe un archivo en el disco.
    ÚSALA SIEMPRE para crear archivos de código. NUNCA uses 'echo' en Terminal.

    Args:
        file_path: Ruta absoluta del archivo (ej: /memory/projects/mi-app/src/App.jsx).
        content: El contenido completo del archivo.
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        size = os.path.getsize(file_path)
        return f"ÉXITO: Archivo creado en {file_path} ({size} bytes)."
    except Exception as e:
        return f"ERROR: No se pudo escribir en {file_path}: {e}"


@tool("Project Scaffolder")
def project_scaffolder(project_name: str, template: str = "react") -> str:
    """
    Crea un proyecto web completo y FUNCIONAL con un solo comando.
    Genera estructura de archivos, package.json, configs, y ejecuta npm install.
    Usa ESTA herramienta en vez de crear manualmente archivos de config.

    Templates disponibles:
    - "react": React + Vite + CSS (JavaScript, sin TypeScript)
    - "vanilla": HTML + CSS + JS puro (sin framework)
    - "landing": Landing page con HTML + CSS + JS (estática)

    Args:
        project_name: Nombre del proyecto (sin espacios, ej: "mi-landing").
        template: Tipo de proyecto: "react", "vanilla", o "landing".
    """
    from config import settings
    project_dir = Path(settings.PROJECT_ROOT) / project_name

    try:
        if template == "react":
            return _scaffold_react(project_name, project_dir)
        elif template == "vanilla":
            return _scaffold_vanilla(project_name, project_dir)
        elif template == "landing":
            return _scaffold_landing(project_name, project_dir)
        else:
            return f"ERROR: Template '{template}' no reconocido. Usa: react, vanilla, landing."
    except Exception as e:
        return f"ERROR en scaffold: {e}"


def _scaffold_react(name: str, project_dir: Path) -> str:
    """Scaffold React + Vite (JavaScript only, no TS problems)."""
    project_dir.mkdir(parents=True, exist_ok=True)
    src = project_dir / "src"
    public = project_dir / "public"
    src.mkdir(exist_ok=True)
    public.mkdir(exist_ok=True)

    # package.json
    pkg = {
        "name": name,
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.2.0",
            "vite": "^5.0.0"
        }
    }
    (project_dir / "package.json").write_text(json.dumps(pkg, indent=2))

    # vite.config.js
    (project_dir / "vite.config.js").write_text("""import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
""")

    # index.html
    (project_dir / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""")

    # src/main.jsx
    (src / "main.jsx").write_text("""import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""")

    # src/App.jsx
    (src / "App.jsx").write_text("""import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>""" + name + """</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
""")

    # src/index.css
    (src / "index.css").write_text("""* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: #0f0f1a;
  color: #e2e8f0;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
""")

    # src/App.css
    (src / "App.css").write_text(""".app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card {
  padding: 2rem;
}

button {
  padding: 0.8rem 1.6rem;
  font-size: 1rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: transparent;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #667eea;
  color: white;
}
""")

    # .gitignore
    (project_dir / ".gitignore").write_text("node_modules\ndist\n.env\n")

    # npm install
    result = subprocess.run(
        "npm install --yes",
        shell=True, capture_output=True, text=True,
        timeout=120, cwd=str(project_dir)
    )

    if result.returncode != 0:
        return (
            f"PROYECTO CREADO en {project_dir} pero npm install falló:\n"
            f"{result.stderr[-500:]}\n"
            f"Archivos creados: package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css, src/App.css\n"
            f"Intenta ejecutar 'cd {project_dir} && npm install --yes' manualmente."
        )

    return (
        f"ÉXITO: Proyecto React+Vite '{name}' creado en {project_dir}\n"
        f"Archivos: package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css, src/App.css\n"
        f"npm install completado. Puedes hacer 'cd {project_dir} && npm run build' para compilar.\n"
        f"Para agregar componentes, crea archivos .jsx en src/ con 'File Writer'."
    )


def _scaffold_vanilla(name: str, project_dir: Path) -> str:
    """Scaffold Vanilla JS + Vite."""
    project_dir.mkdir(parents=True, exist_ok=True)

    pkg = {
        "name": name,
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "devDependencies": {
            "vite": "^5.0.0"
        }
    }
    (project_dir / "package.json").write_text(json.dumps(pkg, indent=2))

    (project_dir / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{name}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
""")

    (project_dir / "style.css").write_text("""* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  background: #1a1a2e;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
}
#app { text-align: center; padding: 2rem; }
h1 { font-size: 2rem; margin-bottom: 1rem; }
""")

    (project_dir / "main.js").write_text(f"""document.querySelector('#app').innerHTML = `
  <h1>{name}</h1>
  <p>Edit main.js to get started</p>
`
""")

    (project_dir / ".gitignore").write_text("node_modules\ndist\n")

    result = subprocess.run(
        "npm install --yes", shell=True, capture_output=True,
        text=True, timeout=120, cwd=str(project_dir)
    )

    status = "npm install OK" if result.returncode == 0 else f"npm install falló: {result.stderr[-300:]}"
    return (
        f"ÉXITO: Proyecto Vanilla JS '{name}' creado en {project_dir}\n"
        f"Archivos: package.json, index.html, style.css, main.js\n"
        f"{status}\n"
        f"Usa 'cd {project_dir} && npm run build' para compilar."
    )


def _scaffold_landing(name: str, project_dir: Path) -> str:
    """Scaffold Landing Page estática (HTML+CSS+JS, sin bundler)."""
    project_dir.mkdir(parents=True, exist_ok=True)
    assets = project_dir / "assets"
    assets.mkdir(exist_ok=True)

    (project_dir / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hero">
    <nav>
      <div class="logo">{name}</div>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <div class="hero-content">
      <h1>Welcome to {name}</h1>
      <p>A modern landing page built for you.</p>
      <a href="#features" class="cta-button">Get Started</a>
    </div>
  </header>

  <section id="features" class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>Fast</h3>
        <p>Lightning fast performance.</p>
      </div>
      <div class="feature-card">
        <h3>Modern</h3>
        <p>Built with modern technologies.</p>
      </div>
      <div class="feature-card">
        <h3>Responsive</h3>
        <p>Looks great on any device.</p>
      </div>
    </div>
  </section>

  <section id="about" class="about">
    <h2>About</h2>
    <p>This project was created by the Luva Agency team.</p>
  </section>

  <footer id="contact">
    <p>&copy; 2026 {name}. All rights reserved.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
""")

    # Agregar package.json mínimo para que npm run build no falle en QA (aunque sea un no-op)
    pkg = {
        "name": name,
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "build": "echo 'Landing estática: no requiere build.'",
            "dev": "echo 'Abre index.html directamente.'"
        }
    }
    (project_dir / "package.json").write_text(json.dumps(pkg, indent=2))

    (project_dir / "style.css").write_text("""* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1a1a2e;
  line-height: 1.6;
}

/* Navigation */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover { color: white; }

/* Hero */
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
}

.hero-content p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 600px;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: #667eea;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 50px;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Features */
.features {
  padding: 5rem 2rem;
  text-align: center;
  background: #f8f9fa;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.feature-card:hover { transform: translateY(-4px); }

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

/* About */
.about {
  padding: 5rem 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.about h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Footer */
footer {
  background: #1a1a2e;
  color: rgba(255,255,255,0.6);
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 { font-size: 2rem; }
  .nav-links { display: none; }
  .feature-grid { grid-template-columns: 1fr; }
}
""")

    (project_dir / "script.js").write_text("""// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Fade-in animation on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .about').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

console.log('Landing page loaded successfully!');
""")

    return (
        f"ÉXITO: Landing Page '{name}' creada en {project_dir}\n"
        f"Archivos: index.html, style.css, script.js, assets/\n"
        f"Esta es una landing ESTÁTICA — no necesita npm install ni build.\n"
        f"Abre index.html directamente en el navegador para verla.\n"
        f"Para personalizarla, edita los archivos con 'File Writer'."
    )


@tool("Image Generator")
def image_generator_tool(prompt: str, file_path: str) -> str:
    """
    Genera una imagen IA basada en un prompt y la guarda en el disco.

    Args:
        prompt: Descripción de la imagen a generar.
        file_path: Ruta absoluta donde guardar la imagen.
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



@tool("Web Auditor")
def web_auditor(project_path: str) -> str:
    """
    Realiza una auditoría visual y estructural del proyecto.
    Úsala para verificar que la UI sea 'Premium' y que no falten metas o scripts.

    Busca:
    - Metas básicos (title, description).
    - Scripts y links de CSS.
    - Estéticos 'Premium': Gradients, HSL colors, Backdrop-filters, Flex/Grid.
    - IDs críticos como #root o #app.

    Args:
        project_path: Ruta del proyecto (ej: '/memory/projects/mi-app').
    """
    try:
        path = Path(project_path)
        if not path.exists():
            return f"ERROR: La ruta {project_path} no existe."

        report = [f"--- REPORTE DE AUDITORÍA: {path.name} ---"]
        
        # 1. Buscar index.html (en raíz o dist)
        html_files = list(path.glob("**/index.html"))
        if not html_files:
            return f"AVERTENCIA: No se encontró index.html en {project_path}. ¿Ejecutaste el build?"
        
        target_html = html_files[0]
        content = target_html.read_text(encoding="utf-8")
        
        # 2. Auditoría Estructural
        report.append("\n[ESTRUCTURA]")
        has_title = "<title>" in content.lower()
        has_meta = "<meta name=\"description\"" in content.lower()
        has_root = "id=\"root\"" in content.lower() or "id=\"app\"" in content.lower()
        
        report.append(f"- Título: {'✅ OK' if has_title else '❌ FALTANTE'}")
        report.append(f"- Meta Descripción: {'✅ OK' if has_meta else '⚠️ RECOMENDADO'}")
        report.append(f"- Contenedor Root (#root/#app): {'✅ OK' if has_root else '❌ CRÍTICO'}")

        # 3. Auditoría Visual (Premium CSS)
        report.append("\n[ESTÉTICA PREMIUM]")
        css_files = list(path.glob("**/*.css"))
        premium_indicators = {
            "Gradients": ["linear-gradient", "radial-gradient"],
            "Modern Layout": ["display: flex", "display: grid"],
            "Advanced FX": ["backdrop-filter", "box-shadow", "border-radius", "transition"],
            "Colors": ["hsl(", "var(--", "rgba("],
            "Typography": ["font-family:", "url(", "Google Fonts"]
        }
        
        found_premium = []
        full_css_content = ""
        for cf in css_files:
            full_css_content += cf.read_text(encoding="utf-8").lower()

        for category, keywords in premium_indicators.items():
            if any(kw.lower() in full_css_content for kw in keywords):
                found_premium.append(category)

        if len(found_premium) >= 4:
            report.append("- Calidad Visual: ✨ PREMIUM (Nivel Alto)")
        elif len(found_premium) >= 2:
            report.append("- Calidad Visual: 📈 ESTÁNDAR (Mejorable)")
        else:
            report.append("- Calidad Visual: ⚠️ BÁSICO (Faltan gradientes, sombras o modern layout)")
        
        report.append(f"- Elementos detectados: {', '.join(found_premium) or 'Ninguno'}")

        # 4. Verificación de Scripts/Assets
        scripts = len(re.findall(r"<script", content.lower()))
        links = len(re.findall(r"<link", content.lower()))
        report.append(f"\n[CARGA]: {scripts} scripts, {links} recursos externos.")

        return "\n".join(report)

    except Exception as e:
        return f"ERROR en Auditoría: {e}"


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
            return f"La ruta {directory_path} no existe todavía. Créala con mkdir -p."
        items = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name))
        result = [f"{'[DIR]' if i.is_dir() else '[FILE]'} {i.name}" for i in items]
        return "\n".join(result) or "Carpeta vacía."
    except Exception as e:
        return f"ERROR: No se pudo listar {directory_path}: {e}"
