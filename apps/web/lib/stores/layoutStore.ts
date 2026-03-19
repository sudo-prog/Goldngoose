"use client";

import { create } from "zustand";

export type PanelType = "markets" | "polymarket" | "bot-control" | "chart" | "order-book" | "news";

export interface Panel {
  id: string;
  type: PanelType;
  title: string;
  position: number;
  size: "small" | "medium" | "large";
  visible: boolean;
}

interface LayoutStore {
  panels: Panel[];
  addPanel: (type: PanelType, title: string) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  togglePanel: (id: string) => void;
  resetLayout: () => void;
}

const DEFAULT_PANELS: Panel[] = [
  {
    id: "markets-top",
    type: "markets",
    title: "Top Markets",
    position: 0,
    size: "medium",
    visible: true,
  },
  {
    id: "polymarket-hot",
    type: "polymarket",
    title: "Hot Markets",
    position: 1,
    size: "medium",
    visible: true,
  },
  {
    id: "bot-claw",
    type: "bot-control",
    title: "Claw Control",
    position: 2,
    size: "large",
    visible: true,
  },
];

export const useLayoutStore = create<LayoutStore>((set) => ({
  panels: DEFAULT_PANELS,

  addPanel: (type: PanelType, title: string) => {
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id: `${type}-${Date.now()}`,
          type,
          title,
          position: state.panels.length,
          size: "medium",
          visible: true,
        },
      ],
    }));
  },

  removePanel: (id: string) => {
    set((state) => ({
      panels: state.panels.filter((p) => p.id !== id),
    }));
  },

  updatePanel: (id: string, updates: Partial<Panel>) => {
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  togglePanel: (id: string) => {
    set((state) => ({
      panels: state.panels.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p
      ),
    }));
  },

  resetLayout: () => {
    set({ panels: DEFAULT_PANELS });
  },
}));
