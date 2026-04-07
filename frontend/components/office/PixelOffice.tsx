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

      {/* ── ROOM LABELS (Top Bar) ───────────────────── */}
      <div className="absolute top-2 left-2 z-20 flex gap-2">
        <label className="room-tab bg-[#ffd700] text-black">BULLPEN</label>
        <label className="room-tab border-2 border-[#4fc3f7] text-[#4fc3f7]">PROJECT ROOM</label>
        <label className="room-tab border-2 border-[#ef5350] text-[#ef5350]">DATA CENTER</label>
      </div>

      <div className="absolute inset-0 flex flex-col pt-10 px-2 pb-2 overflow-hidden">
        
        {/* TOP SECTION: Main Office + Project Room */}
        <div className="flex flex-1 gap-2 min-h-0 mb-2">
          
          {/* BULLPEN AREA (Yellowish floor) */}
          <div 
            className="relative flex-1 overflow-hidden"
            style={{ 
              background: "#d4b483", // Yellowish floor as in image
              border: "4px solid #8B6914",
              backgroundImage: "radial-gradient(#c2a375 1px, transparent 0)",
              backgroundSize: "20px 20px"
            }}
          >
            {/* Wall Top Detail */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#5D4037] border-b-2 border-[#3E2723]" />
            
            {/* Decorations */}
            <div className="absolute top-1 left-4 scale-75 opacity-80"><Bookcase /></div>
            <div className="absolute top-5 left-1/4"><Window /></div>
            <div className="absolute top-5 left-3/4"><Window /></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 pt-1"><WallClock /></div>

            {/* THE THREE CLUSTERS (2x2 desks) */}
            <div className="absolute inset-0 flex justify-around items-center pt-8 px-4">
              
              {/* CLUSTER 1 (Left - DEV) */}
              <div className="relative w-24 h-24 grid grid-cols-2 gap-1 content-center">
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="absolute -top-4 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center">DEV AREA</div>
              </div>

              {/* CLUSTER 2 (Center - MGMT/DESIGN) */}
              <div className="relative w-24 h-24 grid grid-cols-2 gap-1 content-center">
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="absolute -top-4 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center">HQ & CREATIVE</div>
              </div>

              {/* CLUSTER 3 (Right - QA/SYSTEMS) */}
              <div className="relative w-24 h-24 grid grid-cols-2 gap-1 content-center">
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="desk-slot" onClick={onOpenTaskModal}><Desk /></div>
                <div className="absolute -top-4 left-0 w-full text-[5px] font-pixel text-[#8B6914] text-center">QA & SYSTEMS</div>
              </div>

            </div>

            {/* Utilities */}
            <div className="absolute bottom-4 left-4"><WaterCooler /></div>
            <div className="absolute bottom-4 right-4"><CoffeeMachine /></div>
            <div className="absolute top-2 right-4"><Plant /></div>

            {/* AGENTS Rendering */}
            <Agent id="alice"    state={alice?.state ?? "idle"} />
            <Agent id="scribe"   state={scribe?.state ?? "idle"} />
            <Agent id="atlas"    state={atlas?.state ?? "idle"} />
            <Agent id="luna"     state={luna?.state ?? "idle"} />
            <Agent id="nova"     state={nova?.state ?? "idle"} />
          </div>

          {/* PROJECT ROOM (Narrow right side) */}
          <div 
            className="w-48 relative overflow-hidden bg-[#e0f1f6]"
            style={{ border: "4px solid #4fc3f7" }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#0288D1]" />
            <div className="flex flex-col items-center pt-10 gap-8">
              <div className="scale-75"><ConferenceTable /></div>
              <ReportIcon visible={reportVisible} />
              <div className="mt-auto pb-4"><Plant /></div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Data Center (Full Width) */}
        <div 
          className="h-32 relative overflow-hidden bg-[#0a0a0a]"
          style={{ border: "4px solid #ef5350" }}
        >
          <div className="absolute top-0 left-0 right-0 h-3 bg-[#B71C1C]" />
          
          <div className="flex items-center justify-center gap-4 px-4 pt-6">
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            <div className="cursor-pointer" onClick={onOpenTerminal}><ServerRack /></div>
            
            <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
              <span className="font-pixel text-[4px] text-[#ef5350]">CRITICAL SYSTEMS ACTIVE</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-[#39ff14] animate-pulse" />
                <div className="w-1 h-1 bg-[#ef5350] animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>

          <Agent id="sentinel" state={sentinel?.state ?? "idle"} />
          
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
        }
        .desk-slot:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
}
