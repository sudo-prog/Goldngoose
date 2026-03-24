"use client";

import { useState, useEffect } from "react";
import { useRAGGodWS } from "@/hooks/useRAGGodWS";
import { healthCheck } from "@/lib/api/ragGod";

interface Agent {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "error";
  task: string;
  progress: number;
  findings: number;
  lastUpdate: Date;
}

interface RAGGodNode {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

const RAG_GOD_NODES: RAGGodNode[] = [
  {
    id: "whale_ingestor",
    name: "🐋 Whale Ingestor",
    description: "Mode 0: Meta-researcher + Whale ingestion",
    active: false,
  },
  {
    id: "retrieval",
    name: "🔍 Retrieval",
    description: "Mode 1: Full retrieval + Mem0 context",
    active: false,
  },
  {
    id: "executor",
    name: "⚡ Executor",
    description: "Mode 2: Live execution with risk guard",
    active: false,
  },
  {
    id: "evolver",
    name: "🧬 Evolver",
    description: "Mode 3: Self-evolution + Auto-Evolution Lab",
    active: false,
  },
  {
    id: "paper_mirror",
    name: "🪞 Paper Mirror",
    description: "Parallel paper-only execution",
    active: false,
  },
];

export function StudioMonitorPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [ragGodNodes, setRagGodNodes] = useState<RAGGodNode[]>(RAG_GOD_NODES);
  const [swarmHealth, setSwarmHealth] = useState<Record<string, boolean>>({});

  // RAG_GOD WebSocket integration
  const { state: ragGodState, connected: wsConnected } = useRAGGodWS();

  // Fetch health status on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await healthCheck();
        if (health.components) {
          setSwarmHealth(health.components);
          setRagGodNodes((prev) =>
            prev.map((node) => ({
              ...node,
              active: health.components?.[node.id] ?? false,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch health:", error);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update agents based on RAG_GOD mode
  useEffect(() => {
    if (ragGodState) {
      const mode = ragGodState.mode;
      const modeAgents: Agent[] = [
        {
          id: "rag-god-swarm",
          name: `RAG_GOD Mode ${mode}`,
          status: wsConnected ? "running" : "idle",
          task: ragGodState.mode_description || "Processing...",
          progress: wsConnected ? 75 : 0,
          findings: Math.floor(ragGodState.paper_pnl * 100),
          lastUpdate: new Date(ragGodState.timestamp),
        },
      ];
      setAgents(modeAgents);

      // Update node activity based on mode
      setRagGodNodes((prev) =>
        prev.map((node) => {
          if (node.id === "paper_mirror") {
            return { ...node, active: true }; // Paper mirror always active
          }
          if (mode === 0 && node.id === "whale_ingestor") {
            return { ...node, active: true };
          }
          if (mode === 1 && node.id === "retrieval") {
            return { ...node, active: true };
          }
          if (mode === 2 && node.id === "executor") {
            return { ...node, active: true };
          }
          if (mode === 3 && node.id === "evolver") {
            return { ...node, active: true };
          }
          return { ...node, active: swarmHealth[node.id] ?? false };
        })
      );
    }
  }, [ragGodState, wsConnected, swarmHealth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-yellow-400";
      case "completed":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return "🔄";
      case "completed":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏸️";
    }
  };

  const totalFindings = agents.reduce((sum, a) => sum + a.findings, 0);
  const activeAgents = agents.filter((a) => a.status === "running").length;
  const activeNodes = ragGodNodes.filter((n) => n.active).length;

  return (
    <div className="space-y-4">
      {/* RAG_GOD Swarm Status */}
      <div className="bg-slate-800/50 p-3 rounded border border-polybloom-neon/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-polybloom-neon">
            🧠 RAG_GOD Swarm
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              wsConnected
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {wsConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-slate-400">Mode</p>
            <p className="text-lg font-bold text-polybloom-neon">
              {ragGodState?.mode ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Paper PnL</p>
            <p
              className={`text-lg font-bold ${
                (ragGodState?.paper_pnl ?? 0) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              ${(ragGodState?.paper_pnl ?? 0).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Active Nodes</p>
            <p className="text-lg font-bold text-yellow-400">{activeNodes}</p>
          </div>
        </div>
      </div>

      {/* RAG_GOD Nodes */}
      <div>
        <p className="text-xs text-slate-400 mb-2">LangGraph Nodes</p>
        <div className="space-y-1">
          {ragGodNodes.map((node) => (
            <div
              key={node.id}
              className={`flex items-center justify-between p-2 rounded text-xs ${
                node.active
                  ? "bg-polybloom-neon/10 border border-polybloom-neon/30"
                  : "bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{node.name}</span>
              </div>
              <span
                className={
                  node.active ? "text-green-400" : "text-slate-500"
                }
              >
                {node.active ? "ACTIVE" : "IDLE"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Whale Alert */}
      {ragGodState?.whale_alert && ragGodState.whale_alert !== "No whale activity detected" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 rounded">
          <p className="text-xs text-yellow-400">🐋 Whale Alert</p>
          <p className="text-xs text-white mt-1">{ragGodState.whale_alert}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/50 p-2 rounded text-center">
          <p className="text-xs text-slate-400">Active</p>
          <p className="text-lg font-bold text-yellow-400">{activeAgents}</p>
        </div>
        <div className="bg-slate-800/50 p-2 rounded text-center">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-lg font-bold text-green-400">
            {agents.filter((a) => a.status === "completed").length}
          </p>
        </div>
        <div className="bg-slate-800/50 p-2 rounded text-center">
          <p className="text-xs text-slate-400">Findings</p>
          <p className="text-lg font-bold text-polybloom-neon">{totalFindings}</p>
        </div>
      </div>

      {/* Agent List */}
      {agents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Active Tasks</p>
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() =>
                setSelectedAgent(selectedAgent === agent.id ? null : agent.id)
              }
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedAgent === agent.id
                  ? "bg-polybloom-neon/20 border border-polybloom-neon/50"
                  : "bg-slate-800/30 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(agent.status)}</span>
                  <span className="text-sm font-medium text-white">
                    {agent.name}
                  </span>
                </div>
                <span className={`text-xs ${getStatusColor(agent.status)}`}>
                  {agent.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-2">{agent.task}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    agent.status === "completed"
                      ? "bg-green-400"
                      : agent.status === "error"
                        ? "bg-red-400"
                        : "bg-polybloom-neon"
                  }`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>{agent.progress}% complete</span>
                <span>{agent.findings} findings</span>
              </div>

              {/* Expanded Details */}
              {selectedAgent === agent.id && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400">
                    <p>
                      Last update: {agent.lastUpdate.toLocaleTimeString()}
                    </p>
                    <p className="mt-2">
                      Agent ID: <code className="text-polybloom-neon">{agent.id}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setAgents((prev) =>
              prev.map((a) =>
                a.status === "idle"
                  ? { ...a, status: "running" as const, progress: 0 }
                  : a
              )
            );
          }}
          className="flex-1 px-3 py-2 bg-polybloom-neon/20 text-polybloom-neon text-sm rounded hover:bg-polybloom-neon/30"
        >
          🚀 Start All Idle
        </button>
        <button
          onClick={() => {
            setAgents((prev) =>
              prev.map((a) =>
                a.status === "running"
                  ? { ...a, status: "idle" as const }
                  : a
              )
            );
          }}
          className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded hover:bg-slate-600"
        >
          ⏹️ Stop All
        </button>
      </div>
    </div>
  );
}
