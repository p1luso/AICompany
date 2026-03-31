"use client";

import { AgentState } from "@/hooks/useAgentTracker";

/* ─────────────────────────────────────────────────────────────
   SVG PIXEL ART SPRITES (12×16 grid, each unit = 4px rendered)
   Alice    → Blue hoodie  / Brown hair / Glasses
   Scribe   → Green sweater / Dark bun
   Sentinel → Red jacket   / Spiky black hair
──────────────────────────────────────────────────────────────── */

function AliceSprite({ walking }: { walking: boolean }) {
  return (
    <svg
      viewBox="0 0 12 16"
      width={walking ? 40 : 36}
      height={walking ? 56 : 52}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Hair */}
      <rect x="2" y="0" width="8" height="1" fill="#5D4037" />
      <rect x="1" y="1" width="10" height="2" fill="#5D4037" />
      <rect x="0" y="3" width="2" height="3" fill="#5D4037" />
      <rect x="10" y="3" width="2" height="3" fill="#5D4037" />
      {/* Face */}
      <rect x="2" y="3" width="8" height="5" fill="#FFDCC4" />
      {/* Glasses */}
      <rect x="2" y="4" width="3" height="2" fill="none" stroke="#1565C0" strokeWidth="0.4" />
      <rect x="7" y="4" width="3" height="2" fill="none" stroke="#1565C0" strokeWidth="0.4" />
      <rect x="5" y="5" width="2" height="1" fill="#1565C0" opacity="0.6" />
      {/* Eyes */}
      <rect x="3" y="5" width="1" height="1" fill="#1565C0" />
      <rect x="8" y="5" width="1" height="1" fill="#1565C0" />
      {/* Mouth */}
      <rect x="4" y="7" width="4" height="1" fill="#E57373" />
      {/* Body – blue hoodie */}
      <rect x="2" y="8" width="8" height="5" fill="#1565C0" />
      <rect x="0" y="9" width="2" height="4" fill="#1565C0" />
      <rect x="10" y="9" width="2" height="4" fill="#1565C0" />
      {/* Hands */}
      <rect x="0" y="13" width="2" height="1" fill="#FFDCC4" />
      <rect x="10" y="13" width="2" height="1" fill="#FFDCC4" />
      {/* Legs */}
      <rect x="3" y="13" width="2" height="3" fill="#37474F" />
      <rect x="7" y="13" width="2" height="3" fill="#37474F" />
      {/* Walk cycle offset on legs */}
      {walking && <rect x="3" y="15" width="2" height="1" fill="#37474F" transform="translate(0,-1)" />}
      {/* Shoes */}
      <rect x="2" y="15" width="3" height="1" fill="#212121" />
      <rect x="7" y="15" width="3" height="1" fill="#212121" />
    </svg>
  );
}

function ScribeSprite({ walking }: { walking: boolean }) {
  return (
    <svg
      viewBox="0 0 12 16"
      width={walking ? 40 : 36}
      height={walking ? 56 : 52}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Hair bun */}
      <rect x="3" y="0" width="6" height="1" fill="#3E2723" />
      <rect x="2" y="1" width="8" height="3" fill="#3E2723" />
      <rect x="4" y="0" width="4" height="1" fill="#4E342E" />
      {/* Face */}
      <rect x="2" y="4" width="8" height="5" fill="#C68642" />
      {/* Eyes */}
      <rect x="3" y="5" width="2" height="1" fill="#4E342E" />
      <rect x="7" y="5" width="2" height="1" fill="#4E342E" />
      {/* Smile */}
      <rect x="4" y="7" width="1" height="1" fill="#A0522D" />
      <rect x="5" y="8" width="2" height="1" fill="#A0522D" />
      <rect x="7" y="7" width="1" height="1" fill="#A0522D" />
      {/* Body – green sweater */}
      <rect x="2" y="9" width="8" height="5" fill="#2E7D32" />
      <rect x="0" y="10" width="2" height="4" fill="#2E7D32" />
      <rect x="10" y="10" width="2" height="4" fill="#2E7D32" />
      {/* Pen in hand */}
      <rect x="10" y="11" width="1" height="3" fill="#FFF9C4" />
      <rect x="10" y="14" width="1" height="1" fill="#F57F17" />
      {/* Hands */}
      <rect x="0" y="13" width="2" height="1" fill="#C68642" />
      <rect x="10" y="13" width="1" height="1" fill="#C68642" />
      {/* Legs */}
      <rect x="3" y="14" width="2" height="2" fill="#5D4037" />
      <rect x="7" y="14" width="2" height="2" fill="#5D4037" />
      {walking && <rect x="3" y="14" width="2" height="1" fill="#5D4037" transform="translate(0,1)" />}
      {/* Shoes */}
      <rect x="2" y="15" width="3" height="1" fill="#212121" />
      <rect x="7" y="15" width="3" height="1" fill="#212121" />
    </svg>
  );
}

function SentinelSprite({ walking }: { walking: boolean }) {
  return (
    <svg
      viewBox="0 0 12 16"
      width={walking ? 40 : 36}
      height={walking ? 56 : 52}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Spiky hair */}
      <rect x="2" y="0" width="2" height="1" fill="#212121" />
      <rect x="5" y="0" width="2" height="1" fill="#212121" />
      <rect x="8" y="0" width="2" height="1" fill="#212121" />
      <rect x="1" y="1" width="10" height="3" fill="#212121" />
      <rect x="3" y="1" width="1" height="1" fill="#424242" />
      <rect x="7" y="1" width="1" height="1" fill="#424242" />
      {/* Face */}
      <rect x="2" y="4" width="8" height="5" fill="#8D5524" />
      {/* Eyes – stern */}
      <rect x="3" y="5" width="2" height="1" fill="#212121" />
      <rect x="7" y="5" width="2" height="1" fill="#212121" />
      <rect x="3" y="4" width="2" height="1" fill="#212121" />
      <rect x="7" y="4" width="2" height="1" fill="#212121" />
      {/* Flat mouth */}
      <rect x="4" y="7" width="4" height="1" fill="#6D4C41" />
      {/* Body – red jacket */}
      <rect x="2" y="9" width="8" height="5" fill="#B71C1C" />
      <rect x="0" y="9" width="2" height="5" fill="#B71C1C" />
      <rect x="10" y="9" width="2" height="5" fill="#B71C1C" />
      {/* Jacket collar/stripe */}
      <rect x="5" y="9" width="2" height="5" fill="#D32F2F" />
      {/* Hands */}
      <rect x="0" y="13" width="2" height="1" fill="#8D5524" />
      <rect x="10" y="13" width="2" height="1" fill="#8D5524" />
      {/* Legs */}
      <rect x="3" y="14" width="2" height="2" fill="#1A237E" />
      <rect x="7" y="14" width="2" height="2" fill="#1A237E" />
      {walking && <rect x="7" y="14" width="2" height="1" fill="#1A237E" transform="translate(0,1)" />}
      {/* Shoes */}
      <rect x="2" y="15" width="3" height="1" fill="#000" />
      <rect x="7" y="15" width="3" height="1" fill="#000" />
    </svg>
  );
}

/* ─── AGENT CONFIG ───────────────────────────────────────────── */
export const AGENT_CONFIG = {
  alice: {
    name:   "Alice",
    label:  "Research Lead",
    color:  "#4fc3f7",
    emoji:  "🔍",
    sprite: AliceSprite,
  },
  scribe: {
    name:   "Scribe",
    label:  "Copywriter",
    color:  "#81c784",
    emoji:  "✍️",
    sprite: ScribeSprite,
  },
  sentinel: {
    name:   "Sentinel",
    label:  "QA Lead",
    color:  "#ef5350",
    emoji:  "🛡️",
    sprite: SentinelSprite,
  },
} as const;

/* ─── AGENT COMPONENT ────────────────────────────────────────── */
interface AgentProps {
  id: "alice" | "scribe" | "sentinel";
  state: AgentState;
  style?: React.CSSProperties;
}

export function Agent({ id, state, style }: AgentProps) {
  const config = AGENT_CONFIG[id];
  const SpriteComponent = config.sprite;
  const isWalking = state === "walking";
  const isActive  = state === "active" || isWalking;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ ...style, transition: "transform 1.2s ease-in-out" }}
    >
      {/* Speech bubble */}
      {isActive && (
        <div className="speech-bubble animate-float-bubble mb-1 z-10">
          {config.emoji}
        </div>
      )}

      {/* Sprite */}
      <div className={isWalking ? "walking" : "idle"}>
        <SpriteComponent walking={isWalking} />
      </div>

      {/* Name tag */}
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

      {/* Status dot */}
      <div
        className="w-2 h-2 mt-0.5"
        style={{ background: isActive ? "#39ff14" : "#555", boxShadow: isActive ? "0 0 6px #39ff14" : "none" }}
      />
    </div>
  );
}
