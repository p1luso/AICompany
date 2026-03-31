# AI Worker - Lógica Multi-Agente

## 📌 Descripción

Servicio Python que implementa la lógica de la oficina virtual con 3 agentes colaborativos usando CrewAI/AutoGen:

1. **Manager**: Toma requerimientos, planifica, dirige la ejecución
2. **Especialista**: Ejecuta investigación, redacción, análisis
3. **QA/Reviewer**: Revisa calidad y valida resultados

## 🔄 Event Streaming

Cada evento de los agentes se publica en Redis canal `agency_events` en formato JSON:
```json
{
  "agent": "Manager",
  "action": "hablando",
  "message": "Iniciando análisis...",
  "timestamp": "2026-03-31T..."
}
```

## 📦 Stack

- **FastAPI**: API REST
- **CrewAI/AutoGen**: Framework multi-agente
- **Redis**: Message broker
- **Pydantic**: Validación de datos

## 🚀 Será completado en FASE 2
