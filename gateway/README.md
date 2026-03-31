# Gateway - Orquestador con WebSockets

## 📌 Descripción

Servicio Go que actúa como orquestador central:

### Flujos Principales

1. **HTTP POST `/api/task`**: Recibe requerimientos del frontend
   - Envía a AI Worker (Python)
   - Retorna task ID

2. **WebSocket `/ws`**: Stream de eventos en tiempo real
   - Se suscribe a canal `agency_events` en Redis
   - Hace broadcast de eventos a clientes conectados
   - Reconexión automática

## 📦 Stack

- **Golang 1.21**: Lenguaje
- **Fiber/Gorilla**: Framework HTTP + WebSocket
- **Redis**: Suscripción a eventos
- **Concurrencia nativa**: Goroutines

## 🚀 Será completado en FASE 3
