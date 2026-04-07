"use client";

import { useState, useEffect, useRef } from "react";
import { useAgentTracker } from "@/hooks/useAgentTracker";
import { useAgentStore } from "@/store/agentStore";
import { AGENT_CONFIG } from "../office/Agent";
import { PixelOffice } from "../office/PixelOffice";
import { MemoryViewer } from "../panels/MemoryViewer";
import { TerminalLogs } from "../panels/TerminalLogs";
import { TaskModal } from "../panels/TaskModal";
import { Sidebar } from "./Sidebar";
import { KanbanBoard } from "../panels/KanbanBoard";
import { DeskModal } from "../panels/DeskModal";
import { useTaskStore } from "@/store/taskStore";
import { API_BASE_URL } from "@/lib/constants";

/* ─── AGENT STATUS BADGE ─────────────────────────────── */
function StatusBadge({ id }: { id: "alice" | "archie" | "atlas" | "luna" | "nova" | "sage" | "sentinel" }) {
  const agentsStatus = useAgentStore((state) => state.agents);
  const agent = agentsStatus[Object.keys(agentsStatus).find(k => k.toLowerCase() === id) || ""];
  const config = AGENT_CONFIG[id];
  const isActive = agent?.status === "ACTIVE";

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

/* ─── MISSION CONTROL ────────────────────────────────── */
export function MissionControl() {
  const agentsStatus = useAgentStore((state) => state.agents);
  const tick = useAgentStore((state) => state.tick);
  
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [deskModalAgent, setDeskModalAgent] = useState<string | null>(null);

  const { startTypingLoop, stopTypingLoop, playSuccess, unlockAudio } = require("@/lib/audio");
  const prevActiveCount = useRef(0);

  // Global store tick for inactivity timeout
  useEffect(() => {
    const timer = setInterval(() => tick(), 1000);
    return () => clearInterval(timer);
  }, [tick]);

  const { hydrateTasks } = useTaskStore();

  // Rehidratar tareas desde el backend al montar
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        if (response.ok) {
          const data = await response.json();
          if (data.tasks) {
            hydrateTasks(data.tasks);
          }
        }
      } catch (error) {
        console.error("❌ Error rehidratando tareas:", error);
      }
    };
    
    fetchTasks();
  }, [hydrateTasks]);

  const activeAgents = Object.values(agentsStatus).filter(a => a.status === "ACTIVE");
  const activeCount = activeAgents.length;

  useEffect(() => {
    if (activeCount > 0) {
      startTypingLoop();
    } else {
      stopTypingLoop();
      if (prevActiveCount.current > 0 && activeCount === 0) {
        playSuccess();
      }
    }
    prevActiveCount.current = activeCount;
  }, [activeCount, startTypingLoop, stopTypingLoop, playSuccess]);

  // SINCRO REAL-TIME: Combinar datos de WebSocket (Store) con Polling (Tracker)
  const storeAgents = useAgentStore((state) => state.agents);
  const trackerAgents = useAgentTracker();

  const officeAgents = trackerAgents.map(ta => {
    const sAgent = storeAgents[ta.id];
    // Prioridad absoluta al estado ACTIVE del WebSocket
    const isStoreActive = sAgent?.status === "ACTIVE";
    
    return {
      ...ta,
      state: isStoreActive ? "active" : ta.state
    };
  });

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
      {kanbanOpen && <KanbanBoard onClose={() => setKanbanOpen(false)} />}
      {deskModalAgent && <DeskModal agentId={deskModalAgent} onClose={() => setDeskModalAgent(null)} />}

      {/* HEADER BAR */}
      <header
        className="flex items-center gap-4 px-4 py-2 shrink-0"
        style={{
          background: "#0f0f1f",
          borderBottom: "4px solid #ffd700",
          boxShadow: "0 4px 0 #b8860b",
          minHeight: "48px",
        }}
      >
        <div 
          className="cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-white w-6 h-6 rounded-sm shadow-[2px_2px_0_#aaa]"
          onClick={() => setKanbanOpen(true)}
          title="Open Kanban Dashboard"
        >
          <div className="w-4 h-4 border-2 border-black border-t-4" />
        </div>

        <div className="flex items-center gap-2">
          <div className="font-pixel text-glow-gold" style={{ fontSize: "11px", color: "#ffd700" }}>
            LUVA MISSION CONTROL
          </div>
          <span className="font-pixel ml-1" style={{ fontSize: "7px", color: "#888", marginTop: "4px" }}>
            v1.1
          </span>
        </div>

        {/* Agent Status Badges */}
        <div className="flex items-center gap-2 ml-6">
          <StatusBadge id="alice" />
          <StatusBadge id="archie" />
          <StatusBadge id="atlas" />
          <StatusBadge id="nova" />
          <StatusBadge id="sentinel" />
          <StatusBadge id="sage" />
          <StatusBadge id="luna" />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ background: "#39ff14", boxShadow: "0 0 6px #39ff14" }} />
            <span className="font-pixel" style={{ fontSize: "7px", color: "#39ff14" }}>LIVE_SYNC</span>
          </div>
          <div className="font-pixel" style={{ fontSize: "9px", color: "#ffd700", letterSpacing: "1px" }}>
            {new Date().toLocaleTimeString("es-ES")}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden gap-0">
        <div className="relative flex-1 overflow-hidden" style={{ borderRight: "4px solid #0f3460" }}>
          <PixelOffice
            agents={officeAgents}
            onOpenTerminal={() => setTerminalOpen(true)}
            onOpenTaskModal={() => setTaskModalOpen(true)}
            onOpenKanban={() => setKanbanOpen(true)}
            onOpenDeskModal={(agentId) => setDeskModalAgent(agentId)}
          />
        </div>

        {/* SIDEBAR RIGHT */}
        <Sidebar />
      </div>

      {/* STATUS BAR */}
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
        <span style={{ color: activeCount > 0 ? "#39ff14" : "#444" }}>
          AGENTS: {activeCount}/{Object.keys(agentsStatus).length} ACTIVE
        </span>
        <span>|</span>
        <span>SYSTEM_STATUS: NOMINAL</span>
      </footer>
    </div>
  );
}
