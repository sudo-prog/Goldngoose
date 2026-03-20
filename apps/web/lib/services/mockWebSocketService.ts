"use client";

import { WebSocketMessage, WebSocketConfig } from "./websocketService";

/**
 * Mock WebSocket Service for testing and development
 * Provides simulated real-time data without actual WebSocket connections
 */
class MockWebSocketService {
  private subscribers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private mockData: Map<string, any[]> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock data for different endpoints
   */
  private initializeMockData(): void {
    // Binance mini ticker mock data
    this.mockData.set("binance-mini-ticker", [
      {
        e: "24hrMiniTicker",
        E: Date.now(),
        s: "BTCUSDT",
        c: "43250.50",
        o: "42800.00",
        h: "43500.00",
        l: "42500.00",
        v: "1234.56",
        q: "53456789.12"
      },
      {
        e: "24hrMiniTicker",
        E: Date.now(),
        s: "ETHUSDT",
        c: "2650.75",
        o: "2600.00",
        h: "2680.00",
        l: "2580.00",
        v: "5678.90",
        q: "15045678.90"
      }
    ]);

    // Polymarket mock data
    this.mockData.set("polymarket", [
      {
        id: "mock-1",
        question: "Will Bitcoin reach $100k by end of 2026?",
        lastTradePrice: 0.65,
        volume: 125000,
        liquidity: 45000
      },
      {
        id: "mock-2",
        question: "Will Ethereum flip Bitcoin by market cap in 2026?",
        lastTradePrice: 0.15,
        volume: 85000,
        liquidity: 32000
      }
    ]);

    // News mock data
    this.mockData.set("news", [
      {
        id: "news-1",
        title: "Bitcoin ETF sees record inflows",
        source: "CoinDesk",
        timestamp: Date.now() - 3600000,
        sentiment: "bullish"
      },
      {
        id: "news-2",
        title: "Ethereum Shanghai upgrade successful",
        source: "TheBlock",
        timestamp: Date.now() - 7200000,
        sentiment: "bullish"
      }
    ]);
  }

  /**
   * Start mock data generation for an endpoint
   */
  startMockStream(endpoint: string, config: WebSocketConfig): void {
    if (this.isRunning && this.intervals.has(endpoint)) {
      console.log(`[MockWebSocket] Stream already running for ${endpoint}`);
      return;
    }

    console.log(`[MockWebSocket] Starting mock stream for ${endpoint}`);
    this.isRunning = true;

    // Generate initial data
    this.generateMockData(endpoint);

    // Set up interval for continuous data generation
    const interval = setInterval(() => {
      this.generateMockData(endpoint);
    }, 2000); // Generate new data every 2 seconds

    this.intervals.set(endpoint, interval);
  }

  /**
   * Generate mock data for a specific endpoint
   */
  private generateMockData(endpoint: string): void {
    const subscribers = this.subscribers.get(endpoint);
    if (!subscribers || subscribers.size === 0) return;

    let mockData: any;

    switch (endpoint) {
      case "binance-mini-ticker":
        mockData = this.generateBinanceTickerData();
        break;
      case "polymarket":
        mockData = this.generatePolymarketData();
        break;
      case "news":
        mockData = this.generateNewsData();
        break;
      default:
        mockData = { type: "unknown", data: {} };
    }

    const message: WebSocketMessage = {
      type: endpoint,
      data: mockData,
      timestamp: Date.now()
    };

    // Notify all subscribers
    subscribers.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error(`[MockWebSocket] Error in callback for ${endpoint}:`, error);
      }
    });
  }

  /**
   * Generate mock Binance ticker data
   */
  private generateBinanceTickerData(): any[] {
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"];
    const basePrices = {
      "BTCUSDT": 43000,
      "ETHUSDT": 2600,
      "BNBUSDT": 320,
      "ADAUSDT": 0.65,
      "SOLUSDT": 120
    };

    return symbols.map((symbol) => {
      const basePrice = basePrices[symbol as keyof typeof basePrices] || 100;
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      const currentPrice = basePrice * (1 + change);
      const openPrice = basePrice * (1 + (Math.random() - 0.5) * 0.01);

      return {
        e: "24hrMiniTicker",
        E: Date.now(),
        s: symbol,
        c: currentPrice.toFixed(2),
        o: openPrice.toFixed(2),
        h: (currentPrice * 1.01).toFixed(2),
        l: (currentPrice * 0.99).toFixed(2),
        v: (Math.random() * 10000).toFixed(2),
        q: (Math.random() * 100000000).toFixed(2)
      };
    });
  }

  /**
   * Generate mock Polymarket data
   */
  private generatePolymarketData(): any[] {
    const markets = this.mockData.get("polymarket") || [];
    
    return markets.map((market) => ({
      ...market,
      lastTradePrice: Math.max(0.01, Math.min(0.99, market.lastTradePrice + (Math.random() - 0.5) * 0.05)),
      volume: market.volume + Math.floor(Math.random() * 1000),
      liquidity: market.liquidity + Math.floor(Math.random() * 500)
    }));
  }

  /**
   * Generate mock news data
   */
  private generateNewsData(): any[] {
    const newsTemplates = [
      { title: "Bitcoin breaks resistance at $44,000", sentiment: "bullish" },
      { title: "Ethereum gas fees reach 6-month low", sentiment: "bullish" },
      { title: "SEC delays decision on Bitcoin ETF", sentiment: "neutral" },
      { title: "Major exchange reports security breach", sentiment: "bearish" },
      { title: "Institutional adoption increases", sentiment: "bullish" }
    ];

    const randomNews = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
    
    return [
      {
        id: `news-${Date.now()}`,
        title: randomNews.title,
        source: ["CoinDesk", "TheBlock", "Reuters", "Bloomberg"][Math.floor(Math.random() * 4)],
        timestamp: Date.now() - Math.floor(Math.random() * 3600000),
        sentiment: randomNews.sentiment
      }
    ];
  }

  /**
   * Subscribe to mock data stream
   */
  subscribe(
    endpoint: string,
    callback: (message: WebSocketMessage) => void
  ): string {
    const subscriptionId = `mock-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!this.subscribers.has(endpoint)) {
      this.subscribers.set(endpoint, new Set());
    }
    
    this.subscribers.get(endpoint)!.add(callback);
    
    console.log(`[MockWebSocket] Subscribed to ${endpoint} with ID ${subscriptionId}`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from mock data stream
   */
  unsubscribe(endpoint: string, callback: (message: WebSocketMessage) => void): void {
    const subscribers = this.subscribers.get(endpoint);
    if (subscribers) {
      subscribers.delete(callback);
      
      // If no more subscribers, stop the stream
      if (subscribers.size === 0) {
        this.stopMockStream(endpoint);
      }
    }
  }

  /**
   * Stop mock data stream for an endpoint
   */
  stopMockStream(endpoint: string): void {
    const interval = this.intervals.get(endpoint);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(endpoint);
      console.log(`[MockWebSocket] Stopped mock stream for ${endpoint}`);
    }
    
    this.subscribers.delete(endpoint);
  }

  /**
   * Stop all mock data streams
   */
  stopAllStreams(): void {
    for (const endpoint of this.intervals.keys()) {
      this.stopMockStream(endpoint);
    }
    this.isRunning = false;
    console.log("[MockWebSocket] Stopped all mock streams");
  }

  /**
   * Get current mock data for an endpoint
   */
  getMockData(endpoint: string): any[] {
    return this.mockData.get(endpoint) || [];
  }

  /**
   * Update mock data for an endpoint
   */
  updateMockData(endpoint: string, data: any[]): void {
    this.mockData.set(endpoint, data);
  }

  /**
   * Check if mock service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get list of active mock streams
   */
  getActiveStreams(): string[] {
    return Array.from(this.intervals.keys());
  }
}

// Export singleton instance
export const mockWebSocketService = new MockWebSocketService();

// Export for testing
export { MockWebSocketService };