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
  alice: { id: "alice", status: "IDLE", lastSeen: Date.now() },
  scribe: { id: "scribe", status: "IDLE", lastSeen: Date.now() },
  sentinel: { id: "sentinel", status: "IDLE", lastSeen: Date.now() },
};

export const useAgentStore = create<AgentStore>((set) => ({
  agents: INITIAL_AGENTS,
  updateAgent: (id, status) => {
    // Mapping "Manager" to "alice" if needed, and normalizing to lower
    let normalizedId = id.toLowerCase();
    if (normalizedId === "manager") normalizedId = "alice";

    set((state) => ({
      agents: {
        ...state.agents,
        [normalizedId]: {
          ...state.agents[normalizedId],
          id: normalizedId,
          status,
          lastSeen: Date.now(),
        },
      },
    }));
  },
  tick: () =>
    set((state) => {
      const now = Date.now();
      const updatedAgents = { ...state.agents };
      let changed = false;

      Object.values(updatedAgents).forEach((agent) => {
        if (agent.status === "ACTIVE" && now - agent.lastSeen > 15000) {
          updatedAgents[agent.id] = { ...agent, status: "IDLE" };
          changed = true;
        }
      });

      return changed ? { agents: updatedAgents } : state;
    }),
}));
