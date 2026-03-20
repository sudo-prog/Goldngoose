import { create } from "zustand";
import axios from "axios";

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  timestamp: Date;
  pnl?: number;
}

export interface BacktestConfig {
  symbol: string;
  strategy: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
}

export interface BacktestResults {
  id: string;
  config: BacktestConfig;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercentage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  trades: Trade[];
  equityCurve: { timestamp: number; value: number }[];
  status: "idle" | "loading" | "running" | "completed" | "error";
  error?: string;
}

interface BacktesterStore {
  results: BacktestResults | null;
  historicalData: CandleData[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchHistoricalData: (symbol: string, interval: string, startTime: number, endTime: number) => Promise<void>;
  runBacktest: (config: BacktestConfig) => Promise<void>;
  resetBacktest: () => void;
  getStrategyList: () => string[];
}

// Simple moving average crossover strategy
const smaCrossoverStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  // Calculate SMAs
  const shortPeriod = 10;
  const longPeriod = 30;
  
  for (let i = longPeriod; i < data.length; i++) {
    // Calculate short SMA
    let shortSum = 0;
    for (let j = i - shortPeriod + 1; j <= i; j++) {
      shortSum += data[j].close;
    }
    const shortSma = shortSum / shortPeriod;
    
    // Calculate long SMA
    let longSum = 0;
    for (let j = i - longPeriod + 1; j <= i; j++) {
      longSum += data[j].close;
    }
    const longSma = longSum / longPeriod;
    
    const currentPrice = data[i].close;
    
    // Entry logic
    if (!position) {
      if (shortSma > longSma) {
        // Buy signal
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      } else if (shortSma < longSma) {
        // Sell signal (short)
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
    } else {
      // Exit logic
      let shouldExit = false;
      let exitReason = "";
      
      // Check stop loss and take profit
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss) {
          shouldExit = true;
          exitReason = "stop_loss";
        } else if (pnlPercentage >= config.takeProfit) {
          shouldExit = true;
          exitReason = "take_profit";
        } else if (shortSma < longSma) {
          shouldExit = true;
          exitReason = "signal";
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss) {
          shouldExit = true;
          exitReason = "stop_loss";
        } else if (pnlPercentage >= config.takeProfit) {
          shouldExit = true;
          exitReason = "take_profit";
        } else if (shortSma > longSma) {
          shouldExit = true;
          exitReason = "signal";
        }
      }
      
      if (shouldExit) {
        // Close position
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    // Record equity
    equityCurve.push({
      timestamp: data[i].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

// RSI strategy
const rsiStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  const period = 14;
  const overbought = 70;
  const oversold = 30;
  
  // Calculate RSI
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  for (let i = period; i < data.length; i++) {
    // Calculate average gain and loss
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let j = i - period; j < i; j++) {
      avgGain += gains[j];
      avgLoss += losses[j];
    }
    avgGain /= period;
    avgLoss /= period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    const currentPrice = data[i].close;
    
    // Entry logic
    if (!position) {
      if (rsi < oversold) {
        // Buy signal
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      } else if (rsi > overbought) {
        // Sell signal (short)
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
    } else {
      // Exit logic
      let shouldExit = false;
      
      if (position.side === "long" && rsi > overbought) {
        shouldExit = true;
      } else if (position.side === "short" && rsi < oversold) {
        shouldExit = true;
      }
      
      // Check stop loss and take profit
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        }
      }
      
      if (shouldExit) {
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    // Record equity
    equityCurve.push({
      timestamp: data[i].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

// MACD strategy
const macdStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  const fastPeriod = 12;
  const slowPeriod = 26;
  const signalPeriod = 9;
  
  // Calculate EMA
  const calculateEMA = (period: number, startIndex: number): number => {
    let sum = 0;
    for (let i = startIndex - period + 1; i <= startIndex; i++) {
      sum += data[i].close;
    }
    return sum / period;
  };
  
  const macdLine: number[] = [];
  const signalLine: number[] = [];
  const histogram: number[] = [];
  
  for (let i = slowPeriod; i < data.length; i++) {
    const fastEMA = calculateEMA(fastPeriod, i);
    const slowEMA = calculateEMA(slowPeriod, i);
    const macd = fastEMA - slowEMA;
    macdLine.push(macd);
    
    if (macdLine.length >= signalPeriod) {
      let signalSum = 0;
      for (let j = macdLine.length - signalPeriod; j < macdLine.length; j++) {
        signalSum += macdLine[j];
      }
      const signal = signalSum / signalPeriod;
      signalLine.push(signal);
      histogram.push(macd - signal);
    }
  }
  
  for (let i = signalPeriod; i < macdLine.length; i++) {
    const currentPrice = data[i + slowPeriod].close;
    const macd = macdLine[i];
    const signal = signalLine[i - signalPeriod];
    const prevMacd = macdLine[i - 1];
    const prevSignal = signalLine[i - signalPeriod - 1];
    
    if (!position) {
      // Buy when MACD crosses above signal
      if (prevMacd <= prevSignal && macd > signal) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i + slowPeriod].timestamp),
        });
      }
      // Sell when MACD crosses below signal
      else if (prevMacd >= prevSignal && macd < signal) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i + slowPeriod].timestamp),
        });
      }
    } else {
      let shouldExit = false;
      
      // Check stop loss and take profit
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (prevMacd >= prevSignal && macd < signal) {
          shouldExit = true;
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (prevMacd <= prevSignal && macd > signal) {
          shouldExit = true;
        }
      }
      
      if (shouldExit) {
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i + slowPeriod].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    equityCurve.push({
      timestamp: data[i + slowPeriod].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

// Bollinger Bands strategy
const bollingerBandsStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  const period = 20;
  const stdDevMultiplier = 2;
  
  for (let i = period; i < data.length; i++) {
    // Calculate SMA
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const sma = sum / period;
    
    // Calculate standard deviation
    let squaredDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      squaredDiffSum += Math.pow(data[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(squaredDiffSum / period);
    
    const upperBand = sma + (stdDevMultiplier * stdDev);
    const lowerBand = sma - (stdDevMultiplier * stdDev);
    
    const currentPrice = data[i].close;
    
    if (!position) {
      // Buy when price touches lower band
      if (currentPrice <= lowerBand) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
      // Sell when price touches upper band
      else if (currentPrice >= upperBand) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
    } else {
      let shouldExit = false;
      
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (currentPrice >= sma) {
          shouldExit = true;
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (currentPrice <= sma) {
          shouldExit = true;
        }
      }
      
      if (shouldExit) {
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    equityCurve.push({
      timestamp: data[i].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

// Mean Reversion strategy
const meanReversionStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  const period = 20;
  const zScoreThreshold = 2;
  
  for (let i = period; i < data.length; i++) {
    // Calculate mean and standard deviation
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const mean = sum / period;
    
    let squaredDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      squaredDiffSum += Math.pow(data[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(squaredDiffSum / period);
    
    const currentPrice = data[i].close;
    const zScore = stdDev > 0 ? (currentPrice - mean) / stdDev : 0;
    
    if (!position) {
      // Buy when price is significantly below mean (oversold)
      if (zScore < -zScoreThreshold) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
      // Sell when price is significantly above mean (overbought)
      else if (zScore > zScoreThreshold) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
    } else {
      let shouldExit = false;
      
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (zScore >= 0) {
          shouldExit = true;
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (zScore <= 0) {
          shouldExit = true;
        }
      }
      
      if (shouldExit) {
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    equityCurve.push({
      timestamp: data[i].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

// VWAP (Volume Weighted Average Price) strategy
const vwapStrategy = (
  data: CandleData[],
  config: BacktestConfig
): { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] } => {
  const trades: Trade[] = [];
  const equityCurve: { timestamp: number; value: number }[] = [];
  
  let capital = config.initialCapital;
  let position: { side: "long" | "short"; entryPrice: number; quantity: number } | null = null;
  
  const period = 20;
  
  for (let i = period; i < data.length; i++) {
    // Calculate VWAP
    let sumPriceVolume = 0;
    let sumVolume = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const typicalPrice = (data[j].high + data[j].low + data[j].close) / 3;
      sumPriceVolume += typicalPrice * data[j].volume;
      sumVolume += data[j].volume;
    }
    
    const vwap = sumVolume > 0 ? sumPriceVolume / sumVolume : data[i].close;
    const currentPrice = data[i].close;
    
    if (!position) {
      // Buy when price is below VWAP
      if (currentPrice < vwap * 0.995) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "long", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "buy",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
      // Sell when price is above VWAP
      else if (currentPrice > vwap * 1.005) {
        const quantity = (capital * config.leverage) / currentPrice;
        position = { side: "short", entryPrice: currentPrice, quantity };
        trades.push({
          id: `trade-${trades.length}`,
          type: "sell",
          price: currentPrice,
          quantity,
          timestamp: new Date(data[i].timestamp),
        });
      }
    } else {
      let shouldExit = false;
      
      if (position.side === "long") {
        const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (currentPrice >= vwap) {
          shouldExit = true;
        }
      } else {
        const pnlPercentage = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
        if (pnlPercentage <= -config.stopLoss || pnlPercentage >= config.takeProfit) {
          shouldExit = true;
        } else if (currentPrice <= vwap) {
          shouldExit = true;
        }
      }
      
      if (shouldExit) {
        const exitPrice = currentPrice;
        let pnl: number;
        
        if (position.side === "long") {
          pnl = (exitPrice - position.entryPrice) * position.quantity;
        } else {
          pnl = (position.entryPrice - exitPrice) * position.quantity;
        }
        
        capital += pnl;
        
        trades.push({
          id: `trade-${trades.length}`,
          type: position.side === "long" ? "sell" : "buy",
          price: exitPrice,
          quantity: position.quantity,
          timestamp: new Date(data[i].timestamp),
          pnl,
        });
        
        position = null;
      }
    }
    
    equityCurve.push({
      timestamp: data[i].timestamp,
      value: capital,
    });
  }
  
  return { trades, equityCurve };
};

const strategyMap: Record<string, (data: CandleData[], config: BacktestConfig) => { trades: Trade[]; equityCurve: { timestamp: number; value: number }[] }> = {
  "SMA Crossover": smaCrossoverStrategy,
  "RSI": rsiStrategy,
  "MACD": macdStrategy,
  "Bollinger Bands": bollingerBandsStrategy,
  "Mean Reversion": meanReversionStrategy,
  "VWAP": vwapStrategy,
};

export const useBacktesterStore = create<BacktesterStore>((set, get) => ({
  results: null,
  historicalData: [],
  loading: false,
  error: null,

  fetchHistoricalData: async (symbol: string, interval: string, startTime: number, endTime: number) => {
    set({ loading: true, error: null });
    try {
      // Fetch from Binance API
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`
      );
      
      const candles: CandleData[] = response.data.map((kline: any) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
      
      set({ historicalData: candles, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch historical data",
        loading: false,
      });
    }
  },

  runBacktest: async (config: BacktestConfig) => {
    set({ loading: true, error: null });
    
    try {
      const { historicalData } = get();
      
      if (historicalData.length === 0) {
        throw new Error("No historical data available. Fetch data first.");
      }
      
      const strategy = strategyMap[config.strategy];
      if (!strategy) {
        throw new Error(`Unknown strategy: ${config.strategy}`);
      }
      
      // Run strategy
      const { trades, equityCurve } = strategy(historicalData, config);
      
      // Calculate metrics
      const finalCapital = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : config.initialCapital;
      const totalReturn = finalCapital - config.initialCapital;
      const totalReturnPercentage = (totalReturn / config.initialCapital) * 100;
      
      const profitableTrades = trades.filter((t) => t.pnl && t.pnl > 0).length;
      const losingTrades = trades.filter((t) => t.pnl && t.pnl < 0).length;
      const winRate = trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;
      
      const wins = trades.filter((t) => t.pnl && t.pnl > 0).map((t) => t.pnl!);
      const losses = trades.filter((t) => t.pnl && t.pnl < 0).map((t) => Math.abs(t.pnl!));
      
      const averageWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
      const averageLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
      const profitFactor = averageLoss > 0 ? (averageWin * wins.length) / (averageLoss * losses.length) : 0;
      
      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = config.initialCapital;
      
      for (const point of equityCurve) {
        if (point.value > peak) {
          peak = point.value;
        }
        const drawdown = peak - point.value;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      
      const maxDrawdownPercentage = (maxDrawdown / peak) * 100;
      
      // Calculate Sharpe ratio (simplified)
      const returns = equityCurve.map((p, i) => 
        i === 0 ? 0 : (p.value - equityCurve[i - 1].value) / equityCurve[i - 1].value
      ).slice(1);
      
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const sharpeRatio = variance > 0 ? (avgReturn / Math.sqrt(variance)) * Math.sqrt(252) : 0;
      
      const results: BacktestResults = {
        id: `backtest-${Date.now()}`,
        config,
        finalCapital,
        totalReturn,
        totalReturnPercentage,
        sharpeRatio,
        maxDrawdown,
        maxDrawdownPercentage,
        winRate,
        totalTrades: trades.length,
        profitableTrades,
        losingTrades,
        averageWin,
        averageLoss,
        profitFactor,
        trades,
        equityCurve,
        status: "completed",
      };
      
      set({ results, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Backtest failed",
        loading: false,
      });
    }
  },

  resetBacktest: () => {
    set({ results: null, error: null });
  },

  getStrategyList: () => {
    return Object.keys(strategyMap);
  },
}));