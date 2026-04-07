import { create } from "zustand";

export type AgentStatus = "IDLE" | "ACTIVE";

interface Agent {
  id: string;
  status: AgentStatus;
  lastSeen: number;
}

interface AgentStore {
  agents: Record<string, Agent>;
  updateAgent: (id: string, status: AgentStatus) => void;
  tick: () => void;
}

const INITIAL_AGENTS: Record<string, Agent> = {
  alice:    { id: "alice",    status: "IDLE", lastSeen: Date.now() },
  scribe:   { id: "scribe",   status: "IDLE", lastSeen: Date.now() },
  sentinel: { id: "sentinel", status: "IDLE", lastSeen: Date.now() },
  atlas:    { id: "atlas",    status: "IDLE", lastSeen: Date.now() },
  luna:     { id: "luna",     status: "IDLE", lastSeen: Date.now() },
  nova:     { id: "nova",     status: "IDLE", lastSeen: Date.now() },
};

export const useAgentStore = create<AgentStore>((set) => ({
  agents: INITIAL_AGENTS,
  updateAgent: (id, status) => {
    // Mapping "Manager" to "alice" if needed, and normalizing to lower
    let normalizedId = id.toLowerCase();
    if (normalizedId === "manager") normalizedId = "alice";

    set((state) => {
      const updatedAgents = { ...state.agents };
      const now = Date.now();

      // If becoming ACTIVE, set all others to IDLE first
      if (status === "ACTIVE") {
        Object.keys(updatedAgents).forEach((agentId) => {
          updatedAgents[agentId] = {
            ...updatedAgents[agentId],
            status: "IDLE",
          };
        });
      }

      updatedAgents[normalizedId] = {
        ...updatedAgents[normalizedId],
        id: normalizedId,
        status,
        lastSeen: now,
      };

      return { agents: updatedAgents };
    });
  },
  tick: () =>
    set((state) => {
      const now = Date.now();
      const updatedAgents = { ...state.agents };
      let changed = false;

      Object.values(updatedAgents).forEach((agent) => {
        if (agent.status === "ACTIVE" && now - agent.lastSeen > 60000) {
          updatedAgents[agent.id] = { ...agent, status: "IDLE" };
          changed = true;
        }
      });

      return changed ? { agents: updatedAgents } : state;
    }),
}));
