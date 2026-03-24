"use client";

import { useEffect, useState } from "react";
import { useTradingStore } from "@/lib/stores/tradingStore";
import { usePolymarketStore } from "@/lib/stores/polymarketStore";

export function PolymarketOrderBookPanel() {
  const {
    orderBook,
    selectedTokenId,
    loadingOrderBook,
    fetchOrderBook,
    setSelectedToken,
    paperMode,
  } = useTradingStore();

  const { markets, fetchMarkets } = usePolymarketStore();
  const [selectedMarket, setSelectedMarket] = useState<string>("");

  useEffect(() => {
    fetchMarkets(20);
  }, [fetchMarkets]);

  const handleMarketSelect = (marketId: string) => {
    setSelectedMarket(marketId);
    // Find the market and get its token ID
    const market = markets.find((m) => m.id === marketId);
    if (market?.tokenId) {
      setSelectedToken(market.tokenId);
    }
  };

  // Parse order book data
  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];
  const maxBidSize = Math.max(...bids.map((b) => parseFloat(b.size)), 1);
  const maxAskSize = Math.max(...asks.map((a) => parseFloat(a.size)), 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel border-2 border-goldngoose-neon">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="neon-glow text-xl">📊 Polymarket Order Book</h2>
            <p className="text-xs text-slate-400 mt-1">
              {paperMode ? "📄 Paper Trading" : "💹 Live Trading"} | Real-time CLOB data
            </p>
          </div>
          {selectedTokenId && (
            <div className="text-right text-xs text-slate-400">
              Token: {selectedTokenId.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* Market Selector */}
      <div className="panel">
        <label className="text-xs text-slate-400 mb-2 block">Select Market</label>
        <select
          value={selectedMarket}
          onChange={(e) => handleMarketSelect(e.target.value)}
          className="w-full bg-goldngoose-navy-mid text-white p-2 rounded border border-goldngoose-gold/20"
        >
          <option value="">-- Select a market --</option>
          {markets.map((market) => (
            <option key={market.id} value={market.id}>
              {market.question?.slice(0, 80) || market.id}
            </option>
          ))}
        </select>
      </div>

      {/* Order Book */}
      {loadingOrderBook ? (
        <div className="panel flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">⚡</div>
            <p className="text-slate-400">Loading order book...</p>
          </div>
        </div>
      ) : orderBook ? (
        <div className="grid grid-cols-2 gap-2">
          {/* Bids (Buy Orders) */}
          <div className="panel bg-green-900/10 border border-green-700/30">
            <h3 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <span>📈</span> Bids (Buy)
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 text-xs text-slate-500 pb-1 border-b border-slate-700">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              {bids.length > 0 ? (
                bids.slice(0, 15).map((bid, index) => {
                  const price = parseFloat(bid.price);
                  const size = parseFloat(bid.size);
                  const total = price * size;
                  const sizePercent = (size / maxBidSize) * 100;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-3 text-xs py-1 relative"
                    >
                      <div
                        className="absolute inset-0 bg-green-500/10"
                        style={{ width: `${sizePercent}%` }}
                      />
                      <span className="text-green-400 font-mono relative z-10">
                        {(price * 100).toFixed(1)}¢
                      </span>
                      <span className="text-right text-white font-mono relative z-10">
                        {size.toFixed(2)}
                      </span>
                      <span className="text-right text-slate-400 font-mono relative z-10">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-xs py-4 text-center">No bids</p>
              )}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="panel bg-red-900/10 border border-red-700/30">
            <h3 className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <span>📉</span> Asks (Sell)
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 text-xs text-slate-500 pb-1 border-b border-slate-700">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              {asks.length > 0 ? (
                asks.slice(0, 15).map((ask, index) => {
                  const price = parseFloat(ask.price);
                  const size = parseFloat(ask.size);
                  const total = price * size;
                  const sizePercent = (size / maxAskSize) * 100;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-3 text-xs py-1 relative"
                    >
                      <div
                        className="absolute inset-0 bg-red-500/10"
                        style={{ width: `${sizePercent}%` }}
                      />
                      <span className="text-red-400 font-mono relative z-10">
                        {(price * 100).toFixed(1)}¢
                      </span>
                      <span className="text-right text-white font-mono relative z-10">
                        {size.toFixed(2)}
                      </span>
                      <span className="text-right text-slate-400 font-mono relative z-10">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-xs py-4 text-center">No asks</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-slate-400">Select a market to view the order book</p>
          </div>
        </div>
      )}

      {/* Spread Info */}
      {orderBook && (
        <div className="panel bg-goldngoose-navy-mid/50">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-400">Best Bid</p>
              <p className="text-green-400 font-mono text-lg">
                {bids[0] ? `${(parseFloat(bids[0].price) * 100).toFixed(1)}¢` : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Spread</p>
              <p className="text-yellow-400 font-mono text-lg">
                {bids[0] && asks[0]
                  ? `${((parseFloat(asks[0].price) - parseFloat(bids[0].price)) * 100).toFixed(1)}¢`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Best Ask</p>
              <p className="text-red-400 font-mono text-lg">
                {asks[0] ? `${(parseFloat(asks[0].price) * 100).toFixed(1)}¢` : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="panel bg-yellow-900/20 border border-yellow-700 text-yellow-400 text-xs">
        <p className="font-semibold">⚡ CLOB Order Book</p>
        <p className="mt-1">
          Real-time order book data from Polymarket's Central Limit Order Book.
        </p>
      </div>
    </div>
  );
}