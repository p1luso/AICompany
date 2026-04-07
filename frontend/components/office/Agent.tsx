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

function ScribeSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="6" height="1" fill="#3E2723" />
      <rect x="2" y="1" width="8" height="3" fill="#3E2723" />
      <rect x="2" y="4" width="8" height="5" fill="#C68642" />
      <rect x="3" y="5" width="2" height="1" fill="#4E342E" />
      <rect x="7" y="5" width="2" height="1" fill="#4E342E" />
      <rect x="4" y="7" width="1" height="1" fill="#A0522D" />
      <rect x="5" y="8" width="2" height="1" fill="#A0522D" />
      <rect x="2" y="9" width="8" height="5" fill="#2E7D32" />
      <rect x="0" y="10" width="2" height="4" fill="#2E7D32" />
      <rect x="10" y="10" width="2" height="4" fill="#2E7D32" />
      <rect x="10" y="11" width="1" height="3" fill="#FFF9C4" />
      <rect x="10" y="14" width="1" height="1" fill="#F57F17" />
      <rect x="0" y="13" width="2" height="1" fill="#C68642" />
      <rect x="10" y="13" width="1" height="1" fill="#C68642" />
      <rect x="3" y="14" width="2" height="2" fill="#5D4037" />
      <rect x="7" y="14" width="2" height="2" fill="#5D4037" />
      {walking && <rect x="3" y="14" width="2" height="1" fill="#5D4037" transform="translate(0,1)" />}
      <rect x="2" y="15" width="3" height="1" fill="#212121" />
      <rect x="7" y="15" width="3" height="1" fill="#212121" />
    </svg>
  );
}

function SentinelSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="2" height="1" fill="#212121" />
      <rect x="5" y="0" width="2" height="1" fill="#212121" />
      <rect x="8" y="0" width="2" height="1" fill="#212121" />
      <rect x="1" y="1" width="10" height="3" fill="#212121" />
      <rect x="2" y="4" width="8" height="5" fill="#8D5524" />
      <rect x="3" y="5" width="2" height="1" fill="#212121" />
      <rect x="7" y="5" width="2" height="1" fill="#212121" />
      <rect x="4" y="7" width="4" height="1" fill="#6D4C41" />
      <rect x="2" y="9" width="8" height="5" fill="#B71C1C" />
      <rect x="0" y="9" width="2" height="5" fill="#B71C1C" />
      <rect x="10" y="9" width="2" height="5" fill="#B71C1C" />
      <rect x="5" y="9" width="2" height="5" fill="#D32F2F" />
      <rect x="0" y="13" width="2" height="1" fill="#8D5524" />
      <rect x="10" y="13" width="2" height="1" fill="#8D5524" />
      <rect x="3" y="14" width="2" height="2" fill="#1A237E" />
      <rect x="7" y="14" width="2" height="2" fill="#1A237E" />
      {walking && <rect x="7" y="14" width="2" height="1" fill="#1A237E" transform="translate(0,1)" />}
      <rect x="2" y="15" width="3" height="1" fill="#000" />
      <rect x="7" y="15" width="3" height="1" fill="#000" />
    </svg>
  );
}

function AtlasSprite({ walking }: { walking: boolean }) {
  return (
    <svg viewBox="0 0 12 16" width={walking ? 60 : 54} height={walking ? 84 : 78} style={{ imageRendering: "pixelated" }}>
      {/* Messy blonde hair */}
      <rect x="1" y="0" width="10" height="4" fill="#FFD54F" />
      <rect x="0" y="1" width="2" height="2" fill="#FFD54F" />
      <rect x="10" y="1" width="2" height="2" fill="#FFD54F" />
      {/* Face */}
      <rect x="2" y="4" width="8" height="5" fill="#FFDCC4" />
      {/* Headset */}
      <rect x="1" y="4" width="1" height="3" fill="#333" />
      <rect x="1" y="4" width="10" height="1" fill="#333" />
      <rect x="10" y="4" width="1" height="3" fill="#333" />
      {/* Eyes */}
      <rect x="3" y="6" width="1" height="1" fill="#333" />
      <rect x="8" y="6" width="1" height="1" fill="#333" />
      {/* Body - Orange Hoodie */}
      <rect x="2" y="9" width="8" height="5" fill="#EF6C00" />
      <rect x="0" y="10" width="12" height="4" fill="#EF6C00" />
      <rect x="4" y="9" width="4" height="2" fill="#FB8C00" />
      {/* Hands */}
      <rect x="0" y="14" width="2" height="1" fill="#FFDCC4" />
      <rect x="10" y="14" width="2" height="1" fill="#FFDCC4" />
      {/* Legs - Jeans */}
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
      {/* Long dark hair with purple highlight */}
      <rect x="1" y="0" width="10" height="12" fill="#212121" />
      <rect x="9" y="4" width="1" height="6" fill="#BA68C8" />
      {/* Face */}
      <rect x="2" y="3" width="8" height="5" fill="#F5CBA7" />
      <rect x="3" y="5" width="1" height="1" fill="#1B2631" />
      <rect x="8" y="5" width="1" height="1" fill="#1B2631" />
      {/* Body - Purple Jacket */}
      <rect x="2" y="8" width="8" height="6" fill="#6A1B9A" />
      <rect x="0" y="9" width="2" height="5" fill="#6A1B9A" />
      <rect x="10" y="9" width="2" height="5" fill="#6A1B9A" />
      {/* Magnifying glass in hand */}
      <circle cx="1" cy="14" r="1.5" fill="#BDBDBD" />
      {/* Legs */}
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
      {/* Cyan/Pink artistic hair */}
      <rect x="1" y="0" width="5" height="4" fill="#00BCD4" />
      <rect x="6" y="0" width="5" height="4" fill="#E91E63" />
      <rect x="0" y="1" width="1" height="6" fill="#00BCD4" />
      {/* Face */}
      <rect x="2" y="3" width="8" height="5" fill="#FFE0B2" />
      <rect x="3" y="5" width="2" height="1" fill="#333" />
      <rect x="7" y="5" width="2" height="1" fill="#333" />
      {/* Body - Stylish Teal Outfit */}
      <rect x="2" y="8" width="8" height="6" fill="#008080" />
      <rect x="1" y="9" width="10" height="1" fill="#FFEB3B" opacity="0.4" />
      {/* Stylus in hand */}
      <rect x="10" y="12" width="1" height="3" fill="#FFF" />
      {/* Legs */}
      <rect x="3" y="14" width="2" height="2" fill="#FFF" />
      <rect x="7" y="14" width="2" height="2" fill="#FFF" />
      {walking && <rect x="3" y="14" width="2" height="1" fill="#FFF" transform="translate(0,2)" />}
    </svg>
  );
}

/* ─── AGENT CONFIG ───────────────────────────────────────────── */

const IDLE_BEHAVIORS: Record<string, { animations: string[]; icons: string[] }> = {
  alice: {
    animations: ["idle", "idle-look", "idle-typing", "idle"],
    icons: ["🔍", "💡", "📊", "🤔"],
  },
  scribe: {
    animations: ["idle", "idle-typing", "idle-nod", "idle-stretch"],
    icons: ["✍️", "📝", "💬", "✨"],
  },
  sentinel: {
    animations: ["idle", "idle-look", "idle-security-scan", "idle"],
    icons: ["🛡️", "🔎", "⚠️", "📡"],
  },
  atlas: {
    animations: ["idle", "idle-typing", "idle-debugging", "idle-stretch"],
    icons: ["⚙️", "💻", "🔥", "🚀"],
  },
  luna: {
    animations: ["idle", "idle-look", "idle-nod", "idle-check"],
    icons: ["🧪", "🔎", "✅", "🐞"],
  },
  nova: {
    animations: ["idle", "idle-sketching", "idle-look", "idle-stretch"],
    icons: ["🎨", "✨", "📐", "💅"],
  },
};

const WAYPOINT_ICONS: Record<string, string> = {
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
    label:  "CEO",
    color:  "#4fc3f7",
    emoji:  "🔍",
    sprite: AliceSprite,
  },
  scribe: {
    name:   "Scribe",
    label:  "Marketing",
    color:  "#81c784",
    emoji:  "✍️",
    sprite: ScribeSprite,
  },
  sentinel: {
    name:   "Sentinel",
    label:  "Infra",
    color:  "#ef5350",
    emoji:  "🛡️",
    sprite: SentinelSprite,
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
  id: keyof typeof AGENT_CONFIG;
  state: AgentState;
}

export function Agent({ id, state }: AgentProps) {
  const config = AGENT_CONFIG[id];
  const agentWaypoints = WAYPOINTS[id];
  const deskWaypoint = agentWaypoints.desk;
  const behaviors = IDLE_BEHAVIORS[id];

  const [currentPos, setCurrentPos] = useState<Waypoint>(deskWaypoint);
  const [isAmbientWalking, setIsAmbientWalking] = useState(false);
  const [ambientIcon, setAmbientIcon] = useState<string | null>(null);
  const [idleAnim, setIdleAnim] = useState("idle");
  const [atDesk, setAtDesk] = useState(true);

  const SpriteComponent = config.sprite;

  const isActive = state?.toLowerCase() === "active";
  const isWalking = isAmbientWalking;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idleCycleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive && atDesk && !isAmbientWalking) {
      let idx = 0;
      const cycle = () => {
        idx = (idx + 1) % behaviors.animations.length;
        setIdleAnim(behaviors.animations[idx]);
        if (Math.random() > 0.6) {
          setAmbientIcon(behaviors.icons[idx]);
          setTimeout(() => setAmbientIcon(null), 2500);
        }
        idleCycleRef.current = setTimeout(cycle, 4000 + Math.random() * 3000);
      };
      idleCycleRef.current = setTimeout(cycle, 3000 + Math.random() * 4000);
      return () => { if (idleCycleRef.current) clearTimeout(idleCycleRef.current); };
    } else {
      setIdleAnim("idle");
      if (idleCycleRef.current) clearTimeout(idleCycleRef.current);
    }
  }, [isActive, atDesk, isAmbientWalking, behaviors]);

  useEffect(() => {
    if (isActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setAmbientIcon(null);
      setIsAmbientWalking(true);
      setAtDesk(false);
      setCurrentPos(deskWaypoint);

      const t = setTimeout(() => {
        setIsAmbientWalking(false);
        setAtDesk(true);
      }, 1200);
      return () => clearTimeout(t);
    } else {
      const startWandering = () => {
        const waitTime = Math.floor(Math.random() * (45000 - 15000) + 15000); // 15-45s

        timerRef.current = setTimeout(() => {
          const keys = Object.keys(agentWaypoints).filter(k => k !== 'desk' && !k.endsWith('_desk') && k !== 'ceo');
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          const target = agentWaypoints[randomKey];

          setAtDesk(false);
          setIsAmbientWalking(true);
          setCurrentPos(target);

          setTimeout(() => {
            setIsAmbientWalking(false);
            setAmbientIcon(WAYPOINT_ICONS[randomKey] || "💭");

            const lingerTime = 5000 + Math.random() * 6000;
            setTimeout(() => {
              setAmbientIcon(null);
              setIsAmbientWalking(true);
              setCurrentPos(deskWaypoint);
              setTimeout(() => {
                setIsAmbientWalking(false);
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
    }
  }, [isActive, id, agentWaypoints, deskWaypoint]);

  // ── HANDOFF ANIMATION: Walk to deliver work to another agent ──
  const handoff = useHandoffStore((s) => s.activeHandoff);
  const pickupFromCeo = useHandoffStore((s) => s.pickupFromCeo);
  const handoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // CEO Pickup: Alice walks to CEO desk, pauses, then walks to her desk
    if (id === "alice" && pickupFromCeo) {
      const ceoWp = agentWaypoints.ceo;
      if (!ceoWp) return;

      // Cancel wandering
      if (timerRef.current) clearTimeout(timerRef.current);

      setAtDesk(false);
      setIsAmbientWalking(true);
      setAmbientIcon("📋");
      setCurrentPos(ceoWp);

      const t1 = setTimeout(() => {
        setIsAmbientWalking(false);
        setAmbientIcon("📄");

        const t2 = setTimeout(() => {
          setIsAmbientWalking(true);
          setCurrentPos(deskWaypoint);
          setAmbientIcon(null);

          const t3 = setTimeout(() => {
            setIsAmbientWalking(false);
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

  useEffect(() => {
    // Inter-agent handoff: fromAgent walks to toAgent's desk
    if (!handoff || handoff.phase !== "walking_to_target") return;
    if (handoff.fromAgent !== id) return;

    const targetDeskKey = `${handoff.toAgent}_desk`;
    const targetWp = agentWaypoints[targetDeskKey];
    if (!targetWp) {
      // No waypoint to target desk, skip
      useHandoffStore.getState().completeHandoff();
      return;
    }

    // Cancel wandering
    if (timerRef.current) clearTimeout(timerRef.current);

    setAtDesk(false);
    setIsAmbientWalking(true);
    setAmbientIcon("📄");
    setCurrentPos(targetWp);

    const t1 = setTimeout(() => {
      setIsAmbientWalking(false);
      useHandoffStore.getState().setDelivering();
      setAmbientIcon("🤝");

      const t2 = setTimeout(() => {
        setAmbientIcon(null);
        setIsAmbientWalking(true);
        setCurrentPos(deskWaypoint);

        const t3 = setTimeout(() => {
          setIsAmbientWalking(false);
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
        transitionDuration: isActive ? "1.2s" : "1.8s",
        transitionTimingFunction: isActive ? "ease-out" : "ease-in-out",
        zIndex: 50
      }}
    >
      {(isActive || ambientIcon) && (
        <div className="speech-bubble animate-float-bubble mb-8 z-10">
          {isActive ? (
            <span className="flex items-center gap-1">
              {config.emoji} <span className="typing-dots" />
            </span>
          ) : (
            <span className="thought-pop">{ambientIcon}</span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Status circle under feet */}
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-[4px] transition-all duration-500"
          style={{
            width: "48px",
            height: "18px",
            background: isActive ? "rgba(57, 255, 20, 0.4)" : "rgba(0,0,0,0.15)",
            boxShadow: isActive ? "0 0 12px #39ff1488" : "none",
          }}
        />

        {/* Screen glow reflected on agent when working */}
        {isActive && atDesk && (
          <div 
            className="absolute inset-0 rounded-full blur-[8px] animate-screen-glow pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(79, 195, 247, 0.4) 0%, transparent 70%)",
              zIndex: 1
            }}
          />
        )}

        <div className={(isActive && atDesk) ? "idle-working" : (isWalking ? "walking" : idleAnim)}>
          <SpriteComponent walking={isWalking} />
        </div>
      </div>

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
        {id === "alice" ? "Alice (Scrum)" : config.name}
      </div>

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
            {id === "alice" ? "PLANNING" : "BUSY"}
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
      `}</style>
    </div>
  );
}
