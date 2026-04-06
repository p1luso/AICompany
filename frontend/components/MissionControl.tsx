"use client";

import { useState, useEffect, useRef } from "react";
import { useAgentTracker } from "@/hooks/useAgentTracker";
import { AGENT_CONFIG } from "./PixelOffice/Agent";
import { PixelOffice } from "./PixelOffice";
import { MemoryViewer } from "./MemoryViewer";
import { TerminalLogs } from "./TerminalLogs";
import { TaskModal } from "./TaskModal";

/* ─── AGENT STATUS BADGE ─────────────────────────────── */
function StatusBadge({ id }: { id: "alice" | "scribe" | "sentinel" }) {
  const agents  = useAgentTracker();
  const agent   = agents.find((a) => a.id === id);
  const config  = AGENT_CONFIG[id];
  const isActive = agent?.state === "active";

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 font-pixel"
      style={{
        border: `2px solid ${config.color}`,
        background: isActive ? `${config.color}22` : "transparent",
        fontSize: "7px",
        color: config.color,
        boxShadow: isActive ? `0 0 8px ${config.color}` : "none",
        transition: "all 0.3s",
      }}
    >
      <span style={{ fontSize: "10px" }}>{config.emoji}</span>
      <span>{config.name}</span>
      <div
        className="w-1.5 h-1.5 ml-1"
        style={{
          background: isActive ? "#39ff14" : "#333",
          boxShadow: isActive ? "0 0 6px #39ff14" : "none",
        }}
      />
    </div>
  );
}

/* ─── CLOCK ──────────────────────────────────────────── */
function PixelClock() {
  const now = new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="font-pixel text-glow-gold"
      style={{ fontSize: "10px", color: "#ffd700", letterSpacing: "2px" }}
    >
      {now}
    </div>
  );
}

/* ─── MISSION CONTROL ────────────────────────────────── */
export function MissionControl() {
  const agents = useAgentTracker();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const { startTypingLoop, stopTypingLoop, playSuccess, unlockAudio } = require("@/lib/audio");
  const prevActiveCount = useRef(0);

  useEffect(() => {
    const activeCount = agents.filter(a => a.state === "active").length;
    
    if (activeCount > 0) {
      startTypingLoop();
    } else {
      stopTypingLoop();
      // If we just finished having active agents, play success jingle
      if (prevActiveCount.current > 0 && activeCount === 0) {
        playSuccess();
      }
    }
    prevActiveCount.current = activeCount;
  }, [agents, startTypingLoop, stopTypingLoop, playSuccess]);

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-pixel-bg"
      onClick={() => {
        try { unlockAudio(); } catch (e) {}
      }}
    >

      {/* MODALS */}
      <TerminalLogs open={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <MemoryViewer />

      {/* ══════════════════════════════════════════
          HEADER BAR
         ══════════════════════════════════════════ */}
      <header
        className="flex items-center gap-4 px-4 py-2 shrink-0"
        style={{
          background: "#0f0f1f",
          borderBottom: "4px solid #ffd700",
          boxShadow: "0 4px 0 #b8860b",
          minHeight: "48px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "20px" }}>🎮</span>
          <div className="font-pixel text-glow-gold" style={{ fontSize: "11px", color: "#ffd700" }}>
            LUVA MISSION CONTROL
          </div>
          <span
            className="font-pixel ml-1"
            style={{ fontSize: "7px", color: "#888", marginTop: "4px" }}
          >
            v1.0
          </span>
        </div>

        {/* Agent Status Badges */}
        <div className="flex items-center gap-2 ml-6">
          <StatusBadge id="alice" />
          <StatusBadge id="scribe" />
          <StatusBadge id="sentinel" />
        </div>

        {/* Right side: clock + connection */}
        <div className="ml-auto flex items-center gap-4">
          <div
            className="font-pixel"
            style={{ fontSize: "7px", color: "#4fc3f7" }}
          >
            POLLING: 10s
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2"
              style={{ background: "#39ff14", boxShadow: "0 0 6px #39ff14" }}
            />
            <span className="font-pixel" style={{ fontSize: "7px", color: "#39ff14" }}>
              LIVE
            </span>
          </div>
          <div
            className="font-pixel"
            style={{ fontSize: "9px", color: "#ffd700", letterSpacing: "1px" }}
          >
            {new Date().toLocaleTimeString("es-ES")}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden gap-0">

        {/* ── CENTRAL: OFFICE VIEWPORT ─────────────── */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{ borderRight: "4px solid #0f3460" }}
        >
          <div
            className="absolute top-2 right-3 z-10 font-pixel"
            style={{
              fontSize: "6px",
              color: "#333",
              background: "#0a0a1a",
              padding: "2px 6px",
              border: "1px solid #1a1a3a",
            }}
          >
            ISOMETRIC VIEW v1.0
          </div>
          <PixelOffice
            agents={agents}
            onOpenTerminal={() => setTerminalOpen(true)}
            onOpenTaskModal={() => setTaskModalOpen(true)}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATUS BAR (bottom)
         ══════════════════════════════════════════ */}
      <footer
        className="flex items-center gap-6 px-4 shrink-0 font-pixel"
        style={{
          background: "#0f0f1f",
          borderTop: "3px solid #0f3460",
          height: "24px",
          fontSize: "6px",
          color: "#444",
        }}
      >
        <span style={{ color: "#ffd700" }}>◆</span>
        <span>Agents: {agents.filter((a) => a.state === "active").length}/{agents.length} active</span>
        <span>|</span>
        <span>Memory polling: 10s interval</span>
        <span className="ml-auto">
          {agents.map((a) => (
            <span key={a.id} className="mr-2">
              {AGENT_CONFIG[a.id].emoji}
              {a.lastFile ? ` ${a.lastFile.split(".")[0]}` : " --"}
            </span>
          ))}
        </span>
      </footer>
    </div>
  );
}
