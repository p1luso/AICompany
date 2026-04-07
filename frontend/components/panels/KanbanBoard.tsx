"use client";

import React from "react";
import { useTaskStore } from "@/store/taskStore";
import { StoredTask, AgentEvent, TaskRequest, SubTask } from "@/types";
import { useAgentStore } from "@/store/agentStore";
import { AGENT_CONFIG } from "../office/Agent";
import { X } from "lucide-react";

interface KanbanBoardProps {
  onClose: () => void;
}

/**
 * Unified interface for items on the board (Main Tasks or Subtasks)
 * to ensure TypeScript compatibility during production build.
 */
interface WorkItem {
  id: string;
  displayTitle: string;
  status: StoredTask["status"];
  createdAt: number;
  assignedAgent: string | null;
  parentContext: string | null;
  priority?: string;
  isEpic: boolean;
  issueId?: string;
}

export function KanbanBoard({ onClose }: KanbanBoardProps) {
  const { tasks } = useTaskStore();
  
  const taskList = Object.values(tasks);

  const columns = [
    { id: "pending", title: "PENDIENTE", color: "#4fc3f7", status: ["pending"] },
    { id: "processing", title: "EN PROGRESO", color: "#ffd700", status: ["processing"] },
    { id: "completed", title: "COMPLETADO", color: "#39ff14", status: ["completed", "failed"] },
  ];

  // Flatten tasks and issues into individual actionable items
  const allWorkItems: WorkItem[] = taskList.flatMap((task): WorkItem[] => {
    // If it's a simple task with no issues, show it as is
    if (!task.issues || task.issues.length === 0) {
      return [{
        id: task.id,
        displayTitle: task.request?.title || "Sin Título",
        status: task.status,
        createdAt: task.createdAt,
        assignedAgent: task.assignedAgent || null,
        parentContext: null,
        priority: task.request?.priority,
        isEpic: false,
        issueId: undefined
      } as WorkItem];
    }

    // It's an Epic. We show the individual issues as main cards.
    return task.issues.map((issue): WorkItem => ({
      id: `${task.id}-${issue.id}`,
      displayTitle: issue.title,
      status: issue.status,
      createdAt: task.createdAt,
      assignedAgent: issue.assignedAgent || null,
      parentContext: task.request?.title || "Proyecto",
      priority: task.request?.priority,
      isEpic: true,
      issueId: issue.id
    }));
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-5xl bg-[#c0c0c0] flex flex-col shadow-[8px_8px_0_#000] max-h-[90vh]"
        style={{
          borderTop: "2px solid #dfdfdf",
          borderLeft: "2px solid #dfdfdf",
          borderRight: "4px solid #444",
          borderBottom: "4px solid #444",
        }}
      >
        {/* Win95 Header */}
        <div 
          className="flex items-center justify-between px-2 py-1 m-1 shrink-0"
          style={{ background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)", color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px]">📊 SCRUM_MASTER_BOARD.EXE</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] text-black flex items-center justify-center border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 active:border-t-2 active:border-l-2 active:border-gray-800"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-3 gap-2 p-3 overflow-hidden">
          {columns.map(col => {
            const colItems = allWorkItems.filter(item => col.status.includes(item.status));
            
            return (
              <div 
                key={col.id}
                className="flex flex-col bg-[#eee] overflow-hidden"
                style={{
                  borderTop: "2px solid #444",
                  borderLeft: "2px solid #444",
                  borderRight: "2px solid #dfdfdf",
                  borderBottom: "2px solid #dfdfdf",
                }}
              >
                <div 
                  className="p-1 text-center font-pixel text-[8px] text-white shrink-0"
                  style={{ background: col.color }}
                >
                  {col.title} ({colItems.length})
                </div>

                <div className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar">
                  {colItems.length === 0 ? (
                    <div className="text-gray-400 font-pixel text-[6px] text-center mt-10 italic opacity-50">
                      NO ITEMS
                    </div>
                  ) : (
                    colItems.map(item => {
                      const assignedId = item.assignedAgent ? item.assignedAgent.toLowerCase() : null;
                      const agentConfig = assignedId ? AGENT_CONFIG[assignedId as keyof typeof AGENT_CONFIG] : null;

                      return (
                        <div 
                          key={item.id}
                          className="p-2 bg-white border-2 border-[#888] shadow-[2px_2px_0_#ccc] flex flex-col gap-1 transition-all hover:translate-y-[-1px] relative group"
                        >
                          {/* Parent Context Tag */}
                          {item.parentContext && (
                            <div className="font-pixel text-[4px] text-gray-400 uppercase tracking-tighter truncate max-w-[90%]">
                              EPIC: {item.parentContext}
                            </div>
                          )}

                          <div className="flex justify-between items-start">
                            <div className="font-pixel text-[7px] text-black uppercase font-bold leading-tight flex-1 pr-1 break-words">
                              {item.displayTitle}
                            </div>
                            {item.priority === "high" && (
                              <div className="px-0.5 bg-red-500 text-white font-pixel text-[4px] animate-pulse">HIGH</div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 py-1 border-t border-gray-50 bg-gray-50/50 rounded px-1">
                            {agentConfig ? (
                              <>
                                <div 
                                  className="w-4 h-4 flex items-center justify-center border border-gray-300 bg-white rounded-sm shadow-sm"
                                  style={{ fontSize: "10px" }}
                                >
                                  {agentConfig.emoji}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-pixel text-[5px]" style={{ color: agentConfig.color }}>
                                    {agentConfig.name}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 flex items-center justify-center border border-dashed border-gray-300 bg-white rounded-sm text-[6px] text-gray-300">
                                  ?
                                </div>
                                <span className="font-pixel text-[5px] text-gray-400 italic">WAITING...</span>
                              </>
                            )}
                          </div>

                          {col.id === "processing" && (
                            <div className="w-full h-1 bg-gray-100 overflow-hidden mt-1 rounded-full">
                              <div 
                                className="h-full bg-blue-500 animate-progress-stripes" 
                                style={{ 
                                  width: "100%",
                                  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)",
                                  backgroundSize: "8px 8px"
                                }} 
                              />
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-1 pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="font-mono text-[4px] text-gray-400">
                              REF_{item.id.split('-').pop()?.slice(0, 4)}
                            </div>
                            <div className="font-pixel text-[4px] text-gray-500">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Bar */}
        <div className="bg-[#c0c0c0] border-t-2 border-white px-2 py-1 font-pixel text-[6px] text-gray-700 flex justify-between shrink-0">
          <span>AGILE_SYSTEM_NOMINAL // TOTAL_WORKLOAD: {allWorkItems.length} ITEMS</span>
          <span className="animate-pulse">● LIVE_TRACKING</span>
        </div>
      </div>
    </div>
  );
}
