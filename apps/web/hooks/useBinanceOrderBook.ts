"use client";

import { useEffect, useRef, useState } from "react";

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
}

export function useBinanceOrderBook(symbol: string, levels: number = 20) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const normalizedSymbol = symbol.toUpperCase();
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${normalizedSymbol.toLowerCase()}@depth${levels}@100ms`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Transform Binance depth data to our format
        const bids: OrderBookLevel[] = (data.bids || []).map(([price, qty]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        }));

        const asks: OrderBookLevel[] = (data.asks || []).map(([price, qty]: [string, string]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        }));

        setOrderBook({
          symbol: normalizedSymbol,
          bids,
          asks,
          lastUpdateId: data.lastUpdateId || Date.now(),
        });
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      // Attempt simple reconnect
      setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          wsRef.current = null;
        }
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [symbol, levels]);

  return orderBook;
}