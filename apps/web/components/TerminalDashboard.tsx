"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useBotStore } from "@/lib/stores/botStore";
import { useLayoutStore } from "@/lib/stores/layoutStore";
import { useMarketsStore } from "@/lib/stores/marketsStore";
import { PanelGrid } from "@/components/PanelGrid";
import { useRAGGodWS } from "@/hooks/useRAGGodWS";
import { getStatus, switchMode } from "@/lib/api/ragGod";

export function TerminalDashboard() {
  const { paperMode, globalKillSwitch, toggleGlobalKillSwitch, bots, emergencyLiquidate } = useBotStore();
  const { addPanel } = useLayoutStore();
  const [commandInput, setCommandInput] = useState("");
  const [commandOutput, setCommandOutput] = useState<string[]>([]);

  // RAG_GOD WebSocket integration
  const { state: ragGodState, connected: wsConnected } = useRAGGodWS();
  const [ragGodMode, setRagGodMode] = useState(0);

  const statusText = useMemo(() => {
    const mode = paperMode ? "Paper" : "Live";
    const killSwitch = globalKillSwitch ? " (KILL SWITCH ACTIVE)" : "";
    const ragGodStatus = wsConnected ? ` | RAG_GOD: Mode ${ragGodMode}` : " | RAG_GOD: Disconnected";
    return `${mode} Trading Mode${killSwitch}${ragGodStatus}`;
  }, [paperMode, globalKillSwitch, wsConnected, ragGodMode]);

  // Update RAG_GOD mode from WebSocket state
  useEffect(() => {
    if (ragGodState) {
      setRagGodMode(ragGodState.mode);
    }
  }, [ragGodState]);

  const { fetchTopMarkets } = useMarketsStore();

  // Fetch initial RAG_GOD status
  useEffect(() => {
    const fetchRAGGodStatus = async () => {
      try {
        const status = await getStatus();
        setRagGodMode(status.mode);
      } catch (error) {
        console.error("Failed to fetch RAG_GOD status:", error);
      }
    };
    fetchRAGGodStatus();
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    const parts = cmd.trim().toLowerCase().split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    let output = "";

    switch (command) {
      case "help":
        output = `📚 Available commands:
  - help                 Show this help message
  - r / refresh          Refresh all data
  - clear                Clear command output
  - btc / eth / sol      Select that coin
  - polymarket           Scroll to Polymarket panel
  - bots / list bots     Scroll to Claw Control panel
  - kill                 Activate kill switch
  - backtest             Trigger new backtest
  - status               Show system status`;
        break;
      case "refresh":
      case "r":
        fetchTopMarkets();
        output = "🔄 Refreshing market data...";
        break;
      case "clear":
        setCommandOutput([]);
        return;
      case "btc":
      case "eth":
      case "sol":
      case "bnb":
      case "xrp":
        output = `📊 Selected ${command.toUpperCase()} — use Market Overview panel to view`;
        break;
      case "polymarket":
        output = "🎰 Scrolling to Polymarket panel...";
        break;
      case "bots":
      case "list":
        if (args[0] === "bots" || command === "bots") {
          output = "🤖 Scrolling to Claw Control panel...";
        } else {
          output = "❌ Usage: list bots";
        }
        break;
      case "kill":
        toggleGlobalKillSwitch();
        output = `🛑 Kill switch ${!globalKillSwitch ? "ACTIVATED" : "DEACTIVATED"}`;
        break;
      case "backtest":
        output = "⏮️ Triggering new backtest...";
        break;

      case "rag-god":
      case "rg":
        if (args[0] === "mode" && args[1]) {
          const newMode = parseInt(args[1]);
          if (newMode >= 0 && newMode <= 3) {
            try {
              const result = await switchMode(newMode);
              setRagGodMode(newMode);
              output = `🧠 RAG_GOD mode switched to ${newMode}: ${result.description}`;
            } catch (error) {
              output = `❌ Failed to switch RAG_GOD mode: ${error}`;
            }
          } else {
            output = "❌ RAG_GOD mode must be 0-3";
          }
        } else if (args[0] === "status") {
          output = `🧠 RAG_GOD Status:
  - Mode: ${ragGodMode} ${ragGodState?.mode_description ?? ""}
  - Paper PnL: $${(ragGodState?.paper_pnl ?? 0).toFixed(4)}
  - Whale Alert: ${ragGodState?.whale_alert ?? "None"}
  - WebSocket: ${wsConnected ? "Connected ✅" : "Disconnected ❌"}`;
        } else {
          output = `🧠 RAG_GOD Commands:
  - rag-god mode <0-3>  Switch RAG_GOD mode
  - rag-god status       Show RAG_GOD status
  - rg mode <0-3>        Short form`;
        }
        break;
      case "add":
        if (args[0] === "panel" && args[1]) {
          const panelType = args[1];
          const validTypes = ["markets", "portfolio", "order-book", "bot-control", "news", "backtester", "chart", "insight-chat", "replay", "studio-monitor", "polymarket", "polymarket-trading", "polymarket-portfolio"];
          if (validTypes.includes(panelType)) {
            const titleMap: Record<string, string> = {
              "markets": "Markets",
              "portfolio": "Portfolio",
              "order-book": "Order Book",
              "bot-control": "Bot Control",
              "news": "News Radar",
              "backtester": "Backtester",
              "chart": "Chart",
              "insight-chat": "Insight Chat",
              "replay": "Replay",
              "studio-monitor": "Studio Monitor",
              "polymarket": "Polymarket Order Book",
              "polymarket-trading": "Polymarket Trading",
              "polymarket-portfolio": "Polymarket Portfolio",
            };
            const title = titleMap[panelType] || panelType;
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

      case "status":
        const runningBots = bots.filter(b => b.status === "running").length;
        const totalPnl = bots.reduce((sum, b) => sum + b.pnl, 0);
        const ragGodPnl = ragGodState?.paper_pnl ?? 0;
        output = `📊 System Status:
  - Mode: ${paperMode ? "Paper" : "Live"} Trading
  - Kill Switch: ${globalKillSwitch ? "ACTIVE ❌" : "INACTIVE ✅"}
  - Running Bots: ${runningBots}/${bots.length}
  - Total PnL: $${totalPnl.toFixed(2)}
  - RAG_GOD Mode: ${ragGodMode} ${ragGodState?.mode_description ?? ""}
  - RAG_GOD Paper PnL: $${ragGodPnl.toFixed(4)}
  - WebSocket: ${wsConnected ? "Connected ✅" : "Disconnected ❌"}`;
        break;

      default:
        output = `❌ Unknown command: ${command}. Type 'help' for available commands.`;
    }

    setCommandOutput(prev => [...prev, `> ${cmd}`, output]);
  }, [bots, globalKillSwitch, paperMode, toggleGlobalKillSwitch, emergencyLiquidate, addPanel, fetchTopMarkets]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && commandInput.trim()) {
      executeCommand(commandInput);
      setCommandInput("");
    }
  };

  const buttonStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.125rem',
    transition: 'all 0.2s',
  };

  return (
    <div className="min-h-screen p-4 space-y-4 bg-polybloom-dark">
      {/* Header */}
      <div className="p-4 bg-polybloom-navy-mid" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div>
            <a
              href="/"
              className="font-mono text-polybloom-white-dim"
              style={{
                fontSize: '0.75rem',
                display: 'inline-block',
                marginBottom: '0.5rem',
              }}
            >
              ← Home
            </a>
            <h1
              className="font-display neon-glow"
              style={{
                fontStyle: 'italic',
                fontSize: '2rem',
                fontWeight: 400,
              }}
            >
              PolyBloom Terminal
            </h1>
            <p
              className="font-body text-polybloom-white"
              style={{
                fontSize: '0.875rem',
                marginTop: '0.25rem',
              }}
            >
              Bloomberg-style crypto trading + AI
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="text-polybloom-white"
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-primary)',
              }}
              type="button"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh
            </button>
            <button
              className="text-polybloom-white"
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-primary)',
              }}
              type="button"
              onClick={() => executeCommand("status")}
            >
              ⚙️ Status
            </button>
            <button
              className={globalKillSwitch ? "text-polybloom-white" : "text-polybloom-red"}
              style={{
                ...buttonStyle,
                backgroundColor: globalKillSwitch ? 'var(--polybloom-red)' : 'transparent',
                border: `1px solid ${globalKillSwitch ? 'var(--polybloom-red)' : 'var(--border-primary)'}`,
              }}
              type="button"
              onClick={() => executeCommand("kill")}
            >
              🛑 Kill Switch
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <PanelGrid />

      {/* Bottom - Command Bar */}
      <div className="p-4 bg-polybloom-navy-mid" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <p
          className="font-mono text-polybloom-gold"
          style={{
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}
        >
          💬 Command Bar
        </p>

        {/* Command Output */}
        {commandOutput.length > 0 && (
          <div
            className="p-3 mb-3 max-h-40 overflow-y-auto bg-polybloom-dark"
            style={{ borderRadius: '0.125rem' }}
          >
            {commandOutput.map((line, i) => (
              <div
                key={i}
                className={`font-mono text-sm ${line.startsWith(">") ? "text-polybloom-gold" : "text-polybloom-white"}`}
                style={{
                  whiteSpace: 'pre-wrap',
                }}
              >
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
          placeholder="> Type a command (e.g., 'add panel markets', 'list bots', 'help')"
          className="w-full outline-none px-2 py-1 font-mono text-sm text-polybloom-white"
          style={{
            backgroundColor: 'transparent',
            borderRadius: '0.125rem',
          }}
        />
      </div>

      {/* Footer */}
      <div className="text-center py-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <p
          className="font-mono text-polybloom-white-dim"
          style={{
            fontSize: '0.625rem',
          }}
        >
          PolyBloom Terminal v0.2 | {statusText} | The Bespoke Ledger
        </p>
      </div>
    </div>
  );
}
