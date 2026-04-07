"use client";

import React from "react";
import { useAgentStore } from "@/store/agentStore";
import { useTaskStore } from "@/store/taskStore";
import { AGENT_CONFIG } from "../office/Agent";
import { X } from "lucide-react";

interface DeskModalProps {
  agentId: string;
  onClose: () => void;
}

export function DeskModal({ agentId, onClose }: DeskModalProps) {
  const agentsStatus = useAgentStore((s) => s.agents);
  const { tasks, events } = useTaskStore();

  const agent = agentsStatus[agentId];
  const config = AGENT_CONFIG[agentId as keyof typeof AGENT_CONFIG];
  if (!config) return null;

  const isActive = agent?.status === "ACTIVE";

  // Find the latest task assigned to this agent
  const allTasks = Object.values(tasks);
  const inboxTask = allTasks.find(
    (t) =>
      t.assignedAgent === agentId ||
      t.issues?.some(
        (i) => i.assignedAgent?.toLowerCase() === agentId && i.status === "processing"
      )
  );

  // Find the active issue for this agent
  const activeIssue = inboxTask?.issues?.find(
    (i) => i.assignedAgent?.toLowerCase() === agentId && i.status === "processing"
  );

  // Find the last completed issue by this agent (outbox)
  const completedIssue = allTasks
    .flatMap((t) => (t.issues || []).map((i) => ({ ...i, taskTitle: t.request?.title })))
    .filter((i) => i.assignedAgent?.toLowerCase() === agentId && i.status === "completed")
    .pop();

  // Last 5 events from this agent
  const agentEvents = events
    .filter((e) => e.agent.toLowerCase() === agentId)
    .slice(-5)
    .reverse();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-[#c0c0c0] flex flex-col shadow-[6px_6px_0_#000]"
        style={{
          borderTop: "2px solid #dfdfdf",
          borderLeft: "2px solid #dfdfdf",
          borderRight: "3px solid #444",
          borderBottom: "3px solid #444",
        }}
      >
        {/* Win95 Header */}
        <div
          className="flex items-center justify-between px-2 py-1 m-1"
          style={{ background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}88 100%)`, color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "14px" }}>{config.emoji}</span>
            <span className="font-pixel text-[9px]">{config.name.toUpperCase()}_DESK.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] text-black flex items-center justify-center border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800"
          >
            <X size={12} />
          </button>
        </div>

        <div className="p-3 space-y-3">
          {/* Agent Status */}
          <div className="flex items-center gap-3 p-2 bg-white border-2 border-[#888]">
            <div
              className="w-10 h-10 flex items-center justify-center border-2"
              style={{ borderColor: config.color, background: `${config.color}15`, fontSize: "24px" }}
            >
              {config.emoji}
            </div>
            <div className="flex-1">
              <div className="font-pixel text-[9px] text-black font-bold">{config.name}</div>
              <div className="font-pixel text-[6px] text-gray-500">{config.label}</div>
              <div className="flex items-center gap-1 mt-1">
                <div
                  className="w-2 h-2"
                  style={{
                    background: isActive ? "#39ff14" : "#888",
                    boxShadow: isActive ? "0 0 6px #39ff14" : "none",
                  }}
                />
                <span
                  className="font-pixel text-[7px]"
                  style={{ color: isActive ? "#39ff14" : "#888" }}
                >
                  {isActive ? "WORKING" : "IDLE"}
                </span>
              </div>
            </div>
          </div>

          {/* Inbox — Current Task */}
          <div className="p-2 bg-[#eee] border-t-2 border-l-2 border-[#444] border-b-2 border-r-2 border-[#dfdfdf]">
            <div className="font-pixel text-[6px] text-gray-500 mb-1 flex items-center gap-1">
              <span>📥</span> BANDEJA DE ENTRADA
            </div>
            {activeIssue ? (
              <div className="p-1.5 bg-white border border-[#888]">
                <div className="font-pixel text-[7px] text-black font-bold">{activeIssue.title}</div>
                <div className="font-pixel text-[5px] text-blue-600 mt-1 animate-pulse">EN PROGRESO...</div>
              </div>
            ) : inboxTask ? (
              <div className="p-1.5 bg-white border border-[#888]">
                <div className="font-pixel text-[7px] text-black font-bold">{inboxTask.request?.title}</div>
                <div className="font-pixel text-[5px] text-gray-400 mt-1">ASIGNADA</div>
              </div>
            ) : (
              <div className="font-pixel text-[6px] text-gray-400 italic text-center py-2">
                Bandeja vacia
              </div>
            )}
          </div>

          {/* Outbox — Last Completed */}
          <div className="p-2 bg-[#eee] border-t-2 border-l-2 border-[#444] border-b-2 border-r-2 border-[#dfdfdf]">
            <div className="font-pixel text-[6px] text-gray-500 mb-1 flex items-center gap-1">
              <span>📤</span> BANDEJA DE SALIDA
            </div>
            {completedIssue ? (
              <div className="p-1.5 bg-white border border-[#888]">
                <div className="font-pixel text-[7px] text-black font-bold">{completedIssue.title}</div>
                {completedIssue.taskTitle && (
                  <div className="font-pixel text-[4px] text-gray-400 mt-0.5">Proyecto: {completedIssue.taskTitle}</div>
                )}
                <div className="font-pixel text-[5px] text-green-600 mt-1 flex items-center gap-1">
                  <span>✅</span> COMPLETADO
                </div>
              </div>
            ) : (
              <div className="font-pixel text-[6px] text-gray-400 italic text-center py-2">
                Sin artefactos recientes
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="p-2 bg-[#eee] border-t-2 border-l-2 border-[#444] border-b-2 border-r-2 border-[#dfdfdf]">
            <div className="font-pixel text-[6px] text-gray-500 mb-1 flex items-center gap-1">
              <span>📋</span> ACTIVIDAD RECIENTE
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {agentEvents.length > 0 ? (
                agentEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-1 p-1 bg-white border border-gray-200">
                    <span className="font-pixel text-[5px] text-gray-400 shrink-0 mt-0.5">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                    </span>
                    <span className="font-pixel text-[5px] text-gray-700 leading-tight">
                      {ev.message?.slice(0, 80)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="font-pixel text-[6px] text-gray-400 italic text-center py-2">
                  Sin actividad registrada
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#c0c0c0] border-t-2 border-white px-2 py-1 font-pixel text-[5px] text-gray-600 flex justify-between">
          <span>Agent ID: {agentId}</span>
          <span>{isActive ? "STATUS: BUSY" : "STATUS: AVAILABLE"}</span>
        </div>
      </div>
    </div>
  );
}
