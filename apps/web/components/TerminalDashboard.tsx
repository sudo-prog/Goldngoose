"use client";

import { useState, useCallback, useMemo } from "react";
import { useBotStore } from "@/lib/stores/botStore";
import { useLayoutStore } from "@/lib/stores/layoutStore";
import { PanelGrid } from "@/components/PanelGrid";

export function TerminalDashboard() {
  const { paperMode, globalKillSwitch, toggleGlobalKillSwitch, bots, emergencyLiquidate } = useBotStore();
  const { addPanel } = useLayoutStore();
  const [commandInput, setCommandInput] = useState("");
  const [commandOutput, setCommandOutput] = useState<string[]>([]);

  const statusText = useMemo(() => {
    const mode = paperMode ? "Paper" : "Live";
    const killSwitch = globalKillSwitch ? " (KILL SWITCH ACTIVE)" : "";
    return `${mode} Trading Mode${killSwitch}`;
  }, [paperMode, globalKillSwitch]);

  const executeCommand = useCallback((cmd: string) => {
    const parts = cmd.trim().toLowerCase().split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    let output = "";

    switch (command) {
      case "add":
        if (args[0] === "panel" && args[1]) {
          const panelType = args[1];
          const validTypes = ["markets", "portfolio", "order-book", "bot-control", "news", "backtester", "chart", "insight-chat", "replay", "studio-monitor"];
          if (validTypes.includes(panelType)) {
            const title = panelType.charAt(0).toUpperCase() + panelType.slice(1).replace("-", " ");
            addPanel(panelType as any, title);
            output = `✅ Added ${panelType} panel`;
          } else {
            output = `❌ Invalid panel type. Valid types: ${validTypes.join(", ")}`;
          }
        } else {
          output = "❌ Usage: add panel <type>";
        }
        break;

      case "list":
        if (args[0] === "bots") {
          if (bots.length === 0) {
            output = "📋 No bots configured";
          } else {
            output = `📋 Bots:\n${bots.map(b => `  - ${b.name} (${b.strategy}) [${b.status}]`).join("\n")}`;
          }
        } else {
          output = "❌ Usage: list bots";
        }
        break;

      case "toggle":
        if (args[0] === "kill" && args[1] === "switch") {
          toggleGlobalKillSwitch();
          output = `🔄 Kill switch toggled: ${!globalKillSwitch ? "ACTIVE" : "INACTIVE"}`;
        } else {
          output = "❌ Usage: toggle kill switch";
        }
        break;

      case "emergency":
        if (args[0] === "liquidate") {
          emergencyLiquidate();
          output = "🚨 Emergency liquidation executed - All positions closed";
        } else {
          output = "❌ Usage: emergency liquidate";
        }
        break;

      case "help":
        output = `📚 Available commands:
  - add panel <type>     Add a panel (markets, portfolio, order-book, bot-control, news, backtester, chart)
  - list bots            List all configured bots
  - toggle kill switch   Toggle the global kill switch
  - emergency liquidate  Emergency liquidate all positions
  - status               Show system status
  - clear                Clear command output
  - help                 Show this help message`;
        break;

      case "status":
        const runningBots = bots.filter(b => b.status === "running").length;
        const totalPnl = bots.reduce((sum, b) => sum + b.pnl, 0);
        output = `📊 System Status:
  - Mode: ${paperMode ? "Paper" : "Live"} Trading
  - Kill Switch: ${globalKillSwitch ? "ACTIVE ❌" : "INACTIVE ✅"}
  - Running Bots: ${runningBots}/${bots.length}
  - Total PnL: $${totalPnl.toFixed(2)}`;
        break;

      case "clear":
        setCommandOutput([]);
        return;

      default:
        output = `❌ Unknown command: ${command}. Type 'help' for available commands.`;
    }

    setCommandOutput(prev => [...prev, `> ${cmd}`, output]);
  }, [bots, globalKillSwitch, paperMode, toggleGlobalKillSwitch, emergencyLiquidate, addPanel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && commandInput.trim()) {
      executeCommand(commandInput);
      setCommandInput("");
    }
  };

  return (
    <div className="min-h-screen bg-polybloom-dark p-4 space-y-4">
      {/* Header */}
      <div className="panel border-b-2 border-polybloom-gold">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-polybloom-white">💹 PolyBloom Terminal</h1>
            <p className="text-polybloom-ice text-sm mt-1 font-display italic">
              Bloomberg-style crypto trading + AI
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="h-9 px-3 rounded-md border border-polybloom-gold/20 bg-transparent text-polybloom-white hover:bg-polybloom-gold/10"
              type="button"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh
            </button>
            <button
              className="h-9 px-3 rounded-md border border-polybloom-gold/20 bg-transparent text-polybloom-white hover:bg-polybloom-gold/10"
              type="button"
              onClick={() => executeCommand("status")}
            >
              ⚙️ Status
            </button>
            <button
              className="h-9 px-3 rounded-md border border-polybloom-red/20 bg-transparent text-polybloom-red hover:bg-polybloom-red/10"
              type="button"
              onClick={() => executeCommand("toggle kill switch")}
            >
              🛑 Kill Switch
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <PanelGrid />

      {/* Bottom - Command Bar */}
      <div className="panel font-mono text-sm border-t border-polybloom-gold/15">
        <p className="text-polybloom-gold mb-2 font-mono text-xs tracking-widest uppercase">💬 Command Bar</p>
        
        {/* Command Output */}
        {commandOutput.length > 0 && (
          <div className="bg-polybloom-navy-mid/50 p-3 rounded mb-3 max-h-40 overflow-y-auto">
            {commandOutput.map((line, i) => (
              <div key={i} className={`${line.startsWith(">") ? "text-polybloom-gold" : "text-polybloom-white-dim"} whitespace-pre-wrap`}>
                {line}
              </div>
            ))}
          </div>
        )}
        
        {/* Command Input */}
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="> Type a command (e.g., 'add panel market-overview', 'list bots', 'help')"
          className="w-full bg-transparent text-polybloom-white outline-none focus:ring-2 focus:ring-polybloom-gold/50 px-2 py-1 rounded"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-polybloom-white-dim text-xs py-4 font-mono">
        <p>
          PolyBloom Terminal v0.2 | {statusText} | Built with
          Next.js+React+Tailwind
        </p>
      </div>
    </div>
  );
}
