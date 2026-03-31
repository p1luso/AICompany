/**
 * Constantes y configuraciones de la aplicación
 */
import { AgentConfig } from "@/types";

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  Manager: {
    name: "👨‍💼 Manager",
    color: "#10b981",
    bgColor: "bg-emerald-900/20",
    avatar: "👨‍💼",
  },
  Especialista: {
    name: "👨‍💻 Especialista",
    color: "#3b82f6",
    bgColor: "bg-blue-900/20",
    avatar: "👨‍💻",
  },
  QA: {
    name: "✅ QA/Reviewer",
    color: "#f59e0b",
    bgColor: "bg-amber-900/20",
    avatar: "✅",
  },
  Gateway: {
    name: "🌐 Gateway",
    color: "#8b5cf6",
    bgColor: "bg-purple-900/20",
    avatar: "🌐",
  },
};

export const ACTION_MESSAGES: Record<string, string> = {
  iniciando: "🚀 Iniciando",
  recibida: "📨 Tarea recibida",
  planificando: "📋 Planificando",
  trabajando: "⚙️ Trabajando",
  analizando: "🔍 Analizando",
  documentando: "📝 Documentando",
  revisando: "👀 Revisando",
  validando: "✔️ Validando",
  pensando: "💭 Pensando",
  hablando: "💬 Hablando",
  completada: "✅ Completada",
  error: "❌ Error",
  conectado: "🔌 Conectado",
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
