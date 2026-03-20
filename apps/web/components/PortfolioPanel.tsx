"use client";

import { usePortfolioStore } from "@/lib/stores/portfolioStore";
import { useBinanceMiniTicker } from "@/hooks/useBinanceMiniTicker";
import { useMemo, useEffect } from "react";
import { Button } from "ui";

export function PortfolioPanel() {
  const { portfolio, updatePositionPrice, closePosition } = usePortfolioStore();
  
  // Get live prices for all positions
  const symbols = useMemo(
    () => portfolio.positions.map((p) => `${p.symbol.toUpperCase()}USDT`),
    [portfolio.positions]
  );
  const tickers = useBinanceMiniTicker(symbols);

  // Update position prices when live data comes in
  useEffect(() => {
    for (const [symbolKey, ticker] of Object.entries(tickers)) {
      const symbol = symbolKey.replace("USDT", "");
      const price = Number(ticker.c);
      if (!isNaN(price)) {
        updatePositionPrice(symbol, price);
      }
    }
  }, [tickers, updatePositionPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="panel">
        <h2 className="neon-glow text-xl mb-4">💼 Portfolio</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-xs text-slate-400">Total Balance</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(portfolio.totalBalance)}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-xs text-slate-400">Available</p>
            <p className="text-xl font-bold text-blue-400">
              {formatCurrency(portfolio.availableBalance)}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-xs text-slate-400">Total P&L</p>
            <p
              className={`text-xl font-bold ${
                portfolio.totalPnl >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatCurrency(portfolio.totalPnl)}
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-xs text-slate-400">Win Rate</p>
            <p className="text-xl font-bold text-purple-400">
              {portfolio.winRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 mb-2">Open Positions</h3>
          {portfolio.positions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              No open positions
            </p>
          ) : (
            portfolio.positions.map((position) => (
              <div
                key={position.id}
                className="bg-slate-800/30 p-3 rounded border border-slate-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {position.symbol.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          position.side === "long"
                            ? "bg-green-900/50 text-green-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {position.side.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {position.leverage}x
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Entry: {formatCurrency(position.entryPrice)} | Size:{" "}
                      {position.quantity}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => closePosition(position.id)}
                  >
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Current</p>
                    <p className="text-white font-mono">
                      {formatCurrency(position.currentPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">P&L</p>
                    <p
                      className={`font-mono ${
                        position.pnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(position.pnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">P&L %</p>
                    <p
                      className={`font-mono ${
                        position.pnlPercentage >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatPercentage(position.pnlPercentage)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Margin: {formatCurrency(position.margin)}</span>
                    <span>
                      Liq. Price: {formatCurrency(position.liquidationPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}