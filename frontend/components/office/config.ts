"use client";

export interface Waypoint {
  x: number;
  y: number;
  label: string;
}

/**
 * Waypoints defined in percentage (%) relative to the parent room container.
 * Recalibrated for the 6-desk office layout with CEO desk.
 */
export const WAYPOINTS: Record<string, Record<string, Waypoint>> = {
  alice: {
    desk:       { x: 45, y: 60, label: "Desk Alice (Scrum Master)" },
    ceo:        { x: 50, y: 82, label: "CEO Desk" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 55, y: 82, label: "Whiteboard" },
    books:      { x: 6,  y: 85, label: "Library" },
    atlas_desk: { x: 15, y: 58, label: "Atlas Desk" },
    scribe_desk:{ x: 55, y: 60, label: "Scribe Desk" },
    luna_desk:  { x: 75, y: 58, label: "Luna Desk" },
    nova_desk:  { x: 85, y: 58, label: "Nova Desk" },
  },
  scribe: {
    desk:       { x: 55, y: 60, label: "Desk Scribe (Marketing)" },
    ceo:        { x: 50, y: 82, label: "CEO Desk" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 55, y: 82, label: "Whiteboard" },
    books:      { x: 6,  y: 85, label: "Library" },
  },
  atlas: {
    desk:       { x: 15, y: 58, label: "Desk Atlas (Lead Dev)" },
    ceo:        { x: 50, y: 82, label: "CEO Desk" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 55, y: 82, label: "Whiteboard" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    luna_desk:  { x: 75, y: 58, label: "Luna Desk" },
  },
  luna: {
    desk:       { x: 75, y: 58, label: "Desk Luna (QA)" },
    ceo:        { x: 50, y: 82, label: "CEO Desk" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 55, y: 82, label: "Whiteboard" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
    atlas_desk: { x: 15, y: 58, label: "Atlas Desk" },
  },
  nova: {
    desk:       { x: 85, y: 58, label: "Desk Nova (Creative)" },
    ceo:        { x: 50, y: 82, label: "CEO Desk" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 55, y: 82, label: "Whiteboard" },
    plant:      { x: 94, y: 85, label: "Plant" },
  },
  sentinel: {
    desk:    { x: 15, y: 45, label: "Sentinel Workstation" },
    server1: { x: 30, y: 40, label: "Server Row 1" },
    server2: { x: 50, y: 40, label: "Server Row 2" },
    server3: { x: 70, y: 40, label: "Server Row 3" },
    switch:  { x: 90, y: 45, label: "Network Switch" },
  }
};

/** Handoff target: maps agentId to its desk waypoint key in another agent's waypoints */
export const HANDOFF_DESK_KEY: Record<string, string> = {
  alice: "desk",
  scribe: "scribe_desk",
  atlas: "atlas_desk",
  luna: "luna_desk",
  nova: "nova_desk",
  sentinel: "desk",
};
