"use client";

import { useEffect, useState } from "react";
import { useTradingStore } from "@/lib/stores/tradingStore";
import { Button } from "ui";

export function PolymarketPortfolioPanel() {
  const {
    positions,
    portfolioValue,
    tradeHistory,
    paperBalance,
    paperMode,
    loadingPositions,
    fetchPositions,
    fetchPortfolioValue,
    fetchTrades,
  } = useTradingStore();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"positions" | "history">(
    "positions"
  );

  useEffect(() => {
    // In paper mode, we don't need a real wallet
    if (!paperMode && walletAddress) {
      fetchPositions(walletAddress);
      fetchPortfolioValue(walletAddress);
      fetchTrades();
    }
  }, [walletAddress, paperMode, fetchPositions, fetchPortfolioValue, fetchTrades]);

  // Calculate paper trading stats
  const paperStats = {
    totalPnl: tradeHistory.reduce((sum, trade) => {
      if (trade.side === "sell") {
        return sum + trade.price * trade.size;
      } else {
        return sum - trade.price * trade.size;
      }
    }, 0),
    totalTrades: tradeHistory.length,
    winRate:
      tradeHistory.length > 0
        ? (tradeHistory.filter((t) => t.side === "sell" && t.price > 0.5).length /
            tradeHistory.length) *
          100
        : 0,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel border-2 border-goldngoose-neon">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="neon-glow text-xl">💼 Polymarket Portfolio</h2>
            <p className="text-xs text-slate-400 mt-1">
              {paperMode ? "📄 Paper Trading Portfolio" : "📊 Live Portfolio"}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="panel">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-white font-mono">
              ${paperMode ? paperBalance.toFixed(2) : (portfolioValue?.totalValue || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Total P&L</p>
            <p
              className={`text-2xl font-bold font-mono ${
                paperStats.totalPnl >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {paperStats.totalPnl >= 0 ? "+" : ""}$
              {paperStats.totalPnl.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-400">Trades</p>
            <p className="text-lg font-bold text-white">{paperStats.totalTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Win Rate</p>
            <p className="text-lg font-bold text-white">
              {paperStats.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Positions</p>
            <p className="text-lg font-bold text-white">{positions.length}</p>
          </div>
        </div>
      </div>

      {/* Wallet Input (Live Mode Only) */}
      {!paperMode && (
        <div className="panel">
          <label className="text-xs text-slate-400 mb-2 block">
            Wallet Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-goldngoose-navy-mid text-white p-2 rounded border border-goldngoose-gold/20 font-mono text-xs"
            />
            <Button
              onClick={() => {
                fetchPositions(walletAddress);
                fetchPortfolioValue(walletAddress);
              }}
              disabled={!walletAddress || loadingPositions}
              size="sm"
            >
              {loadingPositions ? "Loading..." : "Load"}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "bg-goldngoose-gold text-black"
              : "bg-goldngoose-navy-mid text-slate-400 hover:text-white"
          }`}
        >
          📊 Positions
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-goldngoose-gold text-black"
              : "bg-goldngoose-navy-mid text-slate-400 hover:text-white"
          }`}
        >
          📜 History
        </button>
      </div>

      {/* Positions Tab */}
      {activeTab === "positions" && (
        <div className="panel">
          {loadingPositions ? (
            <div className="flex items-center justify-center min-h-32">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⚡</div>
                <p className="text-slate-400">Loading positions...</p>
              </div>
            </div>
          ) : positions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {positions.map((position, index) => (
                <div
                  key={index}
                  className="bg-goldngoose-navy-mid/50 p-3 rounded"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {position.market?.slice(0, 30) || "Unknown Market"}...
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {position.outcome} | Size: {position.size.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono">
                        ${position.currentValue.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs font-mono ${
                          position.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {position.pnl >= 0 ? "+" : ""}$
                        {position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-slate-400">No positions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                {paperMode
                  ? "Place your first trade to see positions here"
                  : "Enter a wallet address to view positions"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="panel">
          {tradeHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tradeHistory.map((trade, index) => (
                <div
                  key={index}
                  className="bg-goldngoose-navy-mid/50 p-3 rounded flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          trade.side === "buy"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                      <span className="text-white text-sm">
                        {(trade.price * 100).toFixed(1)}¢ × {trade.size.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {trade.market?.slice(0, 40) || "Market"}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono">
                      ${(trade.price * trade.size).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📜</p>
              <p className="text-slate-400">No trade history</p>
              <p className="text-xs text-slate-500 mt-1">
                Your completed trades will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="panel bg-goldngoose-navy-mid/30">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          📈 Performance
        </h3>
        <div className="h-32 flex items-center justify-center border border-slate-700 rounded">
          <div className="text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xs text-slate-500">
              Performance chart coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="panel bg-yellow-900/20 border border-yellow-700 text-yellow-400 text-xs">
        <p className="font-semibold">💼 Portfolio Overview</p>
        <p className="mt-1">
          {paperMode
            ? "Paper trading portfolio. All values are simulated."
            : "Live portfolio data from Polymarket."}
        </p>
      </div>
    </div>
  );
}