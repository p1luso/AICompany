/**
 * Constantes y configuraciones de la aplicación
 */
import { AgentConfig } from "@/types";

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  Manager: {
    name: "Alice",
    color: "#4fc3f7",
    bgColor: "#4fc3f710",
    avatar: "🔍",
  },
  Scribe: {
    name: "Scribe",
    color: "#81c784",
    bgColor: "#81c78410",
    avatar: "✍️",
  },
  Sentinel: {
    name: "Sentinel",
    color: "#ef5350",
    bgColor: "#ef535010",
    avatar: "🛡️",
  },
  Gateway: {
    name: "Gateway",
    color: "#ce93d8",
    bgColor: "#ce93d810",
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
