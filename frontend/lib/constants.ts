/**
 * Constantes y configuraciones de la aplicación
 */
import { AgentConfig } from "@/types";

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  Alice: {
    name: "Alice (Scrum Master)",
    color: "#4fc3f7",
    bgColor: "#4fc3f710",
    avatar: "🔍",
  },
  Archie: {
    name: "Archie (Architect)",
    color: "#818cf8",
    bgColor: "#818cf810",
    avatar: "📐",
  },
  Atlas: {
    name: "Atlas",
    color: "#ff9800",
    bgColor: "#ff980010",
    avatar: "🔧",
  },
  Sentinel: {
    name: "Sentinel",
    color: "#ff5252",
    bgColor: "#ff525210",
    avatar: "🛡️",
  },
  Luna: {
    name: "Luna",
    color: "#ab47bc",
    bgColor: "#ab47bc10",
    avatar: "🧪",
  },
  Nova: {
    name: "Nova",
    color: "#ec4899",
    bgColor: "#ec489910",
    avatar: "✨",
  },
  Sage: {
    name: "Sage (Researcher)",
    color: "#80d8ff",
    bgColor: "#80d8ff10",
    avatar: "🔎",
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
  en_diseno: "🎨 Diseñando UX/UI",
  in_progress: "⚙️ Implementando",
  testing: "🧪 Verificando calidad",
  validando_seguridad: "🛡️ Auditando seguridad",
  documentando_release: "📝 Documentando release",
  moviendo_ticket_to_do: "📋 Priorizando backlog",
  trabajando: "⚙️ Trabajando",
  analizando: "🔍 Analizando",
  documentando: "📝 Documentando",
  revisando: "👀 Revisando",
  validando: "✔️ Validando",
  pensando: "💭 Pensando",
  hablando: "💬 Hablando",
  completada: "✅ Completada",
  idle: "💤 En espera",
  error: "❌ Error",
  conectado: "🔌 Conectado",
  issues_created: "📋 Tickets creados",
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
