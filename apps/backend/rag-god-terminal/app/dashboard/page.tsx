"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TradingTerminal() {
  const [mode, setMode] = useState(0);
  const [paperPnl, setPaperPnl] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [whaleAlert, setWhaleAlert] = useState("");

  // Simple fetch for status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        if (res.ok) {
          const data = await res.json();
          setMode(data.mode);
          setPaperPnl(data.paper_pnl);
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("error");
        }
      } catch (error) {
        setConnectionStatus("disconnected");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simple WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    
    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "live_update") {
          setPaperPnl(data.paper_pnl);
          setMode(data.mode);
        } else if (data.type === "mode_change") {
          setMode(data.new_mode);
        } else if (data.type === "execution_result") {
          setPaperPnl(data.paper_pnl);
        } else if (data.type === "whale_alert") {
          setWhaleAlert(data.message);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = () => {
      setConnectionStatus("error");
    };

    return () => ws.close();
  }, []);

  const switchMode = async (newMode: number) => {
    try {
      const res = await fetch("http://localhost:8000/switch-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_mode: newMode }),
      });
      const result = await res.json();
      setMode(result.mode);
    } catch (error) {
      console.error("Failed to switch mode:", error);
    }
  };

  const executeOrder = async () => {
    const size = (document.getElementById("size") as HTMLInputElement)?.value;
    const price = (document.getElementById("price") as HTMLInputElement)?.value;
    const market = (document.getElementById("market") as HTMLInputElement)?.value;

    if (!size || !price || !market) {
      alert("Please fill in all order fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: parseFloat(size),
          price: parseFloat(price),
          market: market
        }),
      });
      const result = await res.json();
      console.log("Execution result:", result);
    } catch (error) {
      console.error("Execution failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">RAG_GOD Terminal</h1>
          <p className="text-muted-foreground">AI-Powered Prediction Market Trading</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
            WebSocket: {connectionStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current mode and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Mode:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mode}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {mode === 3 ? "— BEAST MODE" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Paper Mirror PnL:</span>
                  <Badge variant={paperPnl >= 0 ? "default" : "destructive"}>
                    {paperPnl >= 0 ? "+" : ""}{paperPnl.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Live PnL:</span>
                  <Badge variant="secondary">+0.03%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Mode Selection</CardTitle>
                <CardDescription>Switch between RAG_GOD operating modes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? "default" : "outline"}
                      onClick={() => switchMode(m)}
                      className="w-full"
                    >
                      Mode {m}
                      {mode === m && <span className="ml-2">✓</span>}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {getModeDescription(mode)}
                </div>
              </CardContent>
            </Card>

            {/* Simple PnL Display */}
            <Card>
              <CardHeader>
                <CardTitle>Paper Mirror PnL</CardTitle>
                <CardDescription>Real-time performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {paperPnl >= 0 ? "+" : ""}{paperPnl.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Current PnL</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>Execute Order</CardTitle>
                <CardDescription>Send order through RAG_GOD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <input
                      id="size"
                      type="number"
                      placeholder="100"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.65"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Market</label>
                  <input
                    id="market"
                    type="text"
                    placeholder="BTC"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <Button 
                  onClick={executeOrder}
                  className="w-full"
                >
                  Execute via RAG_GOD
                </Button>
              </CardContent>
            </Card>

            {/* Whale Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Whale Alerts</CardTitle>
                <CardDescription>Real-time whale activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {whaleAlert ? (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{whaleAlert}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No whale activity detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mode Details */}
            <Card>
              <CardHeader>
                <CardTitle>Mode Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {getModeFeatures(mode).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getModeDescription(mode: number): string {
  const descriptions = {
    0: "Meta-researcher + Whale ingestion → Paper mirror",
    1: "Full retrieval + Mem0 context → Paper mirror",
    2: "Live execution with risk guard → Paper mirror",
    3: "Self-evolution + Auto-Evolution Lab → Paper mirror"
  };
  return descriptions[mode] || "Unknown mode";
}

function getModeFeatures(mode: number): string[] {
  const features = {
    0: ["Market sentiment analysis", "Whale activity patterns", "Basic trend identification"],
    1: ["Deep market analysis", "Multi-source data correlation", "Advanced pattern recognition"],
    2: ["Real-time market dynamics", "Execution optimization", "Risk-adjusted returns"],
    3: ["Strategy evolution", "Performance optimization", "System improvement"]
  };
  return features[mode] || ["General market analysis"];
}