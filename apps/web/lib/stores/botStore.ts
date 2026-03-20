import { create } from "zustand";

export interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: "idle" | "running" | "stopped" | "error";
  mode: "paper" | "live";
  balance: number;
  pnl: number;
  pnlPercent: number;
  activeTrades: number;
  createdAt: number;
  lastUpdated: number;
}

export interface SafetySettings {
  maxDailyLossPercent: number;
  maxPositionSizePercent: number;
  cooldownAfterLosses: number; // seconds
  maxConsecutiveLosses: number;
  emergencyLiquidationEnabled: boolean;
}

interface BotStore {
  bots: TradingBot[];
  paperMode: boolean;
  globalKillSwitch: boolean;
  safetySettings: SafetySettings;
  consecutiveLosses: number;
  lastLossTime: number | null;
  dailyPnl: number;
  loading: boolean;
  error: string | null;

  createBot: (name: string, strategy: string) => Promise<void>;
  startBot: (botId: string) => Promise<void>;
  stopBot: (botId: string) => Promise<void>;
  toggleGlobalKillSwitch: () => void;
  updateSafetySettings: (settings: Partial<SafetySettings>) => void;
  emergencyLiquidate: () => void;
  recordLoss: () => void;
  canTrade: () => boolean;
  getBot: (botId: string) => TradingBot | undefined;
}

// Initial paper trading bots for demo
const PAPER_BOTS: TradingBot[] = [
  {
    id: "demo-1",
    name: "Grid Trader Alpha",
    strategy: "Grid Trading on BTC/USD",
    status: "idle",
    mode: "paper",
    balance: 10000,
    pnl: 247.5,
    pnlPercent: 2.47,
    activeTrades: 0,
    createdAt: Date.now() - 86400000,
    lastUpdated: Date.now(),
  },
  {
    id: "demo-2",
    name: "Arb Monkey",
    strategy: "Cross-exchange arbitrage",
    status: "idle",
    mode: "paper",
    balance: 5000,
    pnl: 122.75,
    pnlPercent: 2.45,
    activeTrades: 0,
    createdAt: Date.now() - 172800000,
    lastUpdated: Date.now(),
  },
];

export const useBotStore = create<BotStore>((set, get) => ({
  bots: PAPER_BOTS,
  paperMode: true, // ALWAYS start in paper mode for safety
  globalKillSwitch: false,
  safetySettings: {
    maxDailyLossPercent: 5, // 5% max daily loss
    maxPositionSizePercent: 10, // 10% max position size
    cooldownAfterLosses: 300, // 5 minute cooldown after losses
    maxConsecutiveLosses: 3, // Stop after 3 consecutive losses
    emergencyLiquidationEnabled: true,
  },
  consecutiveLosses: 0,
  lastLossTime: null,
  dailyPnl: 0,
  loading: false,
  error: null,

  createBot: async (name: string, strategy: string) => {
    const newBot: TradingBot = {
      id: `bot-${Date.now()}`,
      name,
      strategy,
      status: "idle",
      mode: get().paperMode ? "paper" : "live",
      balance: 1000,
      pnl: 0,
      pnlPercent: 0,
      activeTrades: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
    set((state) => ({
      bots: [...state.bots, newBot],
    }));
  },

  startBot: async (botId: string) => {
    const { canTrade, globalKillSwitch } = get();
    
    if (globalKillSwitch) {
      set({ error: "Global kill switch is active. Cannot start bot." });
      return;
    }
    
    if (!canTrade()) {
      set({ error: "Trading is currently blocked due to safety limits." });
      return;
    }
    
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === botId ? { ...bot, status: "running" } : bot,
      ),
    }));
  },

  stopBot: async (botId: string) => {
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === botId ? { ...bot, status: "stopped" } : bot,
      ),
    }));
  },

  toggleGlobalKillSwitch: () => {
    set((state) => ({
      globalKillSwitch: !state.globalKillSwitch,
    }));
  },

  updateSafetySettings: (settings: Partial<SafetySettings>) => {
    set((state) => ({
      safetySettings: { ...state.safetySettings, ...settings },
    }));
  },

  emergencyLiquidate: () => {
    const { safetySettings } = get();
    if (!safetySettings.emergencyLiquidationEnabled) return;
    
    set((state) => ({
      globalKillSwitch: true,
      bots: state.bots.map((bot) => ({
        ...bot,
        status: "stopped",
        activeTrades: 0,
      })),
    }));
  },

  recordLoss: () => {
    set((state) => ({
      consecutiveLosses: state.consecutiveLosses + 1,
      lastLossTime: Date.now(),
    }));
  },

  canTrade: () => {
    const { safetySettings, consecutiveLosses, lastLossTime, dailyPnl, globalKillSwitch } = get();
    
    if (globalKillSwitch) return false;
    
    // Check consecutive losses
    if (consecutiveLosses >= safetySettings.maxConsecutiveLosses) {
      return false;
    }
    
    // Check cooldown after losses
    if (lastLossTime) {
      const timeSinceLastLoss = (Date.now() - lastLossTime) / 1000;
      if (timeSinceLastLoss < safetySettings.cooldownAfterLosses) {
        return false;
      }
    }
    
    // Check daily loss limit
    if (dailyPnl < -safetySettings.maxDailyLossPercent) {
      return false;
    }
    
    return true;
  },

  getBot: (botId: string) => {
    return get().bots.find((bot) => bot.id === botId);
  },
}));
