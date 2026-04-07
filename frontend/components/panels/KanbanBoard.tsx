"use client";

import React from "react";
import { useTaskStore } from "@/store/taskStore";
import { useAgentStore } from "@/store/agentStore";
import { AGENT_CONFIG } from "../office/Agent";
import { X } from "lucide-react";

interface KanbanBoardProps {
  onClose: () => void;
}

export function KanbanBoard({ onClose }: KanbanBoardProps) {
  const { tasks } = useTaskStore();
  const { agents } = useAgentStore();

  const taskList = Object.values(tasks);
  const agentList = Object.values(agents);

  const columns = [
    { id: "pending", title: "PENDIENTE", color: "#4fc3f7", status: ["pending"] },
    { id: "processing", title: "EN PROGRESO", color: "#ffd700", status: ["processing"] },
    { id: "completed", title: "COMPLETADO", color: "#39ff14", status: ["completed", "failed"] },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl bg-[#c0c0c0] flex flex-col shadow-[8px_8px_0_#000]"
        style={{
          borderTop: "2px solid #dfdfdf",
          borderLeft: "2px solid #dfdfdf",
          borderRight: "4px solid #444",
          borderBottom: "4px solid #444",
        }}
      >
        {/* Win95 Header */}
        <div 
          className="flex items-center justify-between px-2 py-1 m-1"
          style={{ background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)", color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px]">📊 LIVE_KANBAN_TRACKER.EXE</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] text-black flex items-center justify-center border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 active:border-t-2 active:border-l-2 active:border-gray-800"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-3 gap-2 p-3 min-h-[400px]">
          {columns.map(col => {
            const colTasks = taskList.filter(t => col.status.includes(t.status));
            
            return (
              <div 
                key={col.id}
                className="flex flex-col bg-[#eee]"
                style={{
                  borderTop: "2px solid #444",
                  borderLeft: "2px solid #444",
                  borderRight: "2px solid #dfdfdf",
                  borderBottom: "2px solid #dfdfdf",
                }}
              >
                <div 
                  className="p-1 text-center font-pixel text-[8px] text-white"
                  style={{ background: col.color }}
                >
                  {col.title} ({colTasks.length})
                </div>

                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-gray-400 font-pixel text-[6px] text-center mt-10 italic">
                      No hay tareas
                    </div>
                  ) : (
                    colTasks.map(task => {
                      // Get assigned agent config if any
                      const assignedId = task.assignedAgent ? task.assignedAgent.toLowerCase() : null;
                      const agentConfig = assignedId ? AGENT_CONFIG[assignedId as keyof typeof AGENT_CONFIG] : null;

                      return (
                        <div 
                          key={task.id}
                          className="p-2 bg-white border-2 border-[#888] shadow-[2px_2px_0_#ccc] flex flex-col gap-2 transition-all hover:translate-y-[-1px]"
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-pixel text-[7px] text-black uppercase font-bold leading-tight flex-1 pr-2">
                              {task.request?.title || "Sin Título (Tarea en carga...)"}
                            </div>
                            {task.request?.priority === "high" && (
                              <div className="px-1 bg-red-500 text-white font-pixel text-[4px] animate-pulse">HIGH</div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 py-1 border-t border-gray-100">
                            {agentConfig ? (
                              <>
                                <div 
                                  className="w-5 h-5 flex items-center justify-center border border-gray-300 bg-gray-50 rounded-sm"
                                  style={{ fontSize: "12px" }}
                                >
                                  {agentConfig.emoji}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-pixel text-[5px] text-gray-400">ASSIGNED TO:</span>
                                  <span className="font-pixel text-[6px]" style={{ color: agentConfig.color }}>
                                    {agentConfig.name}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-5 h-5 flex items-center justify-center border border-dashed border-gray-300 bg-gray-50 rounded-sm text-[8px] text-gray-300">
                                  ?
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-pixel text-[5px] text-gray-400">ASSIGNED TO:</span>
                                  <span className="font-pixel text-[6px] text-gray-400 italic">WAITING...</span>
                                </div>
                              </>
                            )}
                          </div>

                          {col.id === "processing" && (
                            <div className="w-full h-1 bg-gray-100 overflow-hidden">
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

                          {/* Issues List */}
                          {task.issues && task.issues.length > 0 && (
                            <div className="mt-1 space-y-1 border-t border-gray-100 pt-2">
                              <div className="font-pixel text-[5px] text-gray-500 mb-1 uppercase">Backlog de Issues:</div>
                              {task.issues.map(issue => {
                                const issueAgentId = issue.assignedAgent?.toLowerCase();
                                const issueAgentConfig = issueAgentId ? AGENT_CONFIG[issueAgentId as keyof typeof AGENT_CONFIG] : null;

                                return (
                                  <div key={issue.id} className="flex items-center gap-1.5 font-pixel text-[6px]">
                                    <div className="flex items-center gap-0.5 min-w-[24px]">
                                      {issue.status === "completed" ? (
                                        <span className="text-green-500 text-[8px]">☑</span>
                                      ) : issue.status === "processing" ? (
                                        <span className="text-blue-500 animate-pulse text-[8px]">▶</span>
                                      ) : (
                                        <span className="text-gray-300 text-[8px]">☐</span>
                                      )}
                                      {issueAgentConfig && (
                                        <span title={issueAgentConfig.name} style={{ fontSize: "8px" }}>
                                          {issueAgentConfig.emoji}
                                        </span>
                                      )}
                                    </div>
                                    <span className={`${issue.status === "completed" ? "line-through text-gray-400" : "text-gray-700"} truncate`}>
                                      {issue.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-1">
                            <div className="font-mono text-[4px] text-gray-400">
                              REF: {task.id.slice(0, 8)}
                            </div>
                            <div className="font-pixel text-[4px] text-gray-500">
                              {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className="bg-[#c0c0c0] border-t-2 border-white px-2 py-1 font-pixel text-[6px] text-gray-700">
          Sync status: RECEPTIVE
        </div>
      </div>
    </div>
  );
}
