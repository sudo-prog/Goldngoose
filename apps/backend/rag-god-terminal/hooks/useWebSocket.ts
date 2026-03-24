"use client";

import { useEffect, useState, useRef } from "react";

interface WebSocketMessage {
  type: string;
  paper_pnl?: number;
  mode?: number;
  whale_alert?: string;
  order?: any;
  result?: any;
  old_mode?: number;
  new_mode?: number;
  timestamp?: string;
}

export function useWebSocket(url: string) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [latestUpdate, setLatestUpdate] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const connect = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnectionStatus("connected");
        console.log("WebSocket connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLatestUpdate(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus("disconnected");
        console.log("WebSocket disconnected, attempting to reconnect...");
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus("disconnected");
      
      // Attempt to reconnect after 5 seconds
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  };

  return {
    connectionStatus,
    latestUpdate,
    sendMessage
  };
}