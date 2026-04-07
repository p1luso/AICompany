"use client";

export interface Waypoint {
  x: number;
  y: number;
  label: string;
}

/**
 * Waypoints defined in percentage (%) relative to the parent room container.
 */
export const WAYPOINTS: Record<string, Record<string, Waypoint>> = {
  alice: {
    desk:       { x: 42, y: 58, label: "Desk Alice (HQ)" },
    coffee:     { x: 94, y: 15, label: "Coffee Machine" },
    water:      { x: 6,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 50, y: 88, label: "Whiteboard" },
    books:      { x: 5,  y: 88, label: "Library" },
  },
  scribe: {
    desk:       { x: 52, y: 58, label: "Desk Scribe (HQ)" },
    coffee:     { x: 94, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 88, label: "Whiteboard" },
    books:      { x: 5,  y: 88, label: "Library" },
  },
  atlas: {
    desk:       { x: 12, y: 55, label: "Desk Atlas (Dev)" },
    water:      { x: 6,  y: 15, label: "Water Cooler" },
    whiteboard: { x: 50, y: 88, label: "Whiteboard" },
    coffee:     { x: 94, y: 15, label: "Coffee Machine" },
  },
  luna: {
    desk:       { x: 82, y: 48, label: "Desk Luna (QA)" },
    coffee:     { x: 94, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 88, label: "Whiteboard" },
    water:      { x: 6,  y: 15, label: "Water Cooler" },
  },
  nova: {
    desk:       { x: 42, y: 38, label: "Desk Nova (Creative)" },
    coffee:     { x: 94, y: 15, label: "Coffee Machine" },
    whiteboard: { x: 50, y: 88, label: "Whiteboard" },
    plant:      { x: 95, y: 88, label: "Plant" },
  },
  sentinel: {
    desk:    { x: 14, y: 35, label: "Sentinel Workstation" },
    server1: { x: 30, y: 40, label: "Server Row 1" },
    server2: { x: 50, y: 40, label: "Server Row 2" },
    server3: { x: 70, y: 40, label: "Server Row 3" },
    switch:  { x: 90, y: 35, label: "Network Switch" },
  }
};
