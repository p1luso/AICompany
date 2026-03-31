"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export type AgentState = "idle" | "active" | "walking";

export interface AgentStatus {
  id: "alice" | "scribe" | "sentinel";
  state: AgentState;
  lastModified: number | null;
  lastFile: string | null;
  /** Set to true for one polling cycle when mtime changed — triggers animations */
  justChanged: boolean;
}

const POLL_INTERVAL = 10_000; // 10 seconds

const DEFAULT_AGENTS: AgentStatus[] = [
  { id: "alice",    state: "idle", lastModified: null, lastFile: null, justChanged: false },
  { id: "scribe",   state: "idle", lastModified: null, lastFile: null, justChanged: false },
  { id: "sentinel", state: "idle", lastModified: null, lastFile: null, justChanged: false },
];

export function useAgentTracker() {
  const [agents, setAgents] = useState<AgentStatus[]>(DEFAULT_AGENTS);
  const prevMtimes = useRef<Record<string, number | null>>({});

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) return;

      const data = await res.json() as {
        agents: Array<{ id: string; state: string; lastModified: number | null; lastFile: string | null }>;
      };

      setAgents((prev) =>
        data.agents.map((incoming) => {
          const prevMtime = prevMtimes.current[incoming.id] ?? null;
          const justChanged = incoming.lastModified !== null && incoming.lastModified !== prevMtime;

          // Update tracked mtimes
          prevMtimes.current[incoming.id] = incoming.lastModified;

          const prevAgent = prev.find((a) => a.id === incoming.id);

          return {
            id: incoming.id as AgentStatus["id"],
            state: incoming.state as AgentState,
            lastModified: incoming.lastModified,
            lastFile: incoming.lastFile,
            // Walking = currently active AND just changed
            justChanged: justChanged && incoming.state === "active",
          } satisfies AgentStatus;
        })
      );
    } catch {
      // Silently fail — server may not be ready
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  // Clear justChanged after one render cycle
  useEffect(() => {
    const hasChanges = agents.some((a) => a.justChanged);
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      setAgents((prev) => prev.map((a) => ({ ...a, justChanged: false })));
    }, 2000); // Walking animation duration

    return () => clearTimeout(timer);
  }, [agents]);

  return agents;
}
