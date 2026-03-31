# 🏢 Oficina Virtual / Agencia Multi-Agente (AICompany)

Una arquitectura de microservicios orientada a eventos para una oficina virtual inteligente con agentes IA colaborativos. Este proyecto implementa un ecosistema donde múltiples agentes de IA trabajan juntos, coordinados por un gateway central y visualizados en un dashboard en tiempo real.

## 🌟 Características

- **Arquitectura de Microservicios:** Servicios desacoplados en Go, Python y Next.js.
- **Comunicación en Tiempo Real:** WebSockets para actualizaciones instantáneas del estado de los agentes.
- **Orquestación Multi-Agente:** Utiliza CrewAI para la lógica de colaboración entre agentes.
- **Event-Driven:** Comunicación asíncrona mediante Redis.
- **Despliegue con Docker:** Configuración completa para entorno de desarrollo local.

## 📋 Estructura del Proyecto (Monorepo)

```bash
.
├── frontend/          # Next.js App Router (UI Dashboard)
├── gateway/           # Golang + Fiber/WebSockets (Orquestador)
├── ai-worker/         # Python + FastAPI + CrewAI (Lógica Multi-Agente)
├── docker-compose.yml # Orquestación completa
└── MASTER_PLAN.md     # Documento de arquitectura detallada
```

## 🚀 Servicios Orquestados

| Servicio | Puerto | Tecnología | Propósito |
|----------|--------|-----------|----------|
| **Redis** | 6379 | Redis Alpine | Message Broker (Pub/Sub) |
| **Gateway** | 8000 | Go + Fiber | HTTP API + WebSockets Relays |
| **AI Worker** | 8001 | Python + FastAPI | Motor de Agentes CrewAI |
| **Frontend** | 3000 | Next.js | Panel de Control y Visualización |

## 🏗️ Flujo de Datos

1. **Frontend** envía una tarea vía HTTP POST al **Gateway**.
2. **Gateway** delega la ejecución al **AI Worker**.
3. **AI Worker (Python)** procesa la tarea con múltiples agentes y publica eventos en **Redis**.
4. **Gateway** escucha los eventos de Redis y los retransmite por **WebSockets**.
5. **Frontend** recibe las actualizaciones en vivo y actualiza la UI.

## 🛠️ Instalación y Uso

### Requisitos previos
- Docker & Docker Compose
- Node.js (opcional, para desarrollo local del frontend)
- Go (opcional, para desarrollo local del gateway)
- Python 3.10+ (opcional, para desarrollo local del worker)

### Ejecución rápida con Docker
```bash
docker-compose up --build
```
Accede a `http://localhost:3000` para ver el dashboard.

## 📝 Estado del Proyecto

- [x] **FASE 1**: Estructura base + Docker Orchestration.
- [ ] **FASE 2**: Implementación detallada de AI Worker (CrewAI + Event Streaming).
- [ ] **FASE 3**: Robustecimiento del Gateway (Gestión de estados + WS).
- [ ] **FASE 4**: UI/UX Dashboard (Framer Motion + Live Feed).

---
*Desarrollado con ❤️ por Santi.*
