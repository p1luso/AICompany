# 🏢 Oficina Virtual / Agencia Multi-Agente

Una arquitectura de microservicios orientada a eventos para una oficina virtual inteligente con agentes IA colaborativos.

## 📋 Estructura del Proyecto (Monorepo)

```
.
├── frontend/          # Next.js App Router (UI Dashboard)
├── gateway/           # Golang + Fiber/WebSockets (Orquestador)
├── ai-worker/         # Python + FastAPI + CrewAI (Lógica Multi-Agente)
├── docker-compose.yml # Orquestación completa
└── MASTER_PLAN.md     # Documento de arquitectura
```

## 🚀 Servicios Orquestados

| Servicio | Puerto | Tecnología | Propósito |
|----------|--------|-----------|----------|
| **Redis** | 6379 | Redis Alpine | Message Broker |
| **Gateway** | 8000 | Go + Fiber | HTTP API + WebSockets |
| **AI Worker** | 8001 | Python + FastAPI | Lógica Multi-Agente |
| **Frontend** | 3000 | Next.js | UI Dashboard |

## 🏗️ Arquitectura

```
Frontend (Next.js)
    ↓ HTTP POST (Tareas)
Gateway (Go WebSocket)
    ↓ HTTP POST
AI Worker (Python CrewAI)
    ↓ Publish Events
Redis Channel (agency_events)
    ↑ Subscribe
Gateway WebSocket
    ↓ Broadcast
Frontend (Live Feed)
```

## 📝 Fases de Desarrollo

- **FASE 1** ✅: Estructura base + docker-compose.yml
- **FASE 2**: AI Worker (CrewAI + Event Streaming)
- **FASE 3**: Gateway (HTTP + WebSockets)
- **FASE 4**: Frontend (Dashboard + Live Feed)

## 🎯 Próximos Pasos

Espera instrucciones para proceder a la **FASE 2: AI WORKER**.
