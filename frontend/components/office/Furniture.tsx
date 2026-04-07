"use client";

/* ─── DESK (pixel art top view) ──────────────── */
export function Desk({ color = "#a0522d" }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 14" width={60} height={42} style={{ imageRendering: "pixelated" }}>
      {/* Desktop surface */}
      <rect x="0" y="2" width="20" height="10" fill={color} />
      {/* Top edge (highlight) */}
      <rect x="0" y="2" width="20" height="2" fill="#c47a3a" />
      {/* Shadow on desk */}
      <rect x="0" y="10" width="20" height="2" fill="#000" opacity="0.15" />
      {/* Monitor */}
      <rect x="6" y="0" width="8" height="5" fill="#1a1a1a" />
      <rect x="7" y="1" width="6" height="3" fill="#4fc3f7" opacity="0.8" />
      {/* Screen glare */}
      <rect x="7" y="1" width="2" height="1" fill="#fff" opacity="0.15" />
      <rect x="9" y="5" width="2" height="2" fill="#616161" />
      {/* Keyboard */}
      <rect x="5" y="7" width="10" height="3" fill="#333" />
      <rect x="6" y="8" width="1" height="1" fill="#555" />
      <rect x="8" y="8" width="1" height="1" fill="#555" />
      <rect x="10" y="8" width="1" height="1" fill="#555" />
      <rect x="12" y="8" width="1" height="1" fill="#555" />
      {/* Mouse */}
      <rect x="16" y="8" width="2" height="2" fill="#444" />
      <rect x="16" y="8" width="2" height="1" fill="#555" />
      {/* Coffee mug on desk */}
      <rect x="1" y="6" width="3" height="3" fill="#795548" />
      <rect x="1" y="6" width="3" height="1" fill="#8D6E63" />
      {/* Legs */}
      <rect x="1" y="12" width="2" height="2" fill="#6D4C41" />
      <rect x="17" y="12" width="2" height="2" fill="#6D4C41" />
    </svg>
  );
}

/* ─── WINDOW (wall mounted) ──────────────────── */
export function Window() {
  return (
    <svg viewBox="0 0 16 12" width={48} height={36} style={{ imageRendering: "pixelated" }}>
      {/* Frame */}
      <rect x="0" y="0" width="16" height="12" fill="#5D4037" />
      {/* Glass panes */}
      <rect x="1" y="1" width="6" height="10" fill="#1565C0" opacity="0.4" />
      <rect x="9" y="1" width="6" height="10" fill="#1565C0" opacity="0.35" />
      {/* Center divider */}
      <rect x="7" y="0" width="2" height="12" fill="#5D4037" />
      {/* Horizontal divider */}
      <rect x="0" y="5" width="16" height="2" fill="#5D4037" />
      {/* Sky light reflection */}
      <rect x="2" y="2" width="3" height="2" fill="#4fc3f7" opacity="0.3" />
      <rect x="10" y="2" width="3" height="2" fill="#4fc3f7" opacity="0.2" />
      {/* Sill */}
      <rect x="0" y="11" width="16" height="1" fill="#4E342E" />
    </svg>
  );
}

/* ─── WHITEBOARD ─────────────────────────────── */
export function Whiteboard() {
  return (
    <svg viewBox="0 0 20 14" width={60} height={42} style={{ imageRendering: "pixelated" }}>
      {/* Frame */}
      <rect x="0" y="0" width="20" height="14" fill="#757575" />
      {/* White surface */}
      <rect x="1" y="1" width="18" height="11" fill="#F5F5F5" />
      {/* Scribbles */}
      <rect x="2" y="3" width="8" height="1" fill="#E53935" opacity="0.7" />
      <rect x="2" y="5" width="12" height="1" fill="#1E88E5" opacity="0.6" />
      <rect x="2" y="7" width="6" height="1" fill="#43A047" opacity="0.7" />
      <rect x="10" y="7" width="5" height="1" fill="#FF9800" opacity="0.5" />
      {/* Sticky notes */}
      <rect x="14" y="2" width="4" height="3" fill="#FFF176" />
      <rect x="14" y="2" width="4" height="1" fill="#FFD54F" />
      {/* Marker tray */}
      <rect x="2" y="12" width="16" height="2" fill="#616161" />
      <rect x="3" y="12" width="2" height="1" fill="#E53935" />
      <rect x="6" y="12" width="2" height="1" fill="#1E88E5" />
      <rect x="9" y="12" width="2" height="1" fill="#212121" />
    </svg>
  );
}

/* ─── WALL CLOCK ─────────────────────────────── */
export function WallClock() {
  return (
    <svg viewBox="0 0 10 10" width={30} height={30} style={{ imageRendering: "pixelated" }}>
      {/* Face */}
      <rect x="1" y="1" width="8" height="8" fill="#F5F5F5" />
      <rect x="0" y="0" width="10" height="10" fill="none" stroke="#424242" strokeWidth="1" />
      {/* Hour marks */}
      <rect x="4" y="1" width="2" height="1" fill="#333" />
      <rect x="4" y="8" width="2" height="1" fill="#333" />
      <rect x="1" y="4" width="1" height="2" fill="#333" />
      <rect x="8" y="4" width="1" height="2" fill="#333" />
      {/* Hands */}
      <rect x="5" y="3" width="1" height="3" fill="#212121" />
      <rect x="5" y="5" width="3" height="1" fill="#E53935" />
      {/* Center */}
      <rect x="4" y="4" width="2" height="2" fill="#333" />
    </svg>
  );
}

/* ─── CONFERENCE TABLE ────────────────────────── */
export function ConferenceTable() {
  return (
    <svg viewBox="0 0 48 28" width={144} height={84} style={{ imageRendering: "pixelated" }}>
      {/* Table surface */}
      <rect x="2" y="4" width="44" height="20" fill="#8B6914" />
      {/* Top highlight */}
      <rect x="2" y="4" width="44" height="3" fill="#C8A96E" />
      {/* Left highlight */}
      <rect x="2" y="4" width="3" height="20" fill="#C8A96E" />
      {/* Chairs */}
      <rect x="6"  y="0"  width="6" height="4" fill="#5D4037" />
      <rect x="18" y="0"  width="6" height="4" fill="#5D4037" />
      <rect x="30" y="0"  width="6" height="4" fill="#5D4037" />
      <rect x="6"  y="24" width="6" height="4" fill="#5D4037" />
      <rect x="18" y="24" width="6" height="4" fill="#5D4037" />
      <rect x="30" y="24" width="6" height="4" fill="#5D4037" />
      {/* Legs */}
      <rect x="2"  y="22" width="3" height="4" fill="#6D4C41" />
      <rect x="43" y="22" width="3" height="4" fill="#6D4C41" />
    </svg>
  );
}

/* ─── PAPER/REPORT ICON ───────────────────────── */
export function ReportIcon({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="report-drop absolute" style={{ top: "30px", left: "50%", transform: "translateX(-50%)" }}>
      <svg viewBox="0 0 10 12" width={30} height={36} style={{ imageRendering: "pixelated" }}>
        <rect x="0" y="0" width="10" height="12" fill="#FFFDE7" />
        <rect x="0" y="0" width="10" height="1" fill="#F9A825" />
        <rect x="1" y="3" width="8" height="1" fill="#9E9E9E" />
        <rect x="1" y="5" width="8" height="1" fill="#9E9E9E" />
        <rect x="1" y="7" width="6" height="1" fill="#9E9E9E" />
        <rect x="1" y="9" width="4" height="1" fill="#9E9E9E" />
      </svg>
    </div>
  );
}

/* ─── BOOKCASE ────────────────────────────────── */
export function Bookcase() {
  return (
    <svg viewBox="0 0 14 18" width={42} height={54} style={{ imageRendering: "pixelated" }}>
      {/* Frame */}
      <rect x="0" y="0" width="14" height="18" fill="#5D4037" />
      {/* Shelves */}
      <rect x="1" y="6"  width="12" height="1" fill="#3E2723" />
      <rect x="1" y="12" width="12" height="1" fill="#3E2723" />
      {/* Books row 1 */}
      <rect x="1" y="1" width="2" height="5" fill="#E53935" />
      <rect x="3" y="1" width="2" height="5" fill="#1E88E5" />
      <rect x="5" y="1" width="3" height="5" fill="#43A047" />
      <rect x="8" y="1" width="2" height="5" fill="#FB8C00" />
      <rect x="10" y="1" width="3" height="5" fill="#8E24AA" />
      {/* Books row 2 */}
      <rect x="1" y="7" width="3" height="5" fill="#00ACC1" />
      <rect x="4" y="7" width="2" height="5" fill="#F4511E" />
      <rect x="6" y="7" width="2" height="5" fill="#FFB300" />
      <rect x="8" y="7" width="3" height="5" fill="#3949AB" />
      <rect x="11" y="7" width="2" height="5" fill="#00897B" />
      {/* Row 3 */}
      <rect x="1" y="13" width="4" height="4" fill="#D81B60" />
      <rect x="5" y="13" width="2" height="4" fill="#6D4C41" />
      <rect x="7" y="13" width="3" height="4" fill="#039BE5" />
      <rect x="10" y="13" width="3" height="4" fill="#558B2F" />
    </svg>
  );
}

/* ─── SERVER RACK ─────────────────────────────── */
export function ServerRack() {
  return (
    <svg viewBox="0 0 16 24" width={48} height={72} style={{ imageRendering: "pixelated" }}>
      {/* Cabinet */}
      <rect x="0" y="0" width="16" height="24" fill="#1a1a1a" />
      <rect x="0" y="0" width="16" height="1" fill="#333" />
      <rect x="0" y="0" width="1" height="24" fill="#2a2a2a" />
      <rect x="15" y="0" width="1" height="24" fill="#111" />
      {/* Server units */}
      {[0,1,2,3,4].map((i) => (
        <g key={i}>
          <rect x="2" y={2 + i*4} width="12" height="3" fill="#282828" />
          <rect x="2" y={2 + i*4} width="12" height="1" fill="#333" />
          {/* Status LEDs */}
          <rect x="3" y={3 + i*4} width="1" height="1" fill="#39ff14"
            style={{ animation: `serverBlink ${1 + i * 0.3}s step-end infinite` }} />
          <rect x="5" y={3 + i*4} width="1" height="1" fill="#4fc3f7"
            style={{ animation: `serverBlink ${0.9 + i * 0.25}s step-end infinite` }} />
          <rect x="7" y={3 + i*4} width="1" height="1" fill="#ef5350"
            style={{ animation: `serverBlink ${0.7 + i * 0.2}s step-end infinite` }} />
          {/* Drive bays */}
          <rect x="9" y={3 + i*4} width="2" height="1" fill="#1a1a1a" />
          <rect x="12" y={3 + i*4} width="2" height="1" fill="#1a1a1a" />
        </g>
      ))}
      {/* Cables dangling from side */}
      <rect x="15" y="4" width="1" height="3" fill="#ef5350" opacity="0.6" />
      <rect x="15" y="8" width="1" height="4" fill="#4fc3f7" opacity="0.6" />
      <rect x="15" y="14" width="1" height="3" fill="#39ff14" opacity="0.6" />
      {/* Ventilation */}
      <rect x="4" y="22" width="8" height="1" fill="#222" />
      <rect x="5" y="22" width="1" height="1" fill="#2a2a2a" />
      <rect x="7" y="22" width="1" height="1" fill="#2a2a2a" />
      <rect x="9" y="22" width="1" height="1" fill="#2a2a2a" />
      {/* Feet */}
      <rect x="1" y="23" width="3" height="1" fill="#333" />
      <rect x="12" y="23" width="3" height="1" fill="#333" />
    </svg>
  );
}

/* ─── PLANT ───────────────────────────────────── */
export function Plant() {
  return (
    <svg viewBox="0 0 10 14" width={30} height={42} style={{ imageRendering: "pixelated" }}>
      {/* Pot */}
      <rect x="2" y="10" width="6" height="4" fill="#BF360C" />
      <rect x="1" y="9"  width="8" height="2" fill="#D84315" />
      {/* Soil */}
      <rect x="2" y="10" width="6" height="1" fill="#4E342E" />
      {/* Stem */}
      <rect x="4" y="4" width="2" height="6" fill="#388E3C" />
      {/* Leaves */}
      <rect x="1" y="2" width="4" height="4" fill="#43A047" />
      <rect x="5" y="1" width="4" height="4" fill="#2E7D32" />
      <rect x="2" y="0" width="3" height="3" fill="#66BB6A" />
    </svg>
  );
}
/* ─── COFFEE MACHINE ────────────────────────── */
export function CoffeeMachine() {
  return (
    <div className="relative">
      {/* Steam particles */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
        <div className="w-1 h-1 bg-white rounded-full coffee-steam" style={{ animationDelay: "0s" }} />
        <div className="w-1 h-1 bg-white rounded-full coffee-steam" style={{ animationDelay: "0.8s" }} />
        <div className="w-1 h-1 bg-white rounded-full coffee-steam" style={{ animationDelay: "1.6s" }} />
      </div>
      <svg viewBox="0 0 10 12" width={30} height={36} style={{ imageRendering: "pixelated" }}>
        {/* Body */}
        <rect x="1" y="0" width="8" height="12" fill="#424242" />
        <rect x="2" y="1" width="6" height="3" fill="#555" />
        {/* Brand stripe */}
        <rect x="2" y="0" width="6" height="1" fill="#795548" />
        {/* Buttons */}
        <rect x="3" y="2" width="1" height="1" fill="#ef5350" />
        <rect x="5" y="2" width="1" height="1" fill="#39ff14" />
        <rect x="7" y="2" width="1" height="1" fill="#4fc3f7" />
        {/* Dispenser Area */}
        <rect x="2" y="5" width="6" height="5" fill="#1a1a1a" />
        {/* Cup */}
        <rect x="3" y="7" width="4" height="3" fill="#EEEEEE" />
        <rect x="3" y="7" width="4" height="1" fill="#E0E0E0" />
        {/* Coffee in cup */}
        <rect x="4" y="8" width="2" height="1" fill="#4E342E" />
        {/* Base */}
        <rect x="0" y="11" width="10" height="1" fill="#333" />
      </svg>
    </div>
  );
}

/* ─── WATER COOLER ────────────────────────── */
export function WaterCooler() {
  return (
    <svg viewBox="0 0 8 16" width={24} height={48} style={{ imageRendering: "pixelated" }}>
      {/* Base */}
      <rect x="1" y="8" width="6" height="8" fill="#E0E0E0" />
      <rect x="2" y="9" width="4" height="2" fill="#BDBDBD" />
      {/* Tank */}
      <rect x="1" y="1" width="6" height="7" fill="#4fc3f7" opacity="0.6" />
      <rect x="2" y="0" width="4" height="1" fill="#29B6F6" />
      {/* Dispenser buttons */}
      <rect x="2" y="12" width="1" height="1" fill="#2196F3" />
      <rect x="5" y="12" width="1" height="1" fill="#F44336" />
    </svg>
  );
}
