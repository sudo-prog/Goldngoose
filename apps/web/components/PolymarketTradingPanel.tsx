"use client";

import { useState } from "react";
import { useTradingStore } from "@/lib/stores/tradingStore";
import { Button } from "ui";

export function PolymarketTradingPanel() {
  const {
    orderBook,
    selectedTokenId,
    paperMode,
    paperBalance,
    isTrading,
    lastTradeError,
    createOrder,
    createMarketOrder,
    cancelAllOrders,
    openOrders,
    clearError,
  } = useTradingStore();

  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get current prices from order book
  const bestBid = orderBook?.bids[0]
    ? (parseFloat(orderBook.bids[0].price) * 100).toFixed(1)
    : null;
  const bestAsk = orderBook?.asks[0]
    ? (parseFloat(orderBook.asks[0].price) * 100).toFixed(1)
    : null;

  const handleQuickPrice = (type: "bid" | "ask" | "mid") => {
    if (!orderBook) return;

    let newPrice: string;
    switch (type) {
      case "bid":
        newPrice = bestBid || "";
        break;
      case "ask":
        newPrice = bestAsk || "";
        break;
      case "mid":
        if (bestBid && bestAsk) {
          newPrice = ((parseFloat(bestBid) + parseFloat(bestAsk)) / 2).toFixed(1);
        } else {
          newPrice = "";
        }
        break;
    }
    setPrice(newPrice);
  };

  const handleSubmit = () => {
    if (!selectedTokenId) return;
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedTokenId) return;

    let success = false;

    if (orderType === "limit") {
      success = await createOrder({
        tokenId: selectedTokenId,
        side,
        price: parseFloat(price) / 100, // Convert from cents to decimal
        size: parseFloat(size),
      });
    } else {
      success = await createMarketOrder({
        tokenId: selectedTokenId,
        side,
        amount: parseFloat(amount),
      });
    }

    if (success) {
      setPrice("");
      setSize("");
      setAmount("");
    }

    setShowConfirmation(false);
  };

  const handleCancelAll = async () => {
    await cancelAllOrders();
  };

  const estimatedTotal =
    orderType === "limit" && price && size
      ? (parseFloat(price) / 100) * parseFloat(size)
      : orderType === "market" && amount
        ? parseFloat(amount)
        : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel border-2 border-goldngoose-gold">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="neon-text text-xl">💹 Polymarket Trading</h2>
            <p className="text-xs text-slate-400 mt-1">
              {paperMode ? "📄 PAPER TRADING" : "⚠️ LIVE TRADING"} | Balance: $
              {paperBalance.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            {paperMode && (
              <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                Simulated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* No Market Selected Warning */}
      {!selectedTokenId && (
        <div className="panel bg-red-900/20 border border-red-700 text-red-400 text-xs">
          <p className="font-semibold">⚠️ No Market Selected</p>
          <p className="mt-1">
            Select a market from the Order Book panel to start trading.
          </p>
        </div>
      )}

      {/* Trading Form */}
      <div className="panel space-y-4">
        {/* Order Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType("limit")}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              orderType === "limit"
                ? "bg-goldngoose-gold text-black"
                : "bg-goldngoose-navy-mid text-slate-400 hover:text-white"
            }`}
          >
            Limit Order
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              orderType === "market"
                ? "bg-goldngoose-gold text-black"
                : "bg-goldngoose-navy-mid text-slate-400 hover:text-white"
            }`}
          >
            Market Order
          </button>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSide("buy")}
            className={`flex-1 py-3 rounded text-sm font-bold transition-colors ${
              side === "buy"
                ? "bg-green-600 text-white"
                : "bg-goldngoose-navy-mid text-slate-400 hover:text-green-400"
            }`}
          >
            📈 BUY (Yes)
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`flex-1 py-3 rounded text-sm font-bold transition-colors ${
              side === "sell"
                ? "bg-red-600 text-white"
                : "bg-goldngoose-navy-mid text-slate-400 hover:text-red-400"
            }`}
          >
            📉 SELL (No)
          </button>
        </div>

        {/* Quick Price Buttons */}
        {orderType === "limit" && orderBook && (
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickPrice("bid")}
              className="flex-1 py-1 text-xs bg-green-900/30 text-green-400 rounded hover:bg-green-900/50"
            >
              Best Bid: {bestBid || "-"}¢
            </button>
            <button
              onClick={() => handleQuickPrice("mid")}
              className="flex-1 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded hover:bg-yellow-900/50"
            >
              Mid:{" "}
              {bestBid && bestAsk
                ? ((parseFloat(bestBid) + parseFloat(bestAsk)) / 2).toFixed(1)
                : "-"}
              ¢
            </button>
            <button
              onClick={() => handleQuickPrice("ask")}
              className="flex-1 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
            >
              Best Ask: {bestAsk || "-"}¢
            </button>
          </div>
        )}

        {/* Price Input (Limit Only) */}
        {orderType === "limit" && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Price (cents)
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50.0"
                min="0"
                max="100"
                step="0.1"
                className="w-full bg-goldngoose-navy-mid text-white p-3 rounded border border-goldngoose-gold/20 font-mono text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ¢
              </span>
            </div>
          </div>
        )}

        {/* Size Input (Limit) or Amount Input (Market) */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            {orderType === "limit" ? "Size (shares)" : "Amount (USDC)"}
          </label>
          <div className="relative">
            <input
              type="number"
              value={orderType === "limit" ? size : amount}
              onChange={(e) =>
                orderType === "limit"
                  ? setSize(e.target.value)
                  : setAmount(e.target.value)
              }
              placeholder={orderType === "limit" ? "10" : "5.00"}
              min="0"
              step={orderType === "limit" ? "1" : "0.01"}
              className="w-full bg-goldngoose-navy-mid text-white p-3 rounded border border-goldngoose-gold/20 font-mono text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {orderType === "limit" ? "shares" : "$"}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        {estimatedTotal > 0 && (
          <div className="bg-goldngoose-navy-mid/50 p-3 rounded">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Estimated Total</span>
              <span className="text-white font-mono">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            {orderType === "limit" && price && (
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Effective Price</span>
                <span className="text-white font-mono">
                  {parseFloat(price).toFixed(1)}¢
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {lastTradeError && (
          <div className="bg-red-900/20 border border-red-700 text-red-400 text-xs p-3 rounded">
            <p className="font-semibold">❌ Error</p>
            <p className="mt-1">{lastTradeError}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !selectedTokenId ||
            isTrading ||
            (orderType === "limit" && (!price || !size)) ||
            (orderType === "market" && !amount)
          }
          className={`w-full py-3 font-bold text-lg ${
            side === "buy"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isTrading
            ? "⏳ Processing..."
            : `${side === "buy" ? "📈 Buy" : "📉 Sell"} ${orderType === "limit" ? "Limit" : "Market"}`}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="panel max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold text-goldngoose-gold">
              ⚠️ Confirm Order
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Type</span>
                <span className="text-white">
                  {orderType === "limit" ? "Limit" : "Market"} Order
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Side</span>
                <span
                  className={side === "buy" ? "text-green-400" : "text-red-400"}
                >
                  {side === "buy" ? "BUY (Yes)" : "SELL (No)"}
                </span>
              </div>
              {orderType === "limit" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price</span>
                    <span className="text-white font-mono">{price}¢</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Size</span>
                    <span className="text-white font-mono">{size} shares</span>
                  </div>
                </>
              )}
              {orderType === "market" && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-mono">${amount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-700 pt-2">
                <span className="text-slate-400">Total</span>
                <span className="text-white font-mono">
                  ${estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {paperMode && (
              <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 text-xs p-3 rounded">
                📄 This is a paper trade. No real funds will be used.
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmOrder}
                className={`flex-1 ${
                  side === "buy" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                Confirm {side === "buy" ? "Buy" : "Sell"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Open Orders */}
      {openOrders.length > 0 && (
        <div className="panel">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-400">Open Orders</h3>
            <button
              onClick={handleCancelAll}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Cancel All
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {openOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-xs bg-goldngoose-navy-mid/50 p-2 rounded"
              >
                <div>
                  <span
                    className={
                      order.side === "buy" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-white ml-2">{order.size} @</span>
                  <span className="text-white ml-1">
                    {(order.price * 100).toFixed(1)}¢
                  </span>
                </div>
                <span className="text-slate-400">{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="panel bg-yellow-900/20 border border-yellow-700 text-yellow-400 text-xs">
        <p className="font-semibold">⚡ Polymarket Trading</p>
        <p className="mt-1">
          Place limit and market orders on Polymarket prediction markets.
          {paperMode
            ? " Currently in paper trading mode."
            : " ⚠️ Live trading mode - real funds at risk!"}
        </p>
      </div>
    </div>
  );
}