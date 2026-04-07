"use client";

import { useEffect, useState, useRef } from "react";
import { AgentState } from "@/hooks/useAgentTracker";
import { WAYPOINTS, Waypoint } from "./config";
import { useHandoffStore } from "@/store/handoffStore";

/* ─────────────────────────────────────────────────────────────
   SVG PIXEL ART SPRITES (12×16 grid, each unit = 4px rendered)
   ───────────────────────────────────────────────────────────── */

function AliceSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="8" height="1" fill="#5D4037" />
      <rect x="1" y="1" width="10" height="2" fill="#5D4037" />
      <rect x="0" y="3" width="2" height="3" fill="#5D4037" />
      <rect x="10" y="3" width="2" height="3" fill="#5D4037" />
      <rect x="2" y="3" width="8" height="5" fill="#FFDCC4" />
      <rect x="2" y="4" width="3" height="2" fill="none" stroke="#1565C0" strokeWidth="0.4" />
      <rect x="7" y="4" width="3" height="2" fill="none" stroke="#1565C0" strokeWidth="0.4" />
      <rect x="3" y="5" width="1" height="1" fill="#1565C0" />
      <rect x="8" y="5" width="1" height="1" fill="#1565C0" />
      <rect x="4" y="7" width="4" height="1" fill="#E57373" />
      <rect x="2" y="8" width="8" height="5" fill="#1565C0" />
      <rect x="0" y="9" width="2" height="4" fill="#1565C0" />
      <rect x="10" y="9" width="2" height="4" fill="#1565C0" />
      <rect x="0" y="13" width="2" height="1" fill="#FFDCC4" />
      <rect x="10" y="13" width="2" height="1" fill="#FFDCC4" />
      <rect x="3" y="13" width="2" height="3" fill="#37474F" />
      <rect x="7" y="13" width="2" height="3" fill="#37474F" />
      {walking && <rect x="3" y="15" width="2" height="1" fill="#37474F" transform="translate(0,-1)" />}
      <rect x="2" y="15" width="3" height="1" fill="#212121" />
      <rect x="7" y="15" width="3" height="1" fill="#212121" />
    </svg>
  );
}

function ArchieSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="8" height="1" fill="#78909C" />
      <rect x="1" y="1" width="10" height="3" fill="#78909C" />
      <rect x="2" y="4" width="8" height="5" fill="#FFDCC4" />
      <rect x="2" y="5" width="3" height="1" fill="#333" opacity="0.6" />
      <rect x="7" y="5" width="3" height="1" fill="#333" opacity="0.6" />
      <rect x="2" y="9" width="8" height="5" fill="#3F51B5" />
      <rect x="1" y="10" width="10" height="1" fill="#5C6BC0" />
      <rect x="0" y="11" width="2" height="3" fill="#3F51B5" />
      <rect x="10" y="11" width="2" height="3" fill="#3F51B5" />
      <rect x="0" y="14" width="3" height="1" fill="#E1F5FE" />
      <rect x="3" y="14" width="2" height="2" fill="#263238" />
      <rect x="7" y="14" width="2" height="2" fill="#263238" />
      <rect x="2" y="15" width="3" height="1" fill="#000" />
      <rect x="7" y="15" width="3" height="1" fill="#000" />
    </svg>
  );
}


function AtlasSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="0" width="10" height="4" fill="#FFD54F" />
      <rect x="0" y="1" width="2" height="2" fill="#FFD54F" />
      <rect x="10" y="1" width="2" height="2" fill="#FFD54F" />
      <rect x="2" y="4" width="8" height="5" fill="#FFDCC4" />
      <rect x="1" y="4" width="1" height="3" fill="#333" />
      <rect x="1" y="4" width="10" height="1" fill="#333" />
      <rect x="10" y="4" width="1" height="3" fill="#333" />
      <rect x="3" y="6" width="1" height="1" fill="#333" />
      <rect x="8" y="6" width="1" height="1" fill="#333" />
      <rect x="2" y="9" width="8" height="5" fill="#EF6C00" />
      <rect x="0" y="10" width="12" height="4" fill="#EF6C00" />
      <rect x="4" y="9" width="4" height="2" fill="#FB8C00" />
      <rect x="0" y="14" width="2" height="1" fill="#FFDCC4" />
      <rect x="10" y="14" width="2" height="1" fill="#FFDCC4" />
      <rect x="3" y="14" width="2" height="2" fill="#1565C0" />
      <rect x="7" y="14" width="2" height="2" fill="#1565C0" />
      {walking && <rect x="3" y="14" width="2" height="1" fill="#1565C0" transform="translate(0,2)" />}
      <rect x="2" y="15" width="3" height="1" fill="#212121" />
      <rect x="7" y="15" width="3" height="1" fill="#212121" />
    </svg>
  );
}

function LunaSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="0" width="10" height="12" fill="#212121" />
      <rect x="9" y="4" width="1" height="6" fill="#BA68C8" />
      <rect x="2" y="3" width="8" height="5" fill="#F5CBA7" />
      <rect x="3" y="5" width="1" height="1" fill="#1B2631" />
      <rect x="8" y="5" width="1" height="1" fill="#1B2631" />
      <rect x="2" y="8" width="8" height="6" fill="#6A1B9A" />
      <rect x="0" y="9" width="2" height="5" fill="#6A1B9A" />
      <rect x="10" y="9" width="2" height="5" fill="#6A1B9A" />
      <circle cx="1" cy="14" r="1.5" fill="#BDBDBD" />
      <rect x="3" y="14" width="2" height="2" fill="#212121" />
      <rect x="7" y="14" width="2" height="2" fill="#212121" />
      {walking && <rect x="7" y="14" width="2" height="1" fill="#212121" transform="translate(0,1)" />}
      <rect x="2" y="15" width="3" height="1" fill="#333" />
      <rect x="7" y="15" width="3" height="1" fill="#333" />
    </svg>
  );
}

function NovaSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="0" width="5" height="4" fill="#00BCD4" />
      <rect x="6" y="0" width="5" height="4" fill="#E91E63" />
      <rect x="0" y="1" width="1" height="6" fill="#00BCD4" />
      <rect x="2" y="3" width="8" height="5" fill="#FFE0B2" />
      <rect x="3" y="5" width="2" height="1" fill="#333" />
      <rect x="7" y="5" width="2" height="1" fill="#333" />
      <rect x="2" y="8" width="8" height="6" fill="#008080" />
      <rect x="1" y="9" width="10" height="1" fill="#FFEB3B" opacity="0.4" />
      <rect x="10" y="12" width="1" height="3" fill="#FFF" />
      <rect x="3" y="14" width="2" height="2" fill="#FFF" />
      <rect x="7" y="14" width="2" height="2" fill="#FFF" />
      {walking && <rect x="3" y="14" width="2" height="1" fill="#FFF" transform="translate(0,2)" />}
    </svg>
  );
}

/* ─── AGENT CONFIG ───────────────────────────────────────────── */

const WORKING_BEHAVIORS: Record<string, { icons: string[] }> = {
  alice:  { icons: ["📋", "📊", "💡", "🔍"] },
  archie: { icons: ["📐", "🏗️", "📏", "💡"] },
  atlas:  { icons: ["💻", "⚙️", "🔥", "🚀"] },
  luna:   { icons: ["🧪", "🔎", "✅", "🐞"] },
  nova:   { icons: ["🎨", "✨", "📐", "💅"] },
};

const IDLE_WANDER_ICONS: Record<string, string> = {
  coffee: "☕",
  water: "💧",
  books: "📚",
  report: "📋",
  server1: "🔧",
  server2: "💾",
  server3: "🔋",
  switch: "🔌",
  whiteboard: "🖊️",
  window: "🌤️",
  plant: "🌱",
};

export const AGENT_CONFIG = {
  alice: {
    name:   "Alice",
    label:  "Scrum Master",
    color:  "#4fc3f7",
    emoji:  "🔍",
    sprite: AliceSprite,
  },
  archie: {
    name:   "Archie",
    label:  "Architect",
    color:  "#818cf8",
    emoji:  "📐",
    sprite: ArchieSprite,
  },
  atlas: {
    name:   "Atlas",
    label:  "Lead Dev",
    color:  "#ff9800",
    emoji:  "💻",
    sprite: AtlasSprite,
  },
  luna: {
    name:   "Luna",
    label:  "QA Specialist",
    color:  "#ab47bc",
    emoji:  "🧪",
    sprite: LunaSprite,
  },
  nova: {
    name:   "Nova",
    label:  "Lead Designer",
    color:  "#00bcd4",
    emoji:  "🎨",
    sprite: NovaSprite,
  },
} as const;

/* ─── AGENT COMPONENT ────────────────────────────────────────── */
interface AgentProps {
  id: "alice" | "archie" | "atlas" | "luna" | "nova";
  state: AgentState;
}

export function Agent({ id, state }: AgentProps) {
  const config = AGENT_CONFIG[id];
  const agentWaypoints = WAYPOINTS[id];
  const deskWaypoint = agentWaypoints.desk;

  const [currentPos, setCurrentPos] = useState<Waypoint>(deskWaypoint);
  const [isWalking, setIsWalking] = useState(false);
  const [ambientIcon, setAmbientIcon] = useState<string | null>(null);
  const [atDesk, setAtDesk] = useState(true);

  const SpriteComponent = config.sprite;

  const isActive = state?.toLowerCase() === "active";

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const workIconRef = useRef<NodeJS.Timeout | null>(null);
  const handoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── ACTIVE: Agent sits at desk, works, shows work bubbles ──
  useEffect(() => {
    if (isActive) {
      // Cancel any wandering
      if (timerRef.current) clearTimeout(timerRef.current);

      // Return to desk if not there
      if (!atDesk) {
        setIsWalking(true);
        setAmbientIcon(null);
        setCurrentPos(deskWaypoint);
        const t = setTimeout(() => {
          setIsWalking(false);
          setAtDesk(true);
        }, 1200);
        return () => clearTimeout(t);
      }

      // Show periodic work icons while at desk
      const workIcons = WORKING_BEHAVIORS[id]?.icons || ["💻"];
      let idx = 0;
      const showWorkIcon = () => {
        setAmbientIcon(workIcons[idx % workIcons.length]);
        idx++;
        workIconRef.current = setTimeout(() => {
          setAmbientIcon(null);
          workIconRef.current = setTimeout(showWorkIcon, 2000 + Math.random() * 2000);
        }, 2500);
      };
      workIconRef.current = setTimeout(showWorkIcon, 500);

      return () => {
        if (workIconRef.current) clearTimeout(workIconRef.current);
      };
    } else {
      // Stopped being active — clear work icons
      if (workIconRef.current) clearTimeout(workIconRef.current);
      setAmbientIcon(null);
    }
  }, [isActive, atDesk, id, deskWaypoint]);

  // ── IDLE: Agent wanders around the office ──
  useEffect(() => {
    if (isActive) return; // Don't wander when working

    const startWandering = () => {
      const waitTime = Math.floor(Math.random() * (30000 - 10000) + 10000); // 10-30s

      timerRef.current = setTimeout(() => {
        const keys = Object.keys(agentWaypoints).filter(
          k => k !== 'desk' && !k.endsWith('_desk') && k !== 'ceo'
        );
        if (keys.length === 0) {
          startWandering();
          return;
        }
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const target = agentWaypoints[randomKey];

        setAtDesk(false);
        setIsWalking(true);
        setCurrentPos(target);

        setTimeout(() => {
          setIsWalking(false);
          setAmbientIcon(IDLE_WANDER_ICONS[randomKey] || "💭");

          const lingerTime = 4000 + Math.random() * 5000;
          setTimeout(() => {
            setAmbientIcon(null);
            setIsWalking(true);
            setCurrentPos(deskWaypoint);
            setTimeout(() => {
              setIsWalking(false);
              setAtDesk(true);
              startWandering();
            }, 1500);
          }, lingerTime);
        }, 1500);
      }, waitTime);
    };

    startWandering();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, id, agentWaypoints, deskWaypoint]);

  // ── HANDOFF: CEO Pickup (Alice) ──
  const pickupFromCeo = useHandoffStore((s) => s.pickupFromCeo);
  useEffect(() => {
    if (id === "alice" && pickupFromCeo) {
      const ceoWp = agentWaypoints.ceo;
      if (!ceoWp) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      setAtDesk(false);
      setIsWalking(true);
      setAmbientIcon("📋");
      setCurrentPos(ceoWp);

      const t1 = setTimeout(() => {
        setIsWalking(false);
        setAmbientIcon("📄");
        const t2 = setTimeout(() => {
          setIsWalking(true);
          setCurrentPos(deskWaypoint);
          setAmbientIcon(null);
          const t3 = setTimeout(() => {
            setIsWalking(false);
            setAtDesk(true);
            useHandoffStore.getState().completeCeoPickup();
          }, 1500);
          handoffTimeoutRef.current = t3;
        }, 1200);
        handoffTimeoutRef.current = t2;
      }, 1500);
      handoffTimeoutRef.current = t1;

      return () => { if (handoffTimeoutRef.current) clearTimeout(handoffTimeoutRef.current); };
    }
  }, [pickupFromCeo, id, agentWaypoints, deskWaypoint]);

  // ── HANDOFF: Inter-agent delivery ──
  const handoff = useHandoffStore((s) => s.activeHandoff);
  useEffect(() => {
    if (!handoff || handoff.phase !== "walking_to_target") return;
    if (handoff.fromAgent !== id) return;

    const targetDeskKey = `${handoff.toAgent}_desk`;
    const targetWp = agentWaypoints[targetDeskKey];
    if (!targetWp) {
      useHandoffStore.getState().completeHandoff();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setAtDesk(false);
    setIsWalking(true);
    setAmbientIcon("📄");
    setCurrentPos(targetWp);

    const t1 = setTimeout(() => {
      setIsWalking(false);
      useHandoffStore.getState().setDelivering();
      setAmbientIcon("🤝");
      const t2 = setTimeout(() => {
        setAmbientIcon(null);
        setIsWalking(true);
        setCurrentPos(deskWaypoint);
        const t3 = setTimeout(() => {
          setIsWalking(false);
          setAtDesk(true);
          useHandoffStore.getState().completeHandoff();
        }, 1500);
        handoffTimeoutRef.current = t3;
      }, 1200);
      handoffTimeoutRef.current = t2;
    }, 1800);
    handoffTimeoutRef.current = t1;

    return () => { if (handoffTimeoutRef.current) clearTimeout(handoffTimeoutRef.current); };
  }, [handoff, id, agentWaypoints, deskWaypoint]);

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none transition-all"
      style={{
        bottom: `${currentPos.y}%`,
        left: `${currentPos.x}%`,
        transitionDuration: isWalking ? "1.8s" : "0.3s",
        transitionTimingFunction: "ease-in-out",
        zIndex: 50
      }}
    >
      {/* Speech/thought bubble */}
      {ambientIcon && (
        <div className="speech-bubble animate-float-bubble mb-8 z-10">
          {isActive && atDesk ? (
            <span className="flex items-center gap-1">
              {ambientIcon} <span className="typing-dots" />
            </span>
          ) : (
            <span className="thought-pop">{ambientIcon}</span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Status glow under feet */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-[4px] transition-all duration-500"
          style={{
            width: "48px",
            height: "18px",
            background: isActive ? "rgba(57, 255, 20, 0.4)" : "rgba(0,0,0,0.15)",
            boxShadow: isActive ? "0 0 12px #39ff1488" : "none",
          }}
        />

        {/* Screen glow reflected on agent when working at desk */}
        {isActive && atDesk && (
          <div
            className="absolute inset-0 rounded-full blur-[8px] animate-screen-glow pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(79, 195, 247, 0.4) 0%, transparent 70%)",
              zIndex: 1
            }}
          />
        )}

        <div className={(isActive && atDesk) ? "idle-working" : (isWalking ? "walking" : "idle-breathe")}>
          <SpriteComponent walking={isWalking} />
        </div>
      </div>

      {/* Name label */}
      <div
        className="mt-1 px-1 text-2xs text-center font-pixel"
        style={{
          color: config.color,
          textShadow: `0 0 6px ${config.color}`,
          fontSize: "6px",
          lineHeight: "10px",
          whiteSpace: "nowrap",
        }}
      >
        {config.name}
      </div>

      {/* Status dot + label */}
      <div className="flex items-center gap-0.5 mt-0.5">
        <div
          style={{
            width: "5px",
            height: "5px",
            background: isActive ? "#39ff14" : "#555",
            boxShadow: isActive ? "0 0 6px #39ff14" : "none",
            borderRadius: "50%",
          }}
        />
        {isActive && (
          <span className="font-pixel" style={{ fontSize: "5px", color: "#39ff14" }}>
            WORKING
          </span>
        )}
      </div>

      <style jsx>{`
        @keyframes screenGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes workingSquash {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.05, 0.95); }
        }
        .animate-screen-glow {
          animation: screenGlow 2s ease-in-out infinite;
        }
        .idle-working {
          animation: workingSquash 0.5s ease-in-out infinite;
        }
        .idle-breathe {
          animation: pixelBreathe 3s ease-in-out infinite;
        }
        @keyframes pixelBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
      `}</style>
    </div>
  );
}
