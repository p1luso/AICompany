/**
 * Zustand Store para gestionar el estado de las tareas
 */
import { create } from "zustand";
import { AgentEvent, TaskRequest, StoredTask, SubTask } from "@/types";

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
  updateTaskFromEvent: (event: AgentEvent) => void;
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
      issues: [],
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

  // Actualizar tarea desde un evento de WebSocket
  updateTaskFromEvent: (event: AgentEvent) => {
    if (!event.task_id) return;

    set((state) => {
      const task = state.tasks[event.task_id!];
      if (!task) return state;

      let newStatus = task.status;
      const action = event.action;

      const processingActions = ["iniciando", "planificando", "trabajando", "revisando", "documentando", "validando"];
      if (processingActions.includes(action)) {
        newStatus = "processing";
      } else if (action === "completada") {
        newStatus = "completed";
      } else if (action === "error") {
        newStatus = "failed";
      }

      let normalizedAgent = event.agent.toLowerCase();
      if (normalizedAgent === "manager") normalizedAgent = "alice";

      // Copia profunda inicial
      const updatedTask: StoredTask = {
        ...task,
        status: newStatus,
        assignedAgent: normalizedAgent,
        events: [...task.events, event],
      };

      // Manejar creación de Issues
      if (action === "issues_created" && event.metadata?.issues) {
        updatedTask.issues = (event.metadata.issues as any[]).map((i: any) => ({
          id: i.id || Math.random().toString(36).substr(2, 9),
          title: i.title || i,
          status: "pending",
        }));
      }

      // Manejar actualización de un Issue específico
      if (event.metadata?.issue_id) {
        const issueId = event.metadata.issue_id as string;
        const issueStatus = (event.metadata.issue_status as SubTask["status"]) || "processing";
        
        updatedTask.issues = (updatedTask.issues || []).map((i) => 
          i.id === issueId
            ? { ...i, status: issueStatus, assignedAgent: event.agent }
            : i
        );
      }

      const isCurrentTask = state.currentTask?.id === event.task_id;

      return {
        tasks: { ...state.tasks, [event.task_id!]: updatedTask },
        currentTask: isCurrentTask ? updatedTask : state.currentTask,
        isLoading: newStatus === "processing",
      };
    });
  },

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
