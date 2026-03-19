"use client";

import { create } from "zustand";

export interface BacktestResults {
  id: string;
  strategyName: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  sharpRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageWin: number;
  averageLoss: number;
  status: "running" | "completed" | "error";
}

interface BacktesterStore {
  backtests: BacktestResults[];
  running: boolean;
  error: string | null;
  startBacktest: (strategyName: string, startDate: Date, endDate: Date) => Promise<void>;
  getBacktest: (id: string) => BacktestResults | undefined;
}

// Demo backtest result
const DEMO_BACKTEST: BacktestResults = {
  id: "backtest-001",
  strategyName: "Grid Trading Alpha v2",
  startDate: new Date(Date.now() - 86400000 * 365), // 1 year ago
  endDate: new Date(),
  initialCapital: 10000,
  finalValue: 12475,
  totalReturn: 24.75,
  sharpRatio: 1.2,
  maxDrawdown: -8.5,
  winRate: 65,
  totalTrades: 847,
  profitableTrades: 551,
  averageWin: 23.50,
  averageLoss: -12.30,
  status: "completed",
};

export const useBacktesterStore = create<BacktesterStore>((set) => ({
  backtests: [DEMO_BACKTEST],
  running: false,
  error: null,

  startBacktest: async (strategyName: string, startDate: Date, endDate: Date) => {
    set({ running: true, error: null });
    try {
      // Simulate backtest execution
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newResult: BacktestResults = {
        id: `backtest-${Date.now()}`,
        strategyName,
        startDate,
        endDate,
        initialCapital: 10000,
        finalValue: 10000 + Math.random() * 5000 - 500,
        totalReturn: Math.random() * 50 - 10,
        sharpRatio: Math.random() * 2,
        maxDrawdown: -(Math.random() * 20),
        winRate: Math.floor(Math.random() * 40 + 40),
        totalTrades: Math.floor(Math.random() * 1000 + 100),
        profitableTrades: 0,
        averageWin: Math.random() * 50,
        averageLoss: -(Math.random() * 30),
        status: "completed",
      };

      set((state) => ({
        backtests: [...state.backtests, newResult],
        running: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Backtest failed",
        running: false,
      });
    }
  },

  getBacktest: (id: string) => {
    return useBacktesterStore.getState().backtests.find((b) => b.id === id);
  },
}));

// Component
import { Button } from "ui";

export function BacktesterPanel() {
  const { backtests, running, startBacktest } = useBacktesterStore();
  const latest = backtests[backtests.length - 1];

  if (!latest) {
    return <div className="panel">No backtests yet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <h2 className="neon-glow text-xl mb-4">⏮️ Backtester</h2>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 p-3 rounded">
              <p className="text-xs text-slate-400">Total Return</p>
              <p className={`text-xl font-bold ${latest.totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                {latest.totalReturn.toFixed(2)}%
              </p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded">
              <p className="text-xs text-slate-400">Win Rate</p>
              <p className="text-xl font-bold text-blue-400">{latest.winRate}%</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded">
              <p className="text-xs text-slate-400">Sharpe Ratio</p>
              <p className="text-xl font-bold text-purple-400">{latest.sharpRatio.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded">
              <p className="text-xs text-slate-400">Max Drawdown</p>
              <p className="text-xl font-bold text-orange-400">{latest.maxDrawdown.toFixed(2)}%</p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded text-sm">
            <p className="text-slate-400 mb-1">Latest: {latest.strategyName}</p>
            <p className="text-xs text-slate-500">Trades: {latest.totalTrades} | Win: {latest.profitableTrades}</p>
          </div>

          <Button 
            size="sm" 
            className="w-full" 
            disabled={running}
            onClick={() => startBacktest("New Strategy", new Date(Date.now() - 86400000 * 30), new Date())}
          >
            {running ? "Running..." : "Run Backtest"}
          </Button>
        </div>
      </div>
    </div>
  );
}
