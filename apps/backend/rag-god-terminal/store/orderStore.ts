"use client";

import { create } from "zustand";

interface Order {
  size: number;
  price: number;
  market: string;
}

interface OrderStore {
  order: Order;
  updateOrder: (updates: Partial<Order>) => void;
  resetOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: {
    size: 100,
    price: 0.65,
    market: "BTC"
  },
  updateOrder: (updates) => set((state) => ({
    order: { ...state.order, ...updates }
  })),
  resetOrder: () => set({
    order: {
      size: 100,
      price: 0.65,
      market: "BTC"
    }
  })
}));