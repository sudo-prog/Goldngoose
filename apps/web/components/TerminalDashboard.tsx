"use client";

import { useEffect } from "react";
import { useMarketsStore } from "@/lib/stores/marketsStore"; 
import { MarketGrid } from "@/components/MarketTicker";
import { ClawControlPanel } from "@/components/ClawControlPanel";
import { NewsRadarPanel } from "@/components/NewsRadarPanel";
import { BacktesterPanel } from "@/components/BacktesterPanel";
import { Button } from "ui";

export function TerminalDashboard() {
  const { markets, loading, error, fetchTopMarkets } = useMarketsStore();

  useEffect(() => {
    // Fetch markets on mount
    fetchTopMarkets();
    // Refetch every 30 seconds
    const interval = setInterval(fetchTopMarkets, 30000);
    return () => clearInterval(interval);
  }, [fetchTopMarkets]);

  return (
    <div className="min-h-screen bg-polybloom-dark p-4 space-y-4">
      {/* Header */}
      <div className="panel border-b-2 border-polybloom-neon">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="neon-glow text-4xl">💹 PolyBloom Terminal</h1>
            <p className="text-slate-400 text-sm mt-1">Bloomberg-style crypto trading + AI</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => fetchTopMarkets()}>
              🔄 Refresh
            </Button>
            <Button size="sm" variant="ghost">
              ⚙️ Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar - Markets & News */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-polybloom-neon mb-3">📊 Top Markets</h2>
            {error ? (
              <div className="panel text-red-400 text-sm">{error}</div>
            ) : (
              <MarketGrid markets={markets.slice(0, 15)} loading={loading} />
            )}
          </div>
        </div>

        {/* Center - Trading & Bot Control */}
        <div className="lg:col-span-2 space-y-4">
          <ClawControlPanel />
          <BacktesterPanel />
        </div>

        {/* Right Sidebar - News & Intelligence */}
        <div className="lg:col-span-1">
          <NewsRadarPanel />
        </div>
      </div>

      {/* Bottom - Command Bar */}
      <div className="panel font-mono text-sm border-t border-polybloom-neon">
        <p className="text-polybloom-neon mb-2">💬 Command Bar</p>
        <input
          type="text"
          placeholder="&gt; Type a command (e.g., 'add panel market-overview', 'list bots', 'start backtest')"
          className="w-full bg-transparent text-white outline-none focus:ring-2 focus:ring-polybloom-neon px-2 py-1 rounded"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-slate-600 text-xs py-4">
        <p>PolyBloom Terminal v0.2 | Paper Trading Mode 📄 | Built with Next.js+React+Tailwind</p>
      </div>
    </div>
  );
}
