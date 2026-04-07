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
  const atlas    = agents.find((a) => a.id === "atlas");
  const luna     = agents.find((a) => a.id === "luna");
  const nova     = agents.find((a) => a.id === "nova");

  const reportVisible = scribe?.state === "active" || (scribe?.lastModified !== null);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0a1a" }}>

      {/* ── ROOM LABELS ─────────────────────────────────── */}
      <div className="absolute top-2 left-2 z-20 flex gap-3">
        {[
          { label: "🏢 Bullpen", color: "#ffd700" },
          { label: "📋 Project Room", color: "#4fc3f7" },
          { label: "🖥️ Data Center", color: "#ef5350" },
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
          OFFICE LAYOUT
         ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex flex-col" style={{ padding: "28px 8px 8px" }}>

        {/* TOP ROW: Main Office + Project Room */}
        <div className="flex flex-1 gap-2 mb-2" style={{ maxHeight: "65%" }}>

          {/* ── MAIN OFFICE (The Bullpen) ───────────────── */}
          <div
            className="relative flex-1 floor-tiles overflow-hidden room-glow-warm"
            style={{ border: "4px solid #8B6914", borderBottom: "4px solid #5D4037" }}
          >
            {/* WALL */}
            <div
              className="absolute top-0 left-0 right-0 h-6"
              style={{ background: "linear-gradient(180deg, #1a237e 0%, #283593 100%)", borderBottom: "3px solid #1a1a5e" }}
            />

            {/* WALL DECORATIONS */}
            <div className="absolute top-1 left-3"><Bookcase /></div>
            <div className="absolute top-1 left-20"><Window /></div>
            <div className="absolute top-1" style={{ left: "130px" }}><Whiteboard /></div>
            <div className="absolute top-1" style={{ right: "80px" }}><Window /></div>
            <div className="absolute top-0" style={{ right: "40px" }}><WallClock /></div>

            {/* LIGHTING */}
            <div className="absolute bottom-4 right-10"><CoffeeMachine /></div>
            <div className="absolute top-10 left-2"><WaterCooler /></div>
            <div className="absolute top-6 right-3"><Plant /></div>

            {/* DESKS - The 5 Desk Bullpen */}
            {/* Desk 1: Alice */}
            <div className="absolute bottom-12" style={{ left: "15px" }} onClick={onOpenTaskModal}>
              <Desk color="#a0522d" />
            </div>
            {/* Desk 2: Atlas */}
            <div className="absolute bottom-12" style={{ left: "70px" }} onClick={onOpenTaskModal}>
              <Desk color="#8B6914" />
            </div>
            {/* Desk 3: Scribe */}
            <div className="absolute bottom-12" style={{ left: "135px" }} onClick={onOpenTaskModal}>
              <Desk color="#5D4037" />
            </div>
             {/* Desk 4: Luna */}
             <div className="absolute bottom-12" style={{ left: "200px" }} onClick={onOpenTaskModal}>
              <Desk color="#8B6914" />
            </div>
            {/* Desk 5: Nova (Special Spot) */}
            <div className="absolute top-8 left-2" onClick={onOpenTaskModal}>
              <div className="transform scale-90 opacity-80">
                <Desk color="#607D8B" />
              </div>
            </div>

            {/* AGENTS */}
            <Agent id="alice"    state={alice?.state ?? "idle"} />
            <Agent id="atlas"    state={atlas?.state ?? "idle"} />
            <Agent id="scribe"   state={scribe?.state ?? "idle"} />
            <Agent id="luna"     state={luna?.state ?? "idle"} />
            <Agent id="nova"     state={nova?.state ?? "idle"} />

            {/* Wall right edge */}
            <div
              className="absolute top-0 bottom-0 right-0 w-1"
              style={{ background: "#5D4037", boxShadow: "inset -2px 0 0 #3E2723" }}
            />
          </div>

          {/* ── PROJECT ROOM ───────────────────────── */}
          <div
            className="relative overflow-hidden room-glow-cold"
            style={{
              width: "180px",
              background: "#e8f4f8",
              border: "4px solid #4fc3f7",
              backgroundImage: "repeating-conic-gradient(#daeef5 0% 25%, #c8e6f2 0% 50%)",
              backgroundSize: "16px 16px",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-5"
              style={{ background: "linear-gradient(180deg, #0277BD 0%, #0288D1 100%)", borderBottom: "3px solid #01579B" }}
            />

            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <div className="relative">
                <ConferenceTable />
                <ReportIcon visible={reportVisible} />
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2"><Plant /></div>
            <div className="absolute top-6 right-2">
              <svg viewBox="0 0 10 12" width={30} height={36} style={{ imageRendering: "pixelated" }}>
                <rect x="0" y="0" width="10" height="12" fill="#CFD8DC" />
                <rect x="1" y="1" width="8" height="10" fill="#FFF" />
                <rect x="2" y="3" width="6" height="1" fill="#4fc3f7" />
                <rect x="2" y="5" width="6" height="1" fill="#B0BEC5" />
                <rect x="2" y="7" width="4" height="1" fill="#B0BEC5" />
              </svg>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Server Room / Data Center */}
        <div
          className="relative overflow-hidden room-glow-server"
          style={{
            height: "120px",
            background: "#0a0a0a",
            border: "4px solid #ef5350",
            backgroundImage: "repeating-linear-gradient(0deg, #111 0px, #111 4px, #0a0a0a 4px, #0a0a0a 8px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-5"
            style={{ background: "linear-gradient(180deg, #7f0000 0%, #B71C1C 100%)", borderBottom: "3px solid #4a0000" }}
          />

          <div className="absolute top-6 left-0 right-0 flex items-start gap-4 px-6">
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            
            <div className="ml-auto flex flex-col gap-2">
               <div className="font-pixel" style={{ fontSize: "5px", color: "#ef5350" }}>SECURE AREA</div>
               <div className="flex gap-1">
                 <div style={{ width: "4px", height: "4px", background: "#39ff14", animation: "pulse 2s infinite" }} />
                 <div style={{ width: "4px", height: "4px", background: "#ef5350", animation: "pulse 1.5s infinite" }} />
               </div>
            </div>
          </div>

          <Agent id="sentinel" state={sentinel?.state ?? "idle"} />

          {/* Wiring */}
          <div className="absolute bottom-4 left-0 right-0 h-1" style={{ background: "repeating-linear-gradient(90deg, #1565C0 0, #1565C0 10px, transparent 10px, transparent 20px)", opacity: 0.2 }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
