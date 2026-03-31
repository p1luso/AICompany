/**
 * Zustand Store para gestionar el estado de las tareas
 */
import { create } from "zustand";
import { AgentEvent, TaskRequest, StoredTask } from "@/types";

interface TaskStore {
  // Estado
  currentTask: StoredTask | null;
  tasks: Record<string, StoredTask>;
  events: AgentEvent[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  createTask: (request: TaskRequest, taskId: string) => void;
  addEvent: (event: AgentEvent) => void;
  setCurrentTask: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: StoredTask["status"]) => void;
  setTaskResult: (taskId: string, result: string) => void;
  clearError: () => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  // Estado inicial
  currentTask: null,
  tasks: {},
  events: [],
  isLoading: false,
  error: null,

  // Crear nueva tarea
  createTask: (request: TaskRequest, taskId: string) => {
    const task: StoredTask = {
      id: taskId,
      request,
      status: "pending",
      createdAt: Date.now(),
      events: [],
    };

    set((state) => ({
      tasks: { ...state.tasks, [taskId]: task },
      currentTask: task,
      events: [],
      isLoading: true,
      error: null,
    }));
  },

  // Agregar evento
  addEvent: (event: AgentEvent) => {
    set((state) => {
      const updatedTask = state.currentTask
        ? {
            ...state.currentTask,
            events: [...state.currentTask.events, event],
          }
        : null;

      return {
        events: [...state.events, event],
        currentTask: updatedTask,
        tasks: updatedTask
          ? { ...state.tasks, [updatedTask.id]: updatedTask }
          : state.tasks,
      };
    });
  },

  // Establecer tarea actual
  setCurrentTask: (taskId: string) => {
    set((state) => ({
      currentTask: state.tasks[taskId] || null,
      events: state.tasks[taskId]?.events || [],
    }));
  },

  // Actualizar estado de tarea
  setTaskStatus: (taskId: string, status: StoredTask["status"]) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const updatedTask = { ...task, status };
      const isCurrentTask = state.currentTask?.id === taskId;

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        currentTask: isCurrentTask ? updatedTask : state.currentTask,
        isLoading: status === "processing",
      };
    });
  },

  // Establecer resultado
  setTaskResult: (taskId: string, result: string) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const updatedTask = { ...task, result, status: "completed" as const };
      const isCurrentTask = state.currentTask?.id === taskId;

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        currentTask: isCurrentTask ? updatedTask : state.currentTask,
        isLoading: false,
      };
    });
  },

  // Limpiar error
  clearError: () => set({ error: null }),

  // Establecer error
  setError: (error: string) =>
    set({
      error,
      isLoading: false,
    }),

  // Establecer cargando
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Reset
  reset: () =>
    set({
      currentTask: null,
      tasks: {},
      events: [],
      isLoading: false,
      error: null,
    }),
}));
