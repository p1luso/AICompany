"use client";

import { AgentStatus } from "@/hooks/useAgentTracker";
import { Agent } from "./Agent";
import { Desk, ConferenceTable, ReportIcon, Bookcase, ServerRack, Plant, CoffeeMachine, WaterCooler, Window, Whiteboard, WallClock } from "./Furniture";

interface PixelOfficeProps {
  agents: AgentStatus[];
  onOpenTerminal?: () => void;
  onOpenTaskModal?: () => void;
}

export function PixelOffice({ agents, onOpenTerminal, onOpenTaskModal }: PixelOfficeProps) {
  const alice    = agents.find((a) => a.id === "alice");
  const scribe   = agents.find((a) => a.id === "scribe");
  const sentinel = agents.find((a) => a.id === "sentinel");

  const reportVisible = scribe?.state === "active" || (scribe?.lastModified !== null);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0a1a" }}>

      {/* ── ROOM LABELS ─────────────────────────────────── */}
      <div className="absolute top-2 left-2 z-20 flex gap-3">
        {[
          { label: "🏢 Main Office", color: "#ffd700", icon: "■" },
          { label: "📋 Report Room", color: "#4fc3f7", icon: "■" },
          { label: "🖥️ Server Room", color: "#ef5350", icon: "■" },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="font-pixel text-2xs px-2 py-1"
            style={{
              color,
              fontSize: "6px",
              border: `2px solid ${color}`,
              background: "#0a0a1ae0",
              boxShadow: `0 0 4px ${color}33`,
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          OFFICE LAYOUT — 3-room top-down pixel art view
         ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex flex-col" style={{ padding: "28px 8px 8px" }}>

        {/* TOP ROW: Main Office + Report Room */}
        <div className="flex flex-1 gap-2 mb-2">

          {/* ── MAIN OFFICE ─────────────────────────── */}
          <div
            className="relative flex-1 floor-tiles overflow-hidden room-glow-warm"
            style={{ border: "4px solid #8B6914", borderBottom: "4px solid #5D4037" }}
          >
            {/* WALL — top strip with detail */}
            <div
              className="absolute top-0 left-0 right-0 h-6"
              style={{ background: "linear-gradient(180deg, #1a237e 0%, #283593 100%)", borderBottom: "3px solid #1a1a5e" }}
            />

            {/* ── WALL DECORATIONS ─────── */}
            <div className="absolute top-1 left-3"><Bookcase /></div>
            <div className="absolute top-1 left-16"><Window /></div>
            <div className="absolute top-1" style={{ left: "130px" }}><Whiteboard /></div>
            <div className="absolute top-0" style={{ right: "90px" }}><WallClock /></div>

            {/* Window light pool on floor */}
            <div
              className="absolute window-light"
              style={{
                top: "40px",
                left: "60px",
                width: "60px",
                height: "80px",
                background: "linear-gradient(180deg, rgba(79,195,247,0.08) 0%, transparent 100%)",
                clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              }}
            />

            {/* ── FURNITURE ────────────── */}
            <div className="absolute top-6 right-3"><Plant /></div>
            <div className="absolute bottom-4 right-10"><CoffeeMachine /></div>
            <div className="absolute top-10 left-2"><WaterCooler /></div>

            {/* Ceiling lamp light pool */}
            <div
              className="absolute lamp-pool"
              style={{
                bottom: "30px",
                left: "30px",
                width: "80px",
                height: "50px",
                background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute lamp-pool"
              style={{
                bottom: "30px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "50px",
                background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)",
                animationDelay: "2s",
              }}
            />

            {/* DESKS (clickeable — abre task modal) */}
            <div
              className="absolute bottom-16 left-6 cursor-pointer hover:brightness-125 transition-all group"
              onClick={onOpenTaskModal}
              title="Dejar tarea en el escritorio"
            >
              <Desk color="#a0522d" />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-pixel opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ fontSize: "5px", color: "#ffd700", textShadow: "0 0 4px #ffd70066" }}
              >
                + NUEVA TAREA
              </div>
            </div>
            <div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 cursor-pointer hover:brightness-125 transition-all group"
              onClick={onOpenTaskModal}
              title="Dejar tarea en el escritorio"
            >
              <Desk color="#8B6914" />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-pixel opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ fontSize: "5px", color: "#ffd700", textShadow: "0 0 4px #ffd70066" }}
              >
                + NUEVA TAREA
              </div>
            </div>

            {/* Rug under desks */}
            <div
              className="absolute"
              style={{
                bottom: "8px",
                left: "4px",
                right: "40%",
                height: "12px",
                background: "#8B2252",
                opacity: 0.2,
                borderRadius: "0",
              }}
            />

            {/* AGENTS */}
            <Agent id="alice" state={alice?.state ?? "idle"} />
            <Agent id="scribe" state={scribe?.state ?? "idle"} />

            {/* Wall right edge */}
            <div
              className="absolute top-0 bottom-0 right-0 w-1"
              style={{ background: "#5D4037", boxShadow: "inset -2px 0 0 #3E2723" }}
            />
          </div>

          {/* ── REPORT ROOM ─────────────────────────── */}
          <div
            className="relative overflow-hidden room-glow-cold"
            style={{
              width: "220px",
              background: "#e8f4f8",
              border: "4px solid #4fc3f7",
              backgroundImage: "repeating-conic-gradient(#daeef5 0% 25%, #c8e6f2 0% 50%)",
              backgroundSize: "16px 16px",
            }}
          >
            {/* Wall */}
            <div
              className="absolute top-0 left-0 right-0 h-5"
              style={{ background: "linear-gradient(180deg, #0277BD 0%, #0288D1 100%)", borderBottom: "3px solid #01579B" }}
            />

            {/* Wall poster */}
            <div className="absolute top-1 left-2 poster">
              <svg viewBox="0 0 8 10" width={24} height={30} style={{ imageRendering: "pixelated" }}>
                <rect x="0" y="0" width="8" height="10" fill="#FFF9C4" />
                <rect x="1" y="1" width="6" height="1" fill="#F57F17" />
                <rect x="1" y="3" width="4" height="1" fill="#9E9E9E" />
                <rect x="1" y="5" width="5" height="1" fill="#9E9E9E" />
                <rect x="1" y="7" width="3" height="1" fill="#9E9E9E" />
                <rect x="5" y="7" width="2" height="2" fill="#E53935" opacity="0.5" />
              </svg>
            </div>

            {/* Conference area */}
            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <div className="relative">
                <ConferenceTable />
                <ReportIcon visible={reportVisible} />
              </div>
            </div>

            {/* Floor lamp */}
            <div className="absolute bottom-3 right-3">
              <svg viewBox="0 0 6 12" width={18} height={36} style={{ imageRendering: "pixelated" }}>
                <rect x="1" y="0" width="4" height="3" fill="#FDD835" opacity="0.9" />
                <rect x="0" y="0" width="6" height="1" fill="#FFF176" opacity="0.6" />
                <rect x="2" y="3" width="2" height="8" fill="#757575" />
                <rect x="0" y="10" width="6" height="2" fill="#616161" />
              </svg>
            </div>

            {/* Lamp light pool */}
            <div
              className="absolute lamp-pool"
              style={{
                bottom: "2px",
                right: "2px",
                width: "50px",
                height: "30px",
                background: "radial-gradient(ellipse, rgba(255,215,0,0.1) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>

        {/* BOTTOM ROW: Server Room (full width) */}
        <div
          className="relative overflow-hidden room-glow-server"
          style={{
            height: "130px",
            background: "#0a0a0a",
            border: "4px solid #ef5350",
            backgroundImage: "repeating-linear-gradient(0deg, #111 0px, #111 4px, #0a0a0a 4px, #0a0a0a 8px)",
          }}
        >
          {/* Wall */}
          <div
            className="absolute top-0 left-0 right-0 h-5"
            style={{ background: "linear-gradient(180deg, #7f0000 0%, #B71C1C 100%)", borderBottom: "3px solid #4a0000" }}
          />

          {/* WARNING sign on wall */}
          <div className="absolute top-0 left-4 font-pixel" style={{ fontSize: "5px", color: "#FDD835", zIndex: 5 }}>
            ⚡ SERVER ROOM
          </div>

          {/* Ambient green glow from servers */}
          <div
            className="absolute"
            style={{
              top: "30px",
              left: "20px",
              width: "200px",
              height: "60px",
              background: "radial-gradient(ellipse, rgba(57,255,20,0.04) 0%, transparent 70%)",
            }}
          />

          <div className="absolute top-5 left-0 right-0 flex items-end gap-4 px-6 pt-2">
            {/* Server racks (clickeables — abren terminal) */}
            <div
              className="cursor-pointer hover:brightness-125 transition-all group"
              onClick={onOpenTerminal}
              title="Abrir terminal de logs"
            >
              <ServerRack />
              <div className="font-pixel text-center opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                style={{ fontSize: "4px", color: "#39ff14", textShadow: "0 0 4px #39ff1466" }}
              >
                TERMINAL
              </div>
            </div>
            <div className="cursor-pointer hover:brightness-125 transition-all" onClick={onOpenTerminal}>
              <ServerRack />
            </div>
            <div className="cursor-pointer hover:brightness-125 transition-all" onClick={onOpenTerminal}>
              <ServerRack />
            </div>

            {/* Sentinel agent */}
            <Agent id="sentinel" state={sentinel?.state ?? "idle"} />

            {/* Network switch panel */}
            <div className="ml-auto mr-4 self-center cursor-pointer hover:brightness-125 transition-all" onClick={onOpenTerminal}>
              <svg viewBox="0 0 24 10" width={72} height={30} style={{ imageRendering: "pixelated" }}>
                <rect x="0" y="0" width="24" height="10" fill="#1a1a1a" />
                <rect x="0" y="0" width="24" height="1" fill="#333" />
                {/* Port LEDs */}
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <rect
                    key={i}
                    x={1 + i*3} y={3} width={2} height={2}
                    fill={i % 3 === 0 ? "#39ff14" : i % 3 === 1 ? "#4fc3f7" : "#555"}
                    style={{ animation: `serverBlink ${0.8 + i * 0.15}s step-end infinite` }}
                  />
                ))}
                {/* Ethernet ports */}
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <rect
                    key={`port-${i}`}
                    x={1 + i*3} y={6} width={2} height={2}
                    fill="#222"
                  />
                ))}
                <rect x="0" y="9" width="24" height="1" fill="#0a0a0a" />
              </svg>
            </div>
          </div>

          {/* Floor cables */}
          <div className="absolute bottom-4 left-12" style={{ width: "60px", height: "2px", background: "#1565C0", opacity: 0.3, transform: "rotate(-5deg)" }} />
          <div className="absolute bottom-6 left-20" style={{ width: "40px", height: "2px", background: "#ef5350", opacity: 0.2, transform: "rotate(3deg)" }} />
          <div className="absolute bottom-3 left-40" style={{ width: "50px", height: "2px", background: "#39ff14", opacity: 0.2, transform: "rotate(-2deg)" }} />

          {/* Ventilation grille */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3"
            style={{
              background: "repeating-linear-gradient(90deg, #333 0px, #333 4px, transparent 4px, transparent 12px)",
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}
