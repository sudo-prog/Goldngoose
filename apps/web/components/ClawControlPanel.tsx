"use client";

import { useBotStore } from "@/lib/stores/botStore";
import { Button } from "@/components/Button";

export function ClawControlPanel() {
  const {
    bots,
    paperMode,
    globalKillSwitch,
    startBot,
    stopBot,
    toggleGlobalKillSwitch,
  } = useBotStore();

  return (
    <div className="space-y-4">
      {/* Safety Header */}
      <div className="panel border-2 border-goldngoose-neon">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="neon-glow text-xl">🤖 Claw Control</h2>
            <p className="text-xs text-slate-400 mt-1">
              {paperMode ? "📄 PAPER TRADING MODE" : "⚠️ LIVE TRADING MODE"}
            </p>
          </div>
          <div className="text-right">
            <Button
              size="sm"
              variant={globalKillSwitch ? "destructive" : "default"}
              onClick={toggleGlobalKillSwitch}
            >
              {globalKillSwitch ? "🛑 KILL SWITCH ON" : "▶️ Ready"}
            </Button>
          </div>
        </div>
      </div>

      {/* Bots List */}
      <div className="space-y-2">
        {bots.map((bot) => (
          <div key={bot.id} className="panel">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="neon-text text-sm">{bot.name}</h3>
                <p className="text-xs text-slate-400">{bot.strategy}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-slate-400">
                    Balance:{" "}
                    <span className="text-white font-mono">${bot.balance}</span>
                  </span>
                  <span
                    className={bot.pnl >= 0 ? "text-green-400" : "text-red-400"}
                  >
                    P&L: <span className="font-mono">{bot.pnl.toFixed(2)}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startBot(bot.id)}
                  disabled={bot.status === "running"}
                >
                  ▶️
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => stopBot(bot.id)}
                  disabled={bot.status !== "running"}
                >
                  ⏹️
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paper Trading Warning */}
      <div className="panel bg-yellow-900/20 border border-yellow-700 text-yellow-400 text-xs">
        <p className="font-semibold">📋 Paper Trading Active</p>
        <p className="mt-1">
          All trades are simulated. No real funds are at risk.
        </p>
        <p className="text-yellow-600 mt-2">
          To enable live trading, explicitly change mode and confirm twice.
        </p>
      </div>
    </div>
  );
}
