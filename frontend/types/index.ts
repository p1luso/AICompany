/**
 * Types y Interfaces para la aplicación
 */

// Evento de un agente
export interface AgentEvent {
  agent: "Manager" | "Especialista" | "QA" | "Gateway";
  action: string;
  message: string;
  timestamp: string;
  task_id?: string;
  metadata?: Record<string, unknown>;
}

// Solicitud de tarea
export interface TaskRequest {
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  deadline?: string;
}

// Respuesta de tarea creada
export interface TaskCreatedResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
}

// Estado de una tarea
export interface TaskStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: string;
  error?: string;
  request?: TaskRequest;
}

// Configuración de agentes con colores y avatares
export interface AgentConfig {
  name: string;
  color: string;
  bgColor: string;
  avatar: string;
}

// WebSocket connection status
export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

// Store task
export interface StoredTask {
  id: string;
  request: TaskRequest;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  events: AgentEvent[];
  result?: string;
}
