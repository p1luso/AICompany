"use client";

import React from "react";
import { useAgentStore } from "@/store/agentStore";
import { AGENT_CONFIG } from "../office/Agent";

export function Sidebar() {
  const { agents } = useAgentStore();
  
  const agentList = Object.values(agents);
  const activeCount = agentList.filter(a => a.status === "ACTIVE").length;

  return (
    <aside 
      className="w-48 bg-[#0f0f1f] flex flex-col border-l-4 border-[#0f3460]"
      style={{ boxShadow: "inset 4px 0 0 #0002" }}
    >
      {/* Header */}
      <div className="p-3 border-b-2 border-[#0f3460] bg-[#1a1a2e]">
        <h2 className="font-pixel text-[8px] text-[#4fc3f7] mb-1">AGENT TRACKER</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[#051122] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#39ff14] transition-all duration-500"
              style={{ width: `${(activeCount / 6) * 100}%` }}
            />
          </div>
          <span className="font-pixel text-[10px] text-[#39ff14] whitespace-nowrap">
            {activeCount}/7 ACTIVE
          </span>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {agentList.map((agent) => {
          const config = AGENT_CONFIG[agent.id as keyof typeof AGENT_CONFIG];
          const isActive = agent.status === "ACTIVE";
          const agentColor = config?.color || "#4fc3f7";
          
          return (
            <div 
              key={agent.id}
              className="p-2 border-2 transition-all duration-300"
              style={{
                borderColor: isActive ? agentColor : "#1a1a2e",
                background: isActive ? `${agentColor}11` : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: "12px" }}>{config?.emoji || "🤖"}</span>
                  <span className="font-pixel text-[7px]" style={{ color: isActive ? agentColor : "#666" }}>
                    {config?.name?.toUpperCase() || agent.id.toUpperCase()}
                  </span>
                </div>
                <div 
                  className="w-1.5 h-1.5"
                  style={{
                    background: isActive ? "#39ff14" : "#ff3131",
                    boxShadow: isActive ? "0 0 6px #39ff14" : "none",
                    borderRadius: "50%"
                  }}
                />
              </div>
              
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between font-pixel text-[5px] text-[#444]">
                  <span>STATUS:</span>
                  <span style={{ color: isActive ? "#39ff14" : "#ff3131" }}>
                    {agent.status}
                  </span>
                </div>
                {isActive && (
                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-full h-0.5 bg-[#051122] overflow-hidden">
                      <div className="h-full bg-[#4fc3f7] animate-pulse" style={{ width: "70%" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Footer */}
      <div className="p-2 bg-[#050510] border-t-2 border-[#0f3460]">
        <div className="flex items-center justify-between font-pixel text-[5px] text-[#333]">
          <span>CPU LOAD</span>
          <span>12%</span>
        </div>
        <div className="w-full h-0.5 bg-[#111] mt-0.5">
          <div className="h-full bg-[#444]" style={{ width: "12%" }} />
        </div>
      </div>
    </aside>
  );
}
