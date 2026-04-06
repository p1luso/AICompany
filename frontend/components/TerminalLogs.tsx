"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AgentEvent } from "@/types";
import { WS_URL } from "@/lib/constants";

const AGENT_COLORS: Record<string, string> = {
  Manager:  "#4fc3f7",
  Scribe:   "#81c784",
  Sentinel: "#ef5350",
  Gateway:  "#ce93d8",
};

const ACTION_ICONS: Record<string, string> = {
  iniciando:    ">>",
  planificando: "::",
  trabajando:   "=>",
  documentando: "<<",
  revisando:    "??",
  validando:    "OK",
  completada:   "##",
  error:        "!!",
};

interface TerminalLogsProps {
  open: boolean;
  onClose: () => void;
}

export function TerminalLogs({ open, onClose }: TerminalLogsProps) {
  const [logs, setLogs] = useState<AgentEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { unlockAudio, playBlip } = require("@/lib/audio");

  const handleMessage = useCallback((event: AgentEvent) => {
    setLogs((prev) => [...prev.slice(-200), event]);
    playBlip(); // Play SFX on new message
  }, []);

  const { isConnected } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
  });

  // Unlock audio when user opens logs
  useEffect(() => {
    if (open) unlockAudio();
  }, [open]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return "--:--:--"; }
  };

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col"
        style={{
          width: "min(800px, 90vw)",
          height: "min(500px, 70vh)",
          background: "#0a0a0a",
          border: "4px solid #ef5350",
          boxShadow: "0 0 40px rgba(239,83,80,0.2), 8px 8px 0 #7f0000",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0"
          style={{ background: "#0f0f1f", borderBottom: "3px solid #ef535066" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                onClick={onClose}
                style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef5350", cursor: "pointer" }}
              />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffd700" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#39ff14" }} />
            </div>
            <span className="font-pixel" style={{ fontSize: "8px", color: "#ef5350" }}>
              SERVER_TERMINAL
            </span>
            <span className="font-pixel" style={{ fontSize: "7px", color: "#39ff14" }}>
              ~ AGENT_LOGS
            </span>
            <span className="terminal-cursor font-pixel" style={{ fontSize: "7px" }} />
          </div>

          <div className="flex items-center gap-3">
            <div
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isConnected ? "#39ff14" : "#ef5350",
                boxShadow: isConnected ? "0 0 8px #39ff14" : "0 0 8px #ef5350",
              }}
            />
            <span className="font-pixel" style={{ fontSize: "6px", color: isConnected ? "#39ff14" : "#ef5350" }}>
              {isConnected ? "WS:CONNECTED" : "WS:OFFLINE"}
            </span>
            <span className="font-pixel" style={{ fontSize: "6px", color: "#555" }}>
              [{logs.length} logs]
            </span>
            <button
              onClick={onClose}
              className="font-pixel"
              style={{ fontSize: "9px", color: "#ef5350", background: "none", border: "none", cursor: "pointer" }}
            >
              [X]
            </button>
          </div>
        </div>

        {/* Logs */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "7px", lineHeight: "18px" }}
        >
          {/* Boot messages */}
          <div style={{ color: "#333", marginBottom: "8px" }}>
            <div>{">"} Luva Mission Control v1.0</div>
            <div>{">"} Connecting to gateway ws...</div>
            <div style={{ color: isConnected ? "#39ff14" : "#ef5350" }}>
              {">"} Status: {isConnected ? "CONNECTED" : "WAITING FOR CONNECTION..."}
            </div>
            <div style={{ color: "#222" }}>---</div>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span style={{ color: "#333", fontSize: "8px" }}>
                Esperando actividad de los agentes...
              </span>
              <span style={{ color: "#222", fontSize: "6px" }}>
                Envia una tarea desde el escritorio para ver logs en tiempo real
              </span>
            </div>
          ) : (
            logs.map((log, idx) => {
              const agentColor = AGENT_COLORS[log.agent] || "#888";
              const icon = ACTION_ICONS[log.action] || ">>";
              return (
                <div key={idx} className="flex gap-1.5 mb-0.5" style={{ wordBreak: "break-word" }}>
                  <span style={{ color: "#444", flexShrink: 0 }}>
                    [{formatTime(log.timestamp)}]
                  </span>
                  <span style={{ color: "#555", flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: agentColor, flexShrink: 0, textShadow: `0 0 6px ${agentColor}66` }}>
                    {log.agent}:
                  </span>
                  <span style={{ color: "#b0b0b0" }}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-1.5 shrink-0 font-pixel"
          style={{ borderTop: "2px solid #1a1a3a", background: "#080810", fontSize: "6px", color: "#333" }}
        >
          <span>
            <span style={{ color: "#39ff14" }}>$</span> tail -f /var/log/agents.log
          </span>
          <div className="flex gap-3">
            {!autoScroll && (
              <button
                onClick={() => {
                  setAutoScroll(true);
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ color: "#ffd700", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: "inherit" }}
              >
                SCROLL TO BOTTOM
              </button>
            )}
            <span style={{ color: "#555" }}>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
