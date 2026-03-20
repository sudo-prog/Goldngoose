"use client";

import { useState, useEffect } from "react";
import { useBacktesterStore } from "@/lib/stores/backtesterStore";
import { Button } from "ui";

export function BacktesterPanel() {
  const {
    results,
    historicalData,
    loading,
    error,
    fetchHistoricalData,
    runBacktest,
    resetBacktest,
    getStrategyList,
  } = useBacktesterStore();

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [strategy, setStrategy] = useState("SMA Crossover");
  const [timeframe, setTimeframe] = useState("1d");
  const [days, setDays] = useState(90);

  const strategies = getStrategyList();

  const handleFetchData = async () => {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    await fetchHistoricalData(symbol, timeframe, startTime, endTime);
  };

  const handleRunBacktest = async () => {
    if (historicalData.length === 0) {
      await handleFetchData();
    }

    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;

    await runBacktest({
      symbol,
      strategy,
      startDate: new Date(startTime),
      endDate: new Date(endTime),
      initialCapital: 10000,
      leverage: 1,
      stopLoss: 5,
      takeProfit: 10,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="panel">
        <h2 className="neon-glow text-xl mb-4">⏮️ Backtester</h2>

        {/* Configuration */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1"
              >
                {strategies.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1"
              >
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Days</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                min={7}
                max={365}
                className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleFetchData}
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch Data"}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleRunBacktest}
              disabled={loading || historicalData.length === 0}
            >
              {loading ? "Running..." : "Run Backtest"}
            </Button>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-slate-400">Results</h3>
              <Button size="sm" variant="ghost" onClick={resetBacktest}>
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Final Capital</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(results.finalCapital)}
                </p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Total Return</p>
                <p
                  className={`text-lg font-bold ${
                    results.totalReturnPercentage >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {formatPercentage(results.totalReturnPercentage)}
                </p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Win Rate</p>
                <p className="text-lg font-bold text-blue-400">
                  {results.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Sharpe Ratio</p>
                <p className="text-lg font-bold text-purple-400">
                  {results.sharpeRatio.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Max Drawdown</p>
                <p className="text-lg font-bold text-orange-400">
                  -{results.maxDrawdownPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400">Profit Factor</p>
                <p className="text-lg font-bold text-green-400">
                  {results.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded text-sm">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Total Trades:</span>
                <span>{results.totalTrades}</span>
              </div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Profitable:</span>
                <span className="text-green-400">{results.profitableTrades}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Losing:</span>
                <span className="text-red-400">{results.losingTrades}</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded text-sm">
              <p className="text-slate-400 mb-1">Strategy: {results.config.strategy}</p>
              <p className="text-xs text-slate-500">
                {results.config.symbol} | {timeframe} | {days} days
              </p>
            </div>

            {/* Recent Trades */}
            {results.trades.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Recent Trades</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.trades.slice(-5).map((trade) => (
                    <div
                      key={trade.id}
                      className="flex justify-between items-center text-xs bg-slate-800/30 p-2 rounded"
                    >
                      <span
                        className={
                          trade.type === "buy" ? "text-green-400" : "text-red-400"
                        }
                      >
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="text-white">
                        {formatCurrency(trade.price)}
                      </span>
                      {trade.pnl !== undefined && (
                        <span
                          className={
                            trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {formatCurrency(trade.pnl)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data status */}
        {!results && historicalData.length > 0 && (
          <div className="text-center text-slate-400 text-sm py-4">
            <p>📊 {historicalData.length} candles loaded</p>
            <p className="text-xs">
              Ready to run backtest
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
