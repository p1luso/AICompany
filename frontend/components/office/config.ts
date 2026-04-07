"use client";

export interface Waypoint {
  x: number;
  y: number;
  label: string;
}

export const WAYPOINTS: Record<string, Record<string, Waypoint>> = {
  alice: {
    desk:       { x: 10,  y: 62,  label: "Desk" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
    water:      { x: 10,  y: 110, label: "Water Cooler" },
    books:      { x: 15,  y: 25,  label: "Library" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    window:     { x: 80,  y: 25,  label: "Window" },
    plant:      { x: 260, y: 25,  label: "Plant" },
  },
  scribe: {
    desk:       { x: 150, y: 62,  label: "Desk" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
    report:     { x: 400, y: 50,  label: "Meeting Room" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    books:      { x: 15,  y: 25,  label: "Library" },
    water:      { x: 10,  y: 110, label: "Water Cooler" },
  },
  sentinel: {
    desk:    { x: 32,  y: 5,  label: "Desk" },
    server1: { x: 80,  y: 20, label: "Server Row 1" },
    server2: { x: 150, y: 20, label: "Server Row 2" },
    server3: { x: 220, y: 20, label: "Server Row 3" },
    switch:  { x: 300, y: 15, label: "Network Switch" },
  }
};
