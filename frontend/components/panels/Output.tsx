"use client";

import { StoredTask } from "@/types";

interface OutputProps {
  task: StoredTask | null;
}

export function Output({ task }: OutputProps) {
  if (!task) {
    return (
      <div className="glass-effect rounded-lg p-6 border border-dark-border h-full">
        <h2 className="text-2xl font-bold mb-6 text-gradient">📊 Resultado Final</h2>
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">⏳ Esperando resultado...</p>
            <p className="text-sm">El resultado aparecerá aquí cuando se complete la tarea</p>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = task.status === "processing";
  const isCompleted = task.status === "completed";
  const isFailed = task.status === "failed";

  return (
    <div className="glass-effect rounded-lg p-6 border border-dark-border h-full flex flex-col">
      <div className="mb-6 pb-4 border-b border-dark-border">
        <h2 className="text-2xl font-bold text-gradient mb-2">📊 Resultado Final</h2>

        {/* Task Info */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-400">Tarea:</span>{" "}
            <span className="font-semibold">{task.request.title}</span>
          </p>
          <p>
            <span className="text-gray-400">Estado:</span>{" "}
            <span className="font-semibold">
              {isProcessing && "⏳ Procesando..."}
              {isCompleted && "✅ Completada"}
              {isFailed && "❌ Error"}
              {task.status === "pending" && "⏸️ Pendiente"}
            </span>
          </p>
          {task.request.priority && (
            <p>
              <span className="text-gray-400">Prioridad:</span>{" "}
              <span className="font-semibold">
                {task.request.priority === "low" && "🟢 Baja"}
                {task.request.priority === "medium" && "🟡 Media"}
                {task.request.priority === "high" && "🔴 Alta"}
              </span>
            </p>
          )}
          <p>
            <span className="text-gray-400">Creada:</span>{" "}
            <span className="font-semibold">
              {new Date(task.createdAt).toLocaleString("es-ES")}
            </span>
          </p>
        </div>
      </div>

      {/* Result Content */}
      <div className="flex-1 overflow-y-auto">
        {isProcessing && (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">⏳ Procesando tarea...</p>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-agent-manager rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-agent-specialist rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-agent-qa rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200">
            <p className="font-semibold mb-2">Error durante el procesamiento</p>
            <p className="text-sm">{task.result || "No hay información adicional"}</p>
          </div>
        )}

        {isCompleted && task.result && (
          <div className="prose prose-invert max-w-none">
            <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
              <div className="whitespace-pre-wrap text-sm text-dark-text leading-relaxed">
                {task.result}
              </div>
            </div>
          </div>
        )}

        {!isProcessing && !isFailed && !isCompleted && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>Esperando resultado...</p>
          </div>
        )}
      </div>

      {/* Stats */}
      {task.events && task.events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-border text-xs text-gray-400">
          <p>
            📊 Eventos procesados:{" "}
            <span className="font-semibold text-dark-text">{task.events.length}</span>
          </p>
        </div>
      )}
    </div>
  );
}
