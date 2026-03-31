Actúa como un Principal Full Stack Engineer y Arquitecto de IA. Tu objetivo es programar de principio a fin (E2E) una "Oficina Virtual / Agencia Multi-Agente" utilizando una arquitectura de microservicios orientada a eventos.

ESTRUCTURA DEL PROYECTO (Monorepo):
- /frontend (Next.js App Router, Tailwind, Zustand)
- /gateway (Golang, Fiber/Gorilla, WebSockets)
- /ai-worker (Python, FastAPI, CrewAI/AutoGen para lógica multi-agente)
- docker-compose.yml (Infraestructura completa)

EJECUTA LAS SIGUIENTES TAREAS PASO A PASO. Escribe código modular, con manejo de errores, listo para producción. (Espera mi confirmación si necesitas instalar dependencias pesadas):

PASO 1: INFRAESTRUCTURA Y REDIS
- Crea el `docker-compose.yml` en la raíz. Orquesta 4 contenedores: Redis (alpine) como message broker, el gateway de Go, el worker de Python y el frontend de Next.js. Define las redes internas y puertos.

PASO 2: AI WORKER (PYTHON - LA MINI EMPRESA)
- Inicializa el entorno en la carpeta `/ai-worker`.
- Crea la lógica multi-agente. Necesito la configuración de 3 perfiles con System Prompts estrictos:
  1. "Manager": Toma el requerimiento del usuario, planifica los pasos y dirige la "Daily".
  2. "Especialista": Ejecuta la tarea (investigación, redacción o análisis).
  3. "QA/Reviewer": Revisa el trabajo buscando errores antes de darlo por válido.
- LÓGICA DE EVENTOS (CRÍTICO): Configura un callback/listener en el framework de IA para que CADA pensamiento, cambio de estado o mensaje entre los agentes se publique inmediatamente en un canal de Redis (ej: `agency_events`) en formato JSON: { "agent": "Manager", "action": "hablando", "message": "..." }.
- Crea un endpoint POST con FastAPI para recibir la tarea inicial y disparar el trabajo del equipo.

PASO 3: GATEWAY & WEBSOCKETS (GOLANG)
- Inicializa el módulo en `/gateway`.
- Levanta un servidor concurrente que maneje dos flujos:
  1. Un endpoint HTTP POST que reciba el requerimiento del frontend y lo envíe al AI Worker (Python).
  2. Un servidor WebSocket hiper-rápido. Debe suscribirse al canal `agency_events` de Redis y hacer un stream (broadcast) en tiempo real de todos los JSONs hacia los clientes conectados.

PASO 4: FRONTEND VISUAL (NEXT.JS - LA OFICINA)
- Inicializa el proyecto en `/frontend`.
- Crea una UI moderna (Dashboard oscuro) dividida en 3 áreas principales:
  A. Input: Un formulario para enviar la tarea a la agencia.
  B. "La Oficina" (Live Feed): Un componente visual que consuma el WebSocket de Go. Debe renderizar un chat en tiempo real viendo la conversación entre el Manager, el Especialista y el QA. Usa distintos colores/avatares para cada agente.
  C. Output: Un panel donde se renderice el resultado final formateado.
- Asegura que la conexión WebSocket tenga reconexión automática.

Comienza generando la estructura de carpetas base y el archivo docker-compose.yml detallado. Avísame cuando estés listo para avanzar al Paso 2.
