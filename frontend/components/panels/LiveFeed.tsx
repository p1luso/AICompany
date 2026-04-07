"use client";

import { useEffect, useRef } from "react";
import { AgentEvent } from "@/types";
import { AGENT_CONFIGS, ACTION_MESSAGES } from "@/lib/constants";

interface LiveFeedProps {
  events?: AgentEvent[] | null;
  isConnected: boolean;
}

export function LiveFeed({ events = [], isConnected }: LiveFeedProps) {
  const safeEvents = events || [];
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último evento
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const getAgentConfig = (agentName: string) => {
    return AGENT_CONFIGS[agentName] || AGENT_CONFIGS["Gateway"];
  };

  const getActionLabel = (action: string) => {
    return ACTION_MESSAGES[action] || `📌 ${action}`;
  };

  return (
    <div className="flex flex-col h-full glass-effect rounded-lg p-6 border border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-border">
        <h2 className="text-2xl font-bold text-gradient">🏢 La Oficina (Live Feed)</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-400">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {safeEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">⏳ Esperando eventos...</p>
              <p className="text-sm">Envía una tarea para ver la conversación en tiempo real</p>
            </div>
          </div>
        ) : (
          safeEvents.map((event, idx) => {
            const agentConfig = getAgentConfig(event.agent);
            const actionLabel = getActionLabel(event.action);

            return (
              <div
                key={idx}
                className="animate-slide-in p-4 rounded-lg border border-dark-border"
                style={{
                  backgroundColor: agentConfig.bgColor,
                  borderLeftWidth: "3px",
                  borderLeftColor: agentConfig.color,
                }}
              >
                {/* Agent Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{agentConfig.avatar}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: agentConfig.color }}>
                      {agentConfig.name}
                    </p>
                    <p className="text-xs text-gray-400">{actionLabel}</p>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-dark-text mb-2 leading-relaxed">{event.message}</p>

                {/* Timestamp */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString("es-ES")}
                  </span>
                  {event.task_id && (
                    <span className="text-xs px-2 py-1 bg-dark-card rounded text-gray-400">
                      ID: {event.task_id.substring(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-dark-border text-xs text-gray-400">
        {safeEvents.length > 0 && (
          <p>
            📊 Total eventos: <span className="font-semibold text-dark-text">{safeEvents.length}</span>
          </p>
        )}
      </div>
    </div>
  );
}
