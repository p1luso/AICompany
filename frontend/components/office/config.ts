"use client";

export interface Waypoint {
  x: number;
  y: number;
  label: string;
}

export const WAYPOINTS: Record<string, Record<string, Waypoint>> = {
  alice: {
    desk:       { x: 20,  y: 62,  label: "Desk Alice" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
    water:      { x: 10,  y: 110, label: "Water Cooler" },
    books:      { x: 15,  y: 25,  label: "Library" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    window:     { x: 80,  y: 25,  label: "Window" },
    plant:      { x: 260, y: 25,  label: "Plant" },
  },
  scribe: {
    desk:       { x: 140, y: 62,  label: "Desk Scribe" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
    report:     { x: 400, y: 50,  label: "Meeting Room" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    books:      { x: 15,  y: 25,  label: "Library" },
  },
  atlas: {
    desk:       { x: 75,  y: 62,  label: "Desk Atlas" },
    water:      { x: 10,  y: 110, label: "Water Cooler" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
  },
  luna: {
    desk:       { x: 205, y: 62,  label: "Desk Luna" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
    whiteboard: { x: 130, y: 25,  label: "Whiteboard" },
    water:      { x: 10,  y: 110, label: "Water Cooler" },
  },
  nova: {
    desk:       { x: 10,  y: 10,  label: "Desk Nova" }, // Custom spot
    window:     { x: 80,  y: 25,  label: "Window" },
    plant:      { x: 260, y: 25,  label: "Plant" },
    report:     { x: 400, y: 50,  label: "Meeting Room" },
    coffee:     { x: 240, y: 70,  label: "Coffee Machine" },
  },
  sentinel: {
    desk:    { x: 32,  y: 5,  label: "Server Corner" },
    server1: { x: 80,  y: 20, label: "Server Row 1" },
    server2: { x: 150, y: 20, label: "Server Row 2" },
    server3: { x: 220, y: 20, label: "Server Row 3" },
    switch:  { x: 300, y: 15, label: "Network Switch" },
  }
};
