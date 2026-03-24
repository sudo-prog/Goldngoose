"use client";

import { create } from "zustand";

// Local implementation of arrayMove to avoid SSR issues with @dnd-kit/sortable
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

export type PanelType =
  | "markets"
  | "polymarket"
  | "polymarket-trading"
  | "polymarket-portfolio"
  | "bot-control"
  | "chart"
  | "order-book"
  | "news"
  | "portfolio"
  | "backtester"
  | "insight-chat"
  | "replay"
  | "studio-monitor";

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
  _isHydrated: boolean;
  _hydrateLayout: () => void;
  addPanel: (type: PanelType, title: string) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  togglePanel: (id: string) => void;
  movePanel: (fromIndex: number, toIndex: number) => void;
  resetLayout: () => void;
}

const LAYOUT_STORAGE_KEY = "goldngoose-layout";

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
    id: "portfolio-main",
    type: "portfolio",
    title: "Portfolio",
    position: 1,
    size: "medium",
    visible: true,
  },
  {
    id: "order-book-btc",
    type: "order-book",
    title: "Order Book (BTC)",
    position: 2,
    size: "medium",
    visible: true,
  },
  {
    id: "bot-claw",
    type: "bot-control",
    title: "Claw Control",
    position: 3,
    size: "large",
    visible: true,
  },
  {
    id: "backtester-main",
    type: "backtester",
    title: "Backtester",
    position: 4,
    size: "medium",
    visible: true,
  },
  {
    id: "polymarket-hot",
    type: "polymarket",
    title: "Hot Markets",
    position: 5,
    size: "medium",
    visible: true,
  },
];

function loadPersistedLayout(): Panel[] {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return DEFAULT_PANELS;
    const parsed = JSON.parse(raw) as Panel[];
    if (!Array.isArray(parsed)) return DEFAULT_PANELS;
    return parsed;
  } catch {
    return DEFAULT_PANELS;
  }
}

function persistLayout(panels: Panel[]) {
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(panels));
  } catch {
    // ignore
  }
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  // Start with DEFAULT_PANELS, will be hydrated on client
  panels: DEFAULT_PANELS,
  _isHydrated: false,
  
  // Load persisted layout - call this to sync with localStorage
  _hydrateLayout: () => {
    set((state) => {
      if (state._isHydrated) return {};
      const persisted = loadPersistedLayout();
      return { panels: persisted, _isHydrated: true };
    });
  },

  addPanel: (type: PanelType, title: string) => {
    set((state) => {
      const newPanel: Panel = {
        id: `${type}-${Date.now()}`,
        type,
        title,
        position: state.panels.length,
        size: "medium",
        visible: true,
      };

      const newPanels = [...state.panels, newPanel];
      persistLayout(newPanels);
      return { panels: newPanels };
    });
  },

  removePanel: (id: string) => {
    set((state) => {
      const newPanels = state.panels.filter((p) => p.id !== id);
      persistLayout(newPanels);
      return { panels: newPanels };
    });
  },

  updatePanel: (id: string, updates: Partial<Panel>) => {
    set((state) => {
      const newPanels = state.panels.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      );
      persistLayout(newPanels);
      return { panels: newPanels };
    });
  },

  togglePanel: (id: string) => {
    set((state) => {
      const newPanels = state.panels.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p,
      );
      persistLayout(newPanels);
      return { panels: newPanels };
    });
  },

  movePanel: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const reordered = arrayMove(state.panels, fromIndex, toIndex);
      const updated = reordered.map((panel, index) => ({
        ...panel,
        position: index,
      }));
      persistLayout(updated);
      return { panels: updated };
    });
  },

  resetLayout: () => {
    persistLayout(DEFAULT_PANELS);
    set({ panels: DEFAULT_PANELS });
  },
}));
