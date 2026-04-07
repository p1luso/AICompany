/**
 * Zustand Store for managing handoff animations between agents.
 *
 * A "handoff" is when one agent finishes and walks to the next agent's desk
 * to deliver the work, then the next agent starts working.
 */
import { create } from "zustand";

export interface HandoffEvent {
  /** The agent delivering the work */
  fromAgent: string;
  /** The agent receiving the work */
  toAgent: string;
  /** Timestamp when the handoff was triggered */
  timestamp: number;
  /** Phase: "walking_to_target" | "delivering" | "done" */
  phase: "walking_to_target" | "delivering" | "done";
}

interface HandoffStore {
  /** Currently active handoff (only one at a time) */
  activeHandoff: HandoffEvent | null;
  /** Queue of pending handoffs */
  queue: HandoffEvent[];
  /** Trigger a new handoff */
  triggerHandoff: (from: string, to: string) => void;
  /** Move handoff to delivering phase */
  setDelivering: () => void;
  /** Complete the current handoff */
  completeHandoff: () => void;
  /** Special: Alice picks up from CEO desk */
  pickupFromCeo: boolean;
  triggerCeoPickup: () => void;
  completeCeoPickup: () => void;
}

export const useHandoffStore = create<HandoffStore>((set, get) => ({
  activeHandoff: null,
  queue: [],
  pickupFromCeo: false,

  triggerHandoff: (from, to) => {
    const event: HandoffEvent = {
      fromAgent: from,
      toAgent: to,
      timestamp: Date.now(),
      phase: "walking_to_target",
    };

    const current = get().activeHandoff;
    if (current && current.phase !== "done") {
      // Queue it
      set((s) => ({ queue: [...s.queue, event] }));
    } else {
      set({ activeHandoff: event });
    }
  },

  setDelivering: () => {
    set((s) => {
      if (!s.activeHandoff) return s;
      return { activeHandoff: { ...s.activeHandoff, phase: "delivering" } };
    });
  },

  completeHandoff: () => {
    set((s) => {
      const next = s.queue[0] || null;
      return {
        activeHandoff: next,
        queue: s.queue.slice(1),
      };
    });
  },

  triggerCeoPickup: () => set({ pickupFromCeo: true }),
  completeCeoPickup: () => set({ pickupFromCeo: false }),
}));
