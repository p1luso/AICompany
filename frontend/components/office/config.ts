"use client";

export interface Waypoint {
  x: number;
  y: number;
  label: string;
}

/**
 * Waypoints defined in percentage (%) relative to the parent room container.
 * recalibrated for the 6-desk office layout.
 */
export const WAYPOINTS: Record<string, Record<string, Waypoint>> = {
  alice: {
    desk:       { x: 45, y: 60, label: "Desk Alice (Scrum Master)" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 50, y: 82, label: "Whiteboard" },
    books:      { x: 6,  y: 85, label: "Library" },
  },
  scribe: {
    desk:       { x: 55, y: 60, label: "Desk Scribe (Marketing)" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 82, label: "Whiteboard" },
    books:      { x: 6,  y: 85, label: "Library" },
  },
  atlas: {
    desk:       { x: 15, y: 58, label: "Desk Atlas (Lead Dev)" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 50, y: 82, label: "Whiteboard" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
  },
  luna: {
    desk:       { x: 75, y: 58, label: "Desk Luna (QA)" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 82, label: "Whiteboard" },
    water:      { x: 8,  y: 15, label: "Water Cooler" },
  },
  nova: {
    desk:       { x: 85, y: 58, label: "Desk Nova (Creative)" },
    coffee:     { x: 92, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 82, label: "Whiteboard" },
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
