/**
 * Funciones para comunicarse con el Gateway
 */
import { TaskRequest, TaskCreatedResponse } from "@/types";
import { API_BASE_URL } from "./constants";

export async function createTask(request: TaskRequest): Promise<TaskCreatedResponse> {
  const response = await fetch(`${API_BASE_URL}/api/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Error creando tarea: ${response.statusText}`);
  }

  return response.json();
}

export async function getTaskStatus(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/api/task/${taskId}`);

  if (!response.ok) {
    throw new Error(`Error obteniendo estado: ${response.statusText}`);
  }

  return response.json();
}

export async function listTasks() {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);

  if (!response.ok) {
    throw new Error(`Error listando tareas: ${response.statusText}`);
  }

  return response.json();
}

export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
