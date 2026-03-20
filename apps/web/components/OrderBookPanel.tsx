"use client";

import { useBinanceOrderBook, OrderBookLevel } from "@/hooks/useBinanceOrderBook";
import { useMemo } from "react";

interface OrderBookPanelProps {
  symbol?: string;
}

export function OrderBookPanel({ symbol = "BTCUSDT" }: OrderBookPanelProps) {
  const orderBook = useBinanceOrderBook(symbol, 15);

  const formatPrice = (price: number) => {
    return price >= 1000
      ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price.toFixed(price < 1 ? 6 : 4);
  };

  const formatQuantity = (qty: number) => {
    return qty >= 1000
      ? (qty / 1000).toFixed(2) + "K"
      : qty.toFixed(qty < 1 ? 4 : 2);
  };

  // Calculate max quantity for depth visualization
  const maxQuantity = useMemo(() => {
    if (!orderBook) return 0;
    const allQtys = [...orderBook.bids, ...orderBook.asks].map((l) => l.quantity);
    return Math.max(...allQtys, 1);
  }, [orderBook]);

  // Calculate spread
  const spread = useMemo(() => {
    if (!orderBook || orderBook.asks.length === 0 || orderBook.bids.length === 0) return null;
    const bestAsk = orderBook.asks[0].price;
    const bestBid = orderBook.bids[0].price;
    const spreadValue = bestAsk - bestBid;
    const spreadPercentage = (spreadValue / bestAsk) * 100;
    return { value: spreadValue, percentage: spreadPercentage };
  }, [orderBook]);

  const renderLevel = (level: OrderBookLevel, type: "bid" | "ask", index: number) => {
    const depthPercentage = (level.quantity / maxQuantity) * 100;
    const bgColor = type === "bid" ? "bg-green-900/30" : "bg-red-900/30";
    const textColor = type === "bid" ? "text-green-400" : "text-red-400";

    return (
      <div
        key={`${type}-${index}`}
        className="relative flex justify-between items-center py-1 px-2 text-xs font-mono"
      >
        {/* Depth visualization bar */}
        <div
          className={`absolute inset-0 ${bgColor}`}
          style={{
            width: `${depthPercentage}%`,
            opacity: 0.5,
          }}
        />

        <span className={`relative z-10 ${textColor}`}>
          {formatPrice(level.price)}
        </span>
        <span className="relative z-10 text-slate-300">
          {formatQuantity(level.quantity)}
        </span>
      </div>
    );
  };

  if (!orderBook) {
    return (
      <div className="panel">
        <h2 className="neon-glow text-xl mb-4">📖 Order Book</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-slate-400">Loading order book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="neon-glow text-xl">📖 Order Book</h2>
        <span className="text-sm text-slate-400">{symbol.toUpperCase()}</span>
      </div>

      {/* Spread indicator */}
      {spread && (
        <div className="mb-3 p-2 bg-slate-800/50 rounded text-center">
          <p className="text-xs text-slate-400">Spread</p>
          <p className="text-sm font-mono text-yellow-400">
            {formatPrice(spread.value)} ({spread.percentage.toFixed(4)}%)
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between text-xs text-slate-500 px-2 mb-1">
        <span>Price (USD)</span>
        <span>Amount</span>
      </div>

      {/* Asks (Sell orders) - reversed to show lowest price at bottom */}
      <div className="space-y-0.5 mb-2">
        <p className="text-xs text-red-400 px-2 mb-1">Sell Orders</p>
        {orderBook.asks
          .slice()
          .reverse()
          .map((level, index) => renderLevel(level, "ask", index))}
      </div>

      {/* Center price indicator */}
      <div className="py-2 px-2 bg-slate-800/50 rounded my-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Last Price</span>
          <span className="text-lg font-bold text-white font-mono">
            {orderBook.asks.length > 0
              ? formatPrice(orderBook.asks[0].price)
              : orderBook.bids.length > 0
                ? formatPrice(orderBook.bids[0].price)
                : "N/A"}
          </span>
        </div>
      </div>

      {/* Bids (Buy orders) */}
      <div className="space-y-0.5">
        <p className="text-xs text-green-400 px-2 mb-1">Buy Orders</p>
        {orderBook.bids.map((level, index) => renderLevel(level, "bid", index))}
      </div>

      {/* Market depth summary */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-500">Total Bid Volume</p>
            <p className="text-green-400 font-mono">
              {formatQuantity(orderBook.bids.reduce((sum, l) => sum + l.quantity, 0))}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Total Ask Volume</p>
            <p className="text-red-400 font-mono">
              {formatQuantity(orderBook.asks.reduce((sum, l) => sum + l.quantity, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}