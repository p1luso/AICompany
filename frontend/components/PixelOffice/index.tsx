"use client";

import { AgentStatus } from "@/hooks/useAgentTracker";
import { Agent } from "./Agent";
import { Desk, ConferenceTable, ReportIcon, Bookcase, ServerRack, Plant, CoffeeMachine, WaterCooler } from "./Furniture";

interface PixelOfficeProps {
  agents: AgentStatus[];
}

export function PixelOffice({ agents }: PixelOfficeProps) {
  const alice    = agents.find((a) => a.id === "alice");
  const scribe   = agents.find((a) => a.id === "scribe");
  const sentinel = agents.find((a) => a.id === "sentinel");

  const reportVisible = scribe?.state === "active" || (scribe?.lastModified !== null);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#0a0a1a" }}>

      {/* ── ROOM LABELS ─────────────────────────────────── */}
      <div className="absolute top-2 left-2 z-20 flex gap-4">
        {[
          { label: "Main Office",   color: "#ffd700" },
          { label: "Report Room",   color: "#4fc3f7" },
          { label: "Server Room",   color: "#ef5350" },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="font-pixel text-2xs px-2 py-1"
            style={{ color, fontSize: "7px", border: `2px solid ${color}`, background: "#0a0a1acc" }}
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
            className="relative flex-1 floor-tiles overflow-hidden"
            style={{ border: "4px solid #8B6914", borderBottom: "4px solid #5D4037" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-6"
              style={{ background: "#1a237e", borderBottom: "3px solid #283593" }}
            />

            {/* Furniture */}
            <div className="absolute top-6 left-2"><Bookcase /></div>
            <div className="absolute top-6 right-3"><Plant /></div>
            
            {/* NEW AMBIENT LIFE FURNITURE */}
            <div className="absolute bottom-4 right-10"><CoffeeMachine /></div>
            <div className="absolute top-8 left-1/4"><WaterCooler /></div>

            {/* DESKS */}
            <div className="absolute bottom-16 left-6"><Desk color="#a0522d" /></div>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2"><Desk color="#8B6914" /></div>

            {/* AGENTS (Self-positioned via props/config) */}
            <Agent id="alice" state={alice?.state ?? "idle"} />
            <Agent id="scribe" state={scribe?.state ?? "idle"} />

            <div
              className="absolute top-0 bottom-0 right-0 w-1"
              style={{ background: "#5D4037", boxShadow: "inset -2px 0 0 #3E2723" }}
            />
          </div>

          {/* ── REPORT ROOM ─────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{
              width: "220px",
              background: "#e8f4f8",
              border: "4px solid #4fc3f7",
              backgroundImage: "repeating-conic-gradient(#daeef5 0% 25%, #c8e6f2 0% 50%)",
              backgroundSize: "16px 16px",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-5"
              style={{ background: "#0288D1", borderBottom: "3px solid #01579B" }}
            />

            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <div className="relative">
                <ConferenceTable />
                <ReportIcon visible={reportVisible} />
              </div>
            </div>

            <div className="absolute bottom-3 right-3">
              <svg viewBox="0 0 6 12" width={18} height={36} style={{ imageRendering: "pixelated" }}>
                <rect x="1" y="0" width="4" height="3" fill="#FDD835" opacity="0.9" />
                <rect x="2" y="3" width="2" height="8" fill="#757575" />
                <rect x="0" y="10" width="6" height="2" fill="#616161" />
              </svg>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Server Room (full width) */}
        <div
          className="relative overflow-hidden"
          style={{
            height: "130px",
            background: "#0a0a0a",
            border: "4px solid #ef5350",
            backgroundImage: "repeating-linear-gradient(0deg, #111 0px, #111 4px, #0a0a0a 4px, #0a0a0a 8px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-5"
            style={{ background: "#B71C1C", borderBottom: "3px solid #7f0000" }}
          />

          <div className="absolute top-5 left-0 right-0 flex items-end gap-4 px-6 pt-2">
            <ServerRack />
            <ServerRack />
            <ServerRack />

            {/* Sentinel agent */}
            <Agent id="sentinel" state={sentinel?.state ?? "idle"} />

            <div className="ml-auto mr-4 self-center">
              <svg viewBox="0 0 24 8" width={72} height={24} style={{ imageRendering: "pixelated" }}>
                <rect x="0" y="0" width="24" height="8" fill="#1a1a1a" />
                {[0,1,2,3,4,5,6,7].map((i) => (
                  <rect
                    key={i}
                    x={1 + i*3} y={2} width={2} height={2}
                    fill={i % 3 === 0 ? "#39ff14" : i % 3 === 1 ? "#4fc3f7" : "#555"}
                    style={{ animation: `serverBlink ${0.8 + i * 0.15}s step-end infinite` }}
                  />
                ))}
                <rect x="0" y="6" width="24" height="2" fill="#0a0a0a" />
              </svg>
            </div>
          </div>

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
