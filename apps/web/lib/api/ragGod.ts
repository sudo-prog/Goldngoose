/**
 * RAG_GOD API Client
 * Functions to interact with the RAG_GOD backend service
 */

const BASE_URL = process.env.NEXT_PUBLIC_RAG_GOD_URL || 'http://localhost:8000';

export interface StatusResponse {
  mode: number;
  mode_description: string;
  paper_pnl: number;
  live_pnl: number;
  whale_alert: string;
  status: string;
  paper_mode: boolean;
  timestamp: string;
}

export interface ModeSwitchResponse {
  status: string;
  mode: number;
  description: string;
}

export interface ExecuteOrderRequest {
  size: number;
  price: number;
  market: string;
  side?: string;
  order_type?: string;
}

export interface ExecuteOrderResponse {
  status: string;
  order: ExecuteOrderRequest;
  result: any;
  paper_pnl: number;
  mode: number;
}

export interface HealthResponse {
  status: string;
  components?: Record<string, boolean>;
  mode: number;
  paper_mirror: boolean;
  error?: string;
}

export interface ModeInfoResponse {
  mode: number;
  description: string;
  features: string[];
  status: string;
}

export interface PaperMirrorHistoryResponse {
  history: any[];
  total_executions: number;
  current_pnl: number;
}

/**
 * Fetch current system status
 */
export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${BASE_URL}/status`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Switch RAG_GOD mode (0-3)
 */
export async function switchMode(newMode: number): Promise<ModeSwitchResponse> {
  const res = await fetch(`${BASE_URL}/switch-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_mode: newMode }),
  });

  if (!res.ok) {
    throw new Error(`Failed to switch mode: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Execute a trade order through RAG_GOD
 */
export async function executeOrder(order: ExecuteOrderRequest): Promise<ExecuteOrderResponse> {
  const res = await fetch(`${BASE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    throw new Error(`Failed to execute order: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Check backend health
 */
export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get information about a specific mode
 */
export async function getModeInfo(modeNum: number): Promise<ModeInfoResponse> {
  const res = await fetch(`${BASE_URL}/mode/${modeNum}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get mode info: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get paper mirror execution history
 */
export async function getPaperMirrorHistory(): Promise<PaperMirrorHistoryResponse> {
  const res = await fetch(`${BASE_URL}/paper-mirror/history`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get paper mirror history: ${res.statusText}`);
  }

  return res.json();
}
