"use client";

import { AgentStatus } from "@/hooks/useAgentTracker";
import { Agent } from "./Agent";
import { Desk, ConferenceTable, ReportIcon, Bookcase, ServerRack, Plant, CoffeeMachine, WaterCooler, Window, Whiteboard, WallClock, CeoDesk, FilingCabinet, Printer, OfficeRug, DeskPhone, TrashBin, CoatRack, NoticeBoard } from "./Furniture";

interface PixelOfficeProps {
  agents: AgentStatus[];
  onOpenTerminal?: () => void;
  onOpenTaskModal?: () => void;
  onOpenKanban?: () => void;
  onOpenDeskModal?: (agentId: string) => void;
}

export function PixelOffice({ agents, onOpenTerminal, onOpenTaskModal, onOpenKanban, onOpenDeskModal }: PixelOfficeProps) {
  const alice    = agents.find((a) => a.id === "alice");
  const archie   = agents.find((a) => a.id === "archie");
  const atlas    = agents.find((a) => a.id === "atlas");
  const luna     = agents.find((a) => a.id === "luna");
  const nova     = agents.find((a) => a.id === "nova");
  const sage     = agents.find((a) => a.id === "sage");

  const reportVisible = !!(alice?.lastModified || archie?.lastModified);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0a1a" }}>

      {/* ── ROOM LABELS (Top Bar) ───────────────────── */}
      <div className="absolute top-2 left-2 z-20 flex gap-2">
        <label className="room-tab bg-[#ffd700] text-black">BULLPEN</label>
        <label className="room-tab border-2 border-[#4fc3f7] text-[#4fc3f7]">PROJECT ROOM</label>
        <label className="room-tab border-2 border-[#ef5350] text-[#ef5350]">DATA CENTER</label>
      </div>

      <div className="absolute inset-0 flex flex-col pt-10 px-2 pb-2 overflow-hidden">

        {/* TOP SECTION: Main Office + Project Room */}
        <div className="flex flex-1 gap-2 min-h-0 mb-2">

          {/* BULLPEN AREA */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              background: "#d4b483",
              border: "4px solid #8B6914",
              backgroundImage: "radial-gradient(#c2a375 1px, transparent 0)",
              backgroundSize: "20px 20px"
            }}
          >
            {/* Wall Top Detail */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-[#5D4037] border-b-2 border-[#3E2723]" />

            {/* ── WALL DECORATIONS ──── */}
            <div className="absolute top-1 left-4 scale-90 opacity-80"><Bookcase /></div>
            <div className="absolute top-8 left-[18%] scale-110"><Window /></div>
            <div className="absolute top-8 left-[78%] scale-110"><Window /></div>
            <div className="absolute top-0 right-8 pt-1"><WallClock /></div>

            {/* Whiteboard → Kanban */}
            <div
              className="absolute top-4 left-[55%] cursor-pointer transition-transform hover:scale-105 z-10 group"
              onClick={onOpenKanban}
              title="Click to open Kanban Board"
            >
              <Whiteboard />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-pixel text-[5px] text-[#8B6914] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                KANBAN BOARD
              </div>
            </div>

            {/* ══════════════════════════════════════════
                CEO DESK — Top center, your command post
               ══════════════════════════════════════════ */}
            <div
              className="absolute z-10 cursor-pointer group transition-transform hover:scale-105"
              style={{ top: "32px", left: "50%", transform: "translateX(-50%)" }}
              onClick={onOpenTaskModal}
              title="Tu escritorio — Asignar nueva tarea"
            >
              <CeoDesk />
              {/* Gold glow effect */}
              <div className="absolute -inset-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.15) 0%, transparent 70%)" }}
              />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-pixel text-[6px] text-[#ffd700] whitespace-nowrap"
                style={{ textShadow: "0 0 6px #ffd70088" }}
              >
                CEO DESK
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-pixel text-[5px] text-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap animate-pulse">
                + NUEVA TAREA
              </div>
            </div>

            {/* ── AGENT DESKS — Each clickable to inspect ── */}

            {/* CLUSTER 1 (Left - DEV: Atlas + Luna) */}
            <div className="absolute flex gap-4" style={{ left: "6%", bottom: "38%" }}>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("atlas")} title="Escritorio de Atlas">
                <Desk />
                <div className="desk-label" style={{ color: "#ff9800" }}>ATLAS</div>
              </div>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("luna")} title="Escritorio de Luna">
                <Desk />
                <div className="desk-label" style={{ color: "#ab47bc" }}>LUNA</div>
              </div>
              <div className="absolute -top-5 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center tracking-wider">DEV & QA</div>
            </div>

            {/* CLUSTER 2 (Center - HQ: Alice + Archie + Sage) */}
            <div className="absolute flex gap-4" style={{ left: "28%", bottom: "42%" }}>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("sage")} title="Escritorio de Sage">
                <Desk color="#4fc3f7" />
                <div className="desk-label" style={{ color: "#80d8ff" }}>SAGE</div>
              </div>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("alice")} title="Escritorio de Alice">
                <Desk color="#6D4C41" />
                <div className="desk-label" style={{ color: "#4fc3f7" }}>ALICE</div>
              </div>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("archie")} title="Escritorio de Archie">
                <Desk color="#6D4C41" />
                <div className="desk-label" style={{ color: "#818cf8" }}>ARCHIE</div>
              </div>
              <div className="absolute -top-5 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center tracking-wider">RESEARCH & HQ</div>
            </div>

            {/* CLUSTER 3 (Right - CREATIVE: Nova) */}
            <div className="absolute flex gap-4" style={{ left: "72%", bottom: "38%" }}>
              <div className="desk-slot group" onClick={() => onOpenDeskModal?.("nova")} title="Escritorio de Nova">
                <Desk />
                <div className="desk-label" style={{ color: "#ec4899" }}>NOVA</div>
              </div>
              <div className="absolute -top-5 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center tracking-wider">CREATIVE</div>
            </div>

            {/* ── OFFICE UTILITIES ──── */}
            <div className="absolute bottom-3 left-3"><WaterCooler /></div>
            <div className="absolute bottom-3 right-3"><CoffeeMachine /></div>
            <div className="absolute top-2 right-4"><Plant /></div>
            <div className="absolute bottom-3 left-[30%]"><FilingCabinet /></div>
            <div className="absolute bottom-3 right-[25%]"><Printer /></div>
            <div className="absolute bottom-16 right-2"><Plant /></div>

            {/* ── NEW DECORATIONS ──── */}
            <div className="absolute bottom-[20%] left-[45%] opacity-60 pointer-events-none"><OfficeRug /></div>
            <div className="absolute top-1 left-[40%]"><NoticeBoard /></div>
            <div className="absolute bottom-2 left-[18%]"><TrashBin /></div>
            <div className="absolute bottom-2 right-[38%]"><TrashBin /></div>
            <div className="absolute top-9 left-2"><CoatRack /></div>
            <div className="absolute bottom-10 left-[50%]"><Plant /></div>
            <div className="absolute bottom-4 left-[60%]"><DeskPhone /></div>

            {/* ── AGENTS ──── */}
            <Agent id="alice"    state={alice?.state ?? "idle"} />
            <Agent id="archie"   state={archie?.state ?? "idle"} />
            <Agent id="atlas"    state={atlas?.state ?? "idle"} />
            <Agent id="luna"     state={luna?.state ?? "idle"} />
            <Agent id="nova"     state={nova?.state ?? "idle"} />
            <Agent id="sage"     state={sage?.state ?? "idle"} />
          </div>

          {/* PROJECT ROOM (Narrow right side) */}
          <div
            className="w-56 relative overflow-hidden bg-[#e0f1f6]"
            style={{ border: "4px solid #4fc3f7" }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#0288D1]" />
            {/* Room label */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 font-pixel text-[5px] text-[#0288D1] opacity-60 tracking-widest">
              MEETING ROOM
            </div>
            <div className="flex flex-col items-center pt-14 gap-8">
              <div className="scale-90"><ConferenceTable /></div>
              <ReportIcon visible={reportVisible} />
              {/* Whiteboard in meeting room */}
              <div className="scale-75 opacity-70"><Whiteboard /></div>
            </div>
            {/* Corner plants */}
            <div className="absolute bottom-2 left-2 scale-75"><Plant /></div>
            <div className="absolute bottom-2 right-2 scale-75"><Plant /></div>
          </div>
        </div>

        {/* BOTTOM SECTION: Data Center (Full Width) */}
        <div
          className="h-40 relative overflow-visible bg-[#0a0a0a] z-10"
          style={{ border: "4px solid #ef5350" }}
        >
          <div className="absolute top-0 left-0 right-0 h-3 bg-[#B71C1C]" />

          <div className="flex items-center justify-center gap-6 px-4 pt-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cursor-pointer hover:brightness-125 transition-all" onClick={onOpenTerminal}>
                <ServerRack />
              </div>
            ))}

            <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
              <span className="font-pixel text-[4px] text-[#ef5350]">CRITICAL SYSTEMS ACTIVE</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-[#39ff14] animate-pulse" />
                <div className="w-1 h-1 bg-[#ef5350] animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {/* El Datacenter ahora es autónomo */}
          </div>

          {/* Cables and Grills */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#1a1a1a] opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, #333, #333 4px, transparent 4px, transparent 8px)" }} />
        </div>
      </div>

      <style jsx>{`
        .room-tab {
          font-family: 'Pixel', Courier, monospace;
          font-size: 6px;
          padding: 2px 6px;
          letter-spacing: 0.5px;
        }
        .desk-slot {
          opacity: 0.9;
          transition: transform 0.2s;
          cursor: pointer;
          position: relative;
        }
        .desk-slot:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }
        .desk-label {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Press Start 2P', monospace;
          font-size: 4px;
          white-space: nowrap;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .desk-slot:hover .desk-label {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
