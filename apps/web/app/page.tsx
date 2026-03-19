"use client";

import { Button } from "ui";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-polybloom-dark via-slate-900 to-polybloom-dark">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-white">PolyBloom</span>
          <br />
          <span className="neon-glow">Terminal</span>
        </h1>
        <p className="text-slate-400 text-xl mb-8">
          Ultimate Crypto Bloomberg Terminal + AI Trading Studio
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-12">
        <div className="panel">
          <h3 className="neon-text mb-2">📊 Live Markets</h3>
          <p className="text-slate-300 text-sm">
            Real-time market data from CoinGecko & Binance with 60fps charts
          </p>
        </div>

        <div className="panel">
          <h3 className="neon-text mb-2">🎰 Polymarket</h3>
          <p className="text-slate-300 text-sm">
            Prediction markets, CLOB trading, and Gamma API integration
          </p>
        </div>

        <div className="panel">
          <h3 className="neon-text mb-2">🤖 OpenClaw</h3>
          <p className="text-slate-300 text-sm">
            AI trading strategies with paper-trading by default & safety rails
          </p>
        </div>

        <div className="panel">
          <h3 className="neon-text mb-2">📰 News Radar</h3>
          <p className="text-slate-300 text-sm">
            Auto-matched headlines with sentiment analysis & ROI projections
          </p>
        </div>

        <div className="panel">
          <h3 className="neon-text mb-2">⏮️ Backtester</h3>
          <p className="text-slate-300 text-sm">
            Historical simulation & strategy replay with adaptive algorithms
          </p>
        </div>

        <div className="panel">
          <h3 className="neon-text mb-2">🎨 Multi-Panel Grid</h3>
          <p className="text-slate-300 text-sm">
            Drag, resize, dock panels with golden-layout persistence
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4">
        <Button size="lg" onClick={() => (window.location.href = "/terminal")}>
          Launch Terminal →
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => (window.location.href = "/docs")}
        >
          Documentation
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-slate-700 w-full text-center text-slate-500">
        <p className="text-sm">
          Built with Next.js 15, Expo 52, and powered by crypto x AI 🚀
        </p>
      </div>
    </div>
  );
}
