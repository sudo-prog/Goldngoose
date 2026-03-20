import { create } from "zustand";

export interface Position {
  id: string;
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercentage: number;
  liquidationPrice: number;
  openedAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  totalBalance: number;
  availableBalance: number;
  totalPnl: number;
  totalPnlPercentage: number;
  positions: Position[];
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
}

interface PortfolioStore {
  portfolio: Portfolio;
  loading: boolean;
  error: string | null;
  
  // Actions
  updatePositionPrice: (symbol: string, currentPrice: number) => void;
  addPosition: (position: Omit<Position, "id" | "pnl" | "pnlPercentage" | "updatedAt">) => void;
  closePosition: (positionId: string) => void;
  updateLeverage: (positionId: string, leverage: number) => void;
  calculatePnl: (position: Position) => { pnl: number; pnlPercentage: number };
}

const calculatePnlForPosition = (position: Position): { pnl: number; pnlPercentage: number } => {
  const priceDiff = position.currentPrice - position.entryPrice;
  const direction = position.side === "long" ? 1 : -1;
  const pnl = direction * priceDiff * position.quantity * position.leverage;
  const pnlPercentage = (pnl / position.margin) * 100;
  return { pnl, pnlPercentage };
};

const calculateLiquidationPrice = (position: Position): number => {
  const maintenanceMarginRate = 0.005; // 0.5%
  if (position.side === "long") {
    return position.entryPrice * (1 - (1 / position.leverage) + maintenanceMarginRate);
  } else {
    return position.entryPrice * (1 + (1 / position.leverage) - maintenanceMarginRate);
  }
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: {
    totalBalance: 10000,
    availableBalance: 10000,
    totalPnl: 0,
    totalPnlPercentage: 0,
    positions: [],
    winRate: 0,
    totalTrades: 0,
    profitableTrades: 0,
  },
  loading: false,
  error: null,

  updatePositionPrice: (symbol: string, currentPrice: number) => {
    set((state) => {
      const updatedPositions = state.portfolio.positions.map((pos) => {
        if (pos.symbol === symbol) {
          const updated = { ...pos, currentPrice, updatedAt: new Date() };
          const { pnl, pnlPercentage } = calculatePnlForPosition(updated);
          return { ...updated, pnl, pnlPercentage };
        }
        return pos;
      });

      const totalPnl = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
      const totalPnlPercentage = (totalPnl / state.portfolio.totalBalance) * 100;

      return {
        portfolio: {
          ...state.portfolio,
          positions: updatedPositions,
          totalPnl,
          totalPnlPercentage,
        },
      };
    });
  },

  addPosition: (position) => {
    const id = `pos-${Date.now()}`;
    const newPosition: Position = {
      ...position,
      id,
      pnl: 0,
      pnlPercentage: 0,
      liquidationPrice: calculateLiquidationPrice(position as Position),
      updatedAt: new Date(),
    };

    set((state) => {
      const usedMargin = state.portfolio.positions.reduce((sum, pos) => sum + pos.margin, 0);
      const availableBalance = state.portfolio.totalBalance - usedMargin - position.margin;

      if (availableBalance < 0) {
        return { error: "Insufficient margin" };
      }

      return {
        portfolio: {
          ...state.portfolio,
          positions: [...state.portfolio.positions, newPosition],
          availableBalance,
          totalTrades: state.portfolio.totalTrades + 1,
        },
      };
    });
  },

  closePosition: (positionId: string) => {
    set((state) => {
      const position = state.portfolio.positions.find((p) => p.id === positionId);
      if (!position) return state;

      const isProfitable = position.pnl > 0;
      const newProfitableTrades = state.portfolio.profitableTrades + (isProfitable ? 1 : 0);
      const newTotalTrades = state.portfolio.totalTrades;
      const winRate = newTotalTrades > 0 ? (newProfitableTrades / newTotalTrades) * 100 : 0;

      const updatedPositions = state.portfolio.positions.filter((p) => p.id !== positionId);
      const totalPnl = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
      const usedMargin = updatedPositions.reduce((sum, pos) => sum + pos.margin, 0);
      const availableBalance = state.portfolio.totalBalance - usedMargin + position.margin + position.pnl;

      return {
        portfolio: {
          ...state.portfolio,
          positions: updatedPositions,
          availableBalance,
          totalBalance: state.portfolio.totalBalance + position.pnl,
          totalPnl,
          totalPnlPercentage: (totalPnl / state.portfolio.totalBalance) * 100,
          profitableTrades: newProfitableTrades,
          winRate,
        },
      };
    });
  },

  updateLeverage: (positionId: string, leverage: number) => {
    set((state) => {
      const updatedPositions = state.portfolio.positions.map((pos) => {
        if (pos.id === positionId) {
          const updated = {
            ...pos,
            leverage,
            liquidationPrice: calculateLiquidationPrice({ ...pos, leverage }),
            updatedAt: new Date(),
          };
          const { pnl, pnlPercentage } = calculatePnlForPosition(updated);
          return { ...updated, pnl, pnlPercentage };
        }
        return pos;
      });

      return {
        portfolio: {
          ...state.portfolio,
          positions: updatedPositions,
        },
      };
    });
  },

  calculatePnl: calculatePnlForPosition,
}));