"use client";

/* ─── DESK (pixel art top view) ──────────────── */
export function Desk({ color = "#a0522d" }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 14" width={90} height={63} style={{ imageRendering: "pixelated" }}>
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
    <svg viewBox="0 0 20 14" width={100} height={70} style={{ imageRendering: "pixelated" }}>
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
    <svg viewBox="0 0 48 28" width={220} height={128} style={{ imageRendering: "pixelated" }}>
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
    <svg viewBox="0 0 16 24" width={64} height={96} style={{ imageRendering: "pixelated" }}>
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
    <svg viewBox="0 0 10 14" width={45} height={63} style={{ imageRendering: "pixelated" }}>
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
      <svg viewBox="0 0 10 12" width={45} height={54} style={{ imageRendering: "pixelated" }}>
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

/* ─── CEO DESK (Premium executive desk) ──── */
export function CeoDesk() {
  return (
    <svg viewBox="0 0 28 18" width={112} height={72} style={{ imageRendering: "pixelated" }}>
      {/* Desktop surface — dark mahogany */}
      <rect x="0" y="3" width="28" height="12" fill="#4E342E" />
      <rect x="0" y="3" width="28" height="2" fill="#6D4C41" />
      <rect x="0" y="13" width="28" height="2" fill="#000" opacity="0.15" />
      {/* Dual monitors */}
      <rect x="3" y="0" width="9" height="6" fill="#1a1a1a" />
      <rect x="4" y="1" width="7" height="4" fill="#4fc3f7" opacity="0.7" />
      <rect x="4" y="1" width="3" height="1" fill="#fff" opacity="0.15" />
      <rect x="16" y="0" width="9" height="6" fill="#1a1a1a" />
      <rect x="17" y="1" width="7" height="4" fill="#39ff14" opacity="0.5" />
      <rect x="17" y="1" width="2" height="1" fill="#fff" opacity="0.15" />
      {/* Monitor stands */}
      <rect x="6" y="6" width="3" height="1" fill="#616161" />
      <rect x="19" y="6" width="3" height="1" fill="#616161" />
      {/* Keyboard */}
      <rect x="7" y="8" width="14" height="3" fill="#222" />
      <rect x="8" y="9" width="1" height="1" fill="#444" />
      <rect x="10" y="9" width="1" height="1" fill="#444" />
      <rect x="12" y="9" width="1" height="1" fill="#444" />
      <rect x="14" y="9" width="1" height="1" fill="#444" />
      <rect x="16" y="9" width="1" height="1" fill="#444" />
      <rect x="18" y="9" width="1" height="1" fill="#444" />
      {/* Mouse */}
      <rect x="23" y="9" width="3" height="2" fill="#333" />
      {/* Gold nameplate */}
      <rect x="10" y="12" width="8" height="2" fill="#FFD700" />
      <rect x="11" y="12" width="6" height="1" fill="#FFF176" opacity="0.4" />
      {/* Mug */}
      <rect x="1" y="7" width="3" height="4" fill="#1565C0" />
      <rect x="1" y="7" width="3" height="1" fill="#1976D2" />
      {/* Executive chair */}
      <rect x="8" y="15" width="12" height="3" fill="#212121" />
      <rect x="9" y="14" width="10" height="2" fill="#333" />
      <rect x="9" y="14" width="10" height="1" fill="#424242" />
      {/* Legs */}
      <rect x="2" y="15" width="2" height="3" fill="#3E2723" />
      <rect x="24" y="15" width="2" height="3" fill="#3E2723" />
    </svg>
  );
}

/* ─── FILING CABINET ─────────────────────── */
export function FilingCabinet() {
  return (
    <svg viewBox="0 0 10 16" width={40} height={64} style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="0" width="10" height="16" fill="#757575" />
      <rect x="0" y="0" width="10" height="1" fill="#9E9E9E" />
      {/* Drawers */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="1" y={2 + i * 5} width="8" height="4" fill="#616161" />
          <rect x="1" y={2 + i * 5} width="8" height="1" fill="#757575" />
          <rect x="4" y={3 + i * 5} width="2" height="1" fill="#9E9E9E" />
        </g>
      ))}
    </svg>
  );
}

/* ─── PRINTER ────────────────────────────── */
export function Printer() {
  return (
    <svg viewBox="0 0 12 10" width={48} height={40} style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="2" width="12" height="6" fill="#E0E0E0" />
      <rect x="0" y="2" width="12" height="1" fill="#F5F5F5" />
      {/* Paper tray top */}
      <rect x="2" y="0" width="8" height="3" fill="#FAFAFA" />
      <rect x="3" y="0" width="6" height="1" fill="#E0E0E0" />
      {/* Paper output */}
      <rect x="3" y="7" width="6" height="3" fill="#FFF" />
      <rect x="4" y="8" width="4" height="1" fill="#BDBDBD" />
      {/* Status LED */}
      <rect x="1" y="4" width="1" height="1" fill="#39ff14" />
      {/* Buttons */}
      <rect x="9" y="4" width="2" height="1" fill="#9E9E9E" />
    </svg>
  );
}

/* ─── WATER COOLER ────────────────────────── */
export function WaterCooler() {
  return (
    <svg viewBox="0 0 8 16" width={36} height={72} style={{ imageRendering: "pixelated" }}>
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

/* ─── OFFICE RUG (decorative floor mat) ────── */
export function OfficeRug() {
  return (
    <svg viewBox="0 0 40 20" width={180} height={90} style={{ imageRendering: "pixelated" }}>
      {/* Outer border */}
      <rect x="0" y="0" width="40" height="20" fill="#5D2E8C" opacity="0.3" />
      {/* Inner pattern */}
      <rect x="2" y="2" width="36" height="16" fill="#7B1FA2" opacity="0.2" />
      {/* Center diamond */}
      <rect x="16" y="6" width="8" height="8" fill="#AB47BC" opacity="0.2" transform="rotate(45, 20, 10)" />
      {/* Corner details */}
      <rect x="3" y="3" width="3" height="3" fill="#CE93D8" opacity="0.15" />
      <rect x="34" y="3" width="3" height="3" fill="#CE93D8" opacity="0.15" />
      <rect x="3" y="14" width="3" height="3" fill="#CE93D8" opacity="0.15" />
      <rect x="34" y="14" width="3" height="3" fill="#CE93D8" opacity="0.15" />
    </svg>
  );
}

/* ─── PHONE (desk phone) ────────────────── */
export function DeskPhone() {
  return (
    <svg viewBox="0 0 8 10" width={32} height={40} style={{ imageRendering: "pixelated" }}>
      {/* Base */}
      <rect x="0" y="4" width="8" height="6" fill="#333" />
      <rect x="0" y="4" width="8" height="1" fill="#444" />
      {/* Number pad */}
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}${c}`} x={2+c*2} y={6+r*1} width="1" height="0.5" fill="#666" />
      )))}
      {/* Handset */}
      <rect x="0" y="0" width="8" height="3" fill="#222" />
      <rect x="0" y="0" width="2" height="3" fill="#2a2a2a" />
      <rect x="6" y="0" width="2" height="3" fill="#2a2a2a" />
      {/* Screen */}
      <rect x="2" y="5" width="4" height="1" fill="#39ff14" opacity="0.5" />
    </svg>
  );
}

/* ─── TRASH BIN ──────────────────────────── */
export function TrashBin() {
  return (
    <svg viewBox="0 0 6 8" width={24} height={32} style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="1" width="6" height="7" fill="#616161" />
      <rect x="0" y="1" width="6" height="1" fill="#757575" />
      {/* Rim */}
      <rect x="-1" y="0" width="8" height="1" fill="#9E9E9E" />
      {/* Crumpled paper */}
      <rect x="1" y="2" width="2" height="2" fill="#E0E0E0" />
      <rect x="3" y="3" width="2" height="1" fill="#F5F5F5" />
    </svg>
  );
}

/* ─── COAT RACK ──────────────────────────── */
export function CoatRack() {
  return (
    <svg viewBox="0 0 8 16" width={32} height={64} style={{ imageRendering: "pixelated" }}>
      {/* Pole */}
      <rect x="3" y="4" width="2" height="12" fill="#5D4037" />
      {/* Top */}
      <rect x="2" y="3" width="4" height="1" fill="#4E342E" />
      {/* Hooks */}
      <rect x="0" y="4" width="3" height="1" fill="#424242" />
      <rect x="5" y="4" width="3" height="1" fill="#424242" />
      {/* Coat hanging */}
      <rect x="0" y="5" width="3" height="4" fill="#1565C0" opacity="0.6" />
      {/* Base */}
      <rect x="1" y="15" width="6" height="1" fill="#4E342E" />
    </svg>
  );
}

/* ─── NOTICE BOARD (bulletin board) ──────── */
export function NoticeBoard() {
  return (
    <svg viewBox="0 0 16 12" width={64} height={48} style={{ imageRendering: "pixelated" }}>
      {/* Cork board */}
      <rect x="0" y="0" width="16" height="12" fill="#8D6E63" />
      <rect x="0" y="0" width="16" height="1" fill="#6D4C41" />
      {/* Pinned notes */}
      <rect x="1" y="2" width="4" height="3" fill="#FFF176" />
      <rect x="2" y="1" width="1" height="1" fill="#E53935" />
      <rect x="6" y="1" width="5" height="4" fill="#81D4FA" />
      <rect x="8" y="1" width="1" height="1" fill="#1565C0" />
      <rect x="2" y="6" width="6" height="3" fill="#C8E6C9" />
      <rect x="4" y="6" width="1" height="1" fill="#2E7D32" />
      <rect x="10" y="6" width="4" height="4" fill="#FFCCBC" />
      <rect x="11" y="6" width="1" height="1" fill="#FF5722" />
      {/* Text lines on notes */}
      <rect x="2" y="3" width="2" height="0.5" fill="#999" />
      <rect x="7" y="3" width="3" height="0.5" fill="#999" />
      <rect x="3" y="7" width="4" height="0.5" fill="#999" />
      <rect x="11" y="8" width="2" height="0.5" fill="#999" />
    </svg>
  );
}
