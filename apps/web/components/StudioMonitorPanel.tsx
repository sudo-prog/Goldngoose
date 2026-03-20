"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "error";
  task: string;
  progress: number;
  findings: number;
  lastUpdate: Date;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "agent-1",
    name: "On-Chain Analyst",
    status: "running",
    task: "Scanning whale movements on ETH",
    progress: 67,
    findings: 3,
    lastUpdate: new Date(),
  },
  {
    id: "agent-2",
    name: "Sentiment Scanner",
    status: "running",
    task: "Analyzing Twitter sentiment for BTC",
    progress: 45,
    findings: 5,
    lastUpdate: new Date(),
  },
  {
    id: "agent-3",
    name: "Technical Analyzer",
    status: "completed",
    task: "RSI divergence detection on SOL",
    progress: 100,
    findings: 2,
    lastUpdate: new Date(Date.now() - 60000),
  },
  {
    id: "agent-4",
    name: "DeFi Yield Hunter",
    status: "running",
    task: "Scanning AAVE/Compound rates",
    progress: 23,
    findings: 1,
    lastUpdate: new Date(),
  },
  {
    id: "agent-5",
    name: "Arbitrage Bot",
    status: "idle",
    task: "Waiting for price discrepancies",
    progress: 0,
    findings: 0,
    lastUpdate: new Date(Date.now() - 300000),
  },
];

export function StudioMonitorPanel() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === "running" && agent.progress < 100) {
            const newProgress = Math.min(100, agent.progress + Math.random() * 5);
            return {
              ...agent,
              progress: Math.round(newProgress),
              findings:
                Math.random() > 0.8 ? agent.findings + 1 : agent.findings,
              lastUpdate: new Date(),
              status: newProgress >= 100 ? "completed" : "running",
            };
          }
          return agent;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="space-y-4">
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
      <div className="space-y-2">
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