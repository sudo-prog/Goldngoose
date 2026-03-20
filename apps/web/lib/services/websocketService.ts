"use client";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export interface WebSocketSubscription {
  id: string;
  callback: (message: WebSocketMessage) => void;
  filter?: (message: WebSocketMessage) => boolean;
}

class WebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, WebSocketSubscription[]> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private config: Map<string, WebSocketConfig> = new Map();
  private mockMode: boolean = false;

  constructor() {
    this.mockMode = typeof window === "undefined" || process.env.NODE_ENV === "test";
  }

  /**
   * Connect to a WebSocket endpoint
   */
  connect(endpoint: string, config: WebSocketConfig): void {
    if (this.mockMode) {
      console.log(`[WebSocket] Mock mode: Would connect to ${endpoint}`);
      return;
    }

    if (this.connections.has(endpoint)) {
      console.warn(`[WebSocket] Already connected to ${endpoint}`);
      return;
    }

    this.config.set(endpoint, config);
    this.reconnectAttempts.set(endpoint, 0);

    this.createConnection(endpoint);
  }

  /**
   * Create a new WebSocket connection
   */
  private createConnection(endpoint: string): void {
    const config = this.config.get(endpoint);
    if (!config) return;

    try {
      const ws = new WebSocket(config.url);

      ws.onopen = () => {
        console.log(`[WebSocket] Connected to ${endpoint}`);
        this.reconnectAttempts.set(endpoint, 0);
        config.onOpen?.();
      };

      ws.onclose = () => {
        console.log(`[WebSocket] Disconnected from ${endpoint}`);
        this.connections.delete(endpoint);
        config.onClose?.();
        this.handleReconnect(endpoint);
      };

      ws.onerror = (error) => {
        console.error(`[WebSocket] Error on ${endpoint}:`, error);
        config.onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = {
            type: "message",
            data: JSON.parse(event.data),
            timestamp: Date.now(),
          };
          
          this.handleMessage(endpoint, message);
          config.onMessage?.(message);
        } catch (error) {
          console.error(`[WebSocket] Failed to parse message from ${endpoint}:`, error);
        }
      };

      this.connections.set(endpoint, ws);
    } catch (error) {
      console.error(`[WebSocket] Failed to create connection to ${endpoint}:`, error);
      this.handleReconnect(endpoint);
    }
  }

  /**
   * Handle message distribution to subscribers
   */
  private handleMessage(endpoint: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(endpoint) || [];
    
    subscribers.forEach((subscription) => {
      try {
        if (!subscription.filter || subscription.filter(message)) {
          subscription.callback(message);
        }
      } catch (error) {
        console.error(`[WebSocket] Error in subscription callback for ${endpoint}:`, error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(endpoint: string): void {
    const config = this.config.get(endpoint);
    if (!config) return;

    const reconnectInterval = config.reconnectInterval || 5000;
    const maxReconnectAttempts = config.maxReconnectAttempts || 5;
    const currentAttempts = this.reconnectAttempts.get(endpoint) || 0;

    if (currentAttempts >= maxReconnectAttempts) {
      console.error(`[WebSocket] Max reconnect attempts reached for ${endpoint}`);
      return;
    }

    this.reconnectAttempts.set(endpoint, currentAttempts + 1);

    setTimeout(() => {
      console.log(`[WebSocket] Attempting to reconnect to ${endpoint} (attempt ${currentAttempts + 1}/${maxReconnectAttempts})`);
      this.createConnection(endpoint);
    }, reconnectInterval);
  }

  /**
   * Subscribe to messages from a specific endpoint
   */
  subscribe(
    endpoint: string,
    callback: (message: WebSocketMessage) => void,
    filter?: (message: WebSocketMessage) => boolean
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      callback,
      filter,
    };

    if (!this.subscriptions.has(endpoint)) {
      this.subscriptions.set(endpoint, []);
    }

    this.subscriptions.get(endpoint)!.push(subscription);
    
    console.log(`[WebSocket] Subscribed to ${endpoint} with ID ${subscriptionId}`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(endpoint: string, subscriptionId: string): void {
    const subscribers = this.subscriptions.get(endpoint);
    if (!subscribers) return;

    const index = subscribers.findIndex((sub) => sub.id === subscriptionId);
    if (index !== -1) {
      subscribers.splice(index, 1);
      console.log(`[WebSocket] Unsubscribed from ${endpoint} with ID ${subscriptionId}`);
    }
  }

  /**
   * Send a message to a specific endpoint
   */
  send(endpoint: string, data: any): void {
    if (this.mockMode) {
      console.log(`[WebSocket] Mock mode: Would send to ${endpoint}:`, data);
      return;
    }

    const ws = this.connections.get(endpoint);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error(`[WebSocket] Cannot send to ${endpoint}: not connected`);
      return;
    }

    try {
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error(`[WebSocket] Failed to send to ${endpoint}:`, error);
    }
  }

  /**
   * Disconnect from a specific endpoint
   */
  disconnect(endpoint: string): void {
    const ws = this.connections.get(endpoint);
    if (ws) {
      ws.close();
      this.connections.delete(endpoint);
    }
    
    this.subscriptions.delete(endpoint);
    this.reconnectAttempts.delete(endpoint);
    this.config.delete(endpoint);
    
    console.log(`[WebSocket] Disconnected from ${endpoint}`);
  }

  /**
   * Disconnect from all endpoints
   */
  disconnectAll(): void {
    for (const endpoint of this.connections.keys()) {
      this.disconnect(endpoint);
    }
  }

  /**
   * Get connection status
   */
  isConnected(endpoint: string): boolean {
    if (this.mockMode) return true;
    
    const ws = this.connections.get(endpoint);
    return ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get all connected endpoints
   */
  getConnectedEndpoints(): string[] {
    return Array.from(this.connections.keys()).filter((endpoint) => 
      this.isConnected(endpoint)
    );
  }

  /**
   * Enable mock mode for testing
   */
  enableMockMode(): void {
    this.mockMode = true;
    console.log("[WebSocket] Mock mode enabled");
  }

  /**
   * Disable mock mode
   */
  disableMockMode(): void {
    this.mockMode = false;
    console.log("[WebSocket] Mock mode disabled");
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export for testing
export { WebSocketService };