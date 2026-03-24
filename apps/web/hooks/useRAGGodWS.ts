"use client";

import { useEffect, useState, useRef, useCallback } from 'react';

export interface RAGGodState {
  paper_pnl: number;
  mode: number;
  mode_description: string;
  whale_alert: string;
  paper_mode: boolean;
  timestamp: string;
}

export interface RAGGodMessage {
  type: 'live_update' | 'mode_change' | 'execution_result';
  [key: string]: any;
}

interface UseRAGGodWSOptions {
  url?: string;
  reconnectInterval?: number;
  enabled?: boolean;
}

interface UseRAGGodWSReturn {
  state: RAGGodState | null;
  connected: boolean;
  error: string | null;
  lastMessage: RAGGodMessage | null;
  sendMessage: (message: any) => void;
}

export function useRAGGodWS(options: UseRAGGodWSOptions = {}): UseRAGGodWSReturn {
  const {
    url = 'ws://localhost:8000/ws',
    reconnectInterval = 5000,
    enabled = true,
  } = options;

  const [state, setState] = useState<RAGGodState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<RAGGodMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        console.log('RAG_GOD WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: RAGGodMessage = JSON.parse(event.data);
          setLastMessage(data);

          if (data.type === 'live_update') {
            setState({
              paper_pnl: data.paper_pnl,
              mode: data.mode,
              mode_description: data.mode_description,
              whale_alert: data.whale_alert,
              paper_mode: data.paper_mode,
              timestamp: data.timestamp,
            });
          } else if (data.type === 'mode_change') {
            setState(prev => prev ? {
              ...prev,
              mode: data.new_mode,
              mode_description: data.mode_description,
              timestamp: data.timestamp,
            } : null);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('RAG_GOD WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('RAG_GOD WebSocket disconnected');

        // Attempt to reconnect
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Failed to create WebSocket connection');
    }
  }, [url, reconnectInterval, enabled]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    state,
    connected,
    error,
    lastMessage,
    sendMessage,
  };
}
