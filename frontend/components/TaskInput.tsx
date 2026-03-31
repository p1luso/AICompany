"use client";

import { useState } from "react";
import { TaskRequest } from "@/types";
import { createTask } from "@/lib/api";
import { useTaskStore } from "@/store/taskStore";

interface TaskInputProps {
  onTaskCreated?: (taskId: string) => void;
}

export function TaskInput({ onTaskCreated }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createTask: storeCreateTask, setError: setStoreError } = useTaskStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación
    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es requerida");
      return;
    }

    if (title.length < 5) {
      setError("El título debe tener al menos 5 caracteres");
      return;
    }

    if (description.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const taskRequest: TaskRequest = {
        title,
        description,
        priority,
      };

      const response = await createTask(taskRequest);

      // Guardar en store
      storeCreateTask(taskRequest, response.task_id);

      // Limpiar formulario
      setTitle("");
      setDescription("");
      setPriority("medium");

      onTaskCreated?.(response.task_id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creando la tarea";
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-effect rounded-lg p-6 border border-dark-border">
      <h2 className="text-2xl font-bold mb-6 text-gradient">📝 Nueva Tarea</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Título de la tarea
          </label>
          <input
            id="title"
            type="text"
            placeholder="Ej: Análisis de mercado para producto X"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-gray-500 focus:outline-none focus:border-agent-manager transition-colors"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Descripción detallada
          </label>
          <textarea
            id="description"
            placeholder="Describe qué necesitas que haga la agencia..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-gray-500 focus:outline-none focus:border-agent-manager transition-colors resize-none"
          />
        </div>

        {/* Priority Select */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-2">
            Prioridad
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-agent-manager transition-colors"
          >
            <option value="low">🟢 Baja</option>
            <option value="medium">🟡 Media</option>
            <option value="high">🔴 Alta</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-gradient-to-r from-agent-manager to-agent-specialist hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {isSubmitting ? "📤 Enviando..." : "🚀 Enviar Tarea"}
        </button>
      </form>
    </div>
  );
}
