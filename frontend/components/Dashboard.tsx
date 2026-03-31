"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTaskStore } from "@/store/taskStore";
import { WS_URL } from "@/lib/constants";
import { AgentEvent } from "@/types";
import { TaskInput } from "./TaskInput";
import { LiveFeed } from "./LiveFeed";
import { Output } from "./Output";

export function Dashboard() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected"
  );

  const {
    currentTask,
    events,
    error: storeError,
    addEvent,
    setCurrentTask,
    clearError,
  } = useTaskStore();

  // Ensure component only renders after client hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // WebSocket hook
  const { status, isConnected } = useWebSocket({
    url: WS_URL,
    onMessage: (event: AgentEvent) => {
      addEvent(event);
      // Si es un evento de una tarea, establecerla como actual
      if (event.task_id && event.task_id !== currentTask?.id) {
        setCurrentTask(event.task_id);
      }
    },
    onConnect: () => setWsStatus("connected"),
    onDisconnect: () => setWsStatus("disconnected"),
    onError: () => setWsStatus("error"),
  });

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-slate-950 p-4">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">🏢 Oficina Virtual</h1>
            <p className="text-gray-400">Agencia Multi-Agente impulsada por IA</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {wsStatus === "connecting" && "Conectando..."}
                {wsStatus === "connected" && "Conectado"}
                {wsStatus === "disconnected" && "Desconectado"}
                {wsStatus === "error" && "Error de conexión"}
              </span>
            </div>
            <p className="text-xs text-gray-500">Gateway: {WS_URL}</p>
          </div>
        </div>

        {/* Error Banner */}
        {storeError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-200">{storeError}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm font-semibold"
            >
              Descartar
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max lg:auto-rows-fr">
        {/* Input Section - Left */}
        <div className="lg:row-span-2">
          <TaskInput
            onTaskCreated={(taskId) => {
              setCurrentTask(taskId);
              clearError();
            }}
          />
        </div>

        {/* Live Feed - Middle & Right (spanning 2 columns) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <LiveFeed events={events} isConnected={isConnected} />
        </div>

        {/* Output Section - Bottom */}
        <div className="lg:col-span-3 min-h-[400px] lg:min-h-[300px]">
          <Output task={currentTask} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-dark-border text-center text-sm text-gray-500">
        <p>
          Oficina Virtual v0.1.0 • {new Date().toLocaleDateString("es-ES")} •{" "}
          <a href="#" className="text-agent-manager hover:underline">
            Documentación
          </a>
        </p>
      </footer>
    </div>
  );
}
