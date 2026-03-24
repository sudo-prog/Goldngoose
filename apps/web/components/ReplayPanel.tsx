"use client";

import { useState, useMemo } from "react";

interface ReplayEvent {
  timestamp: Date;
  type: "trade" | "signal" | "alert";
  description: string;
  pnl?: number;
}

const MOCK_EVENTS: ReplayEvent[] = [
  {
    timestamp: new Date(Date.now() - 3600000 * 24),
    type: "signal",
    description: "SMA Crossover: BTC buy signal triggered",
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 23),
    type: "trade",
    description: "Opened LONG BTC @ $61,250",
    pnl: 0,
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 20),
    type: "alert",
    description: "Whale movement detected: 500 BTC transferred",
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 18),
    type: "trade",
    description: "Closed LONG BTC @ $62,100",
    pnl: 850,
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 15),
    type: "signal",
    description: "RSI overbought: ETH sell signal",
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 12),
    type: "trade",
    description: "Opened SHORT ETH @ $3,420",
    pnl: 0,
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 8),
    type: "alert",
    description: "High volatility detected in SOL",
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 4),
    type: "trade",
    description: "Closed SHORT ETH @ $3,380",
    pnl: 240,
  },
];

export function ReplayPanel() {
  const [currentIndex, setCurrentIndex] = useState(MOCK_EVENTS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const visibleEvents = useMemo(
    () => MOCK_EVENTS.slice(0, currentIndex + 1),
    [currentIndex]
  );

  const totalPnl = useMemo(
    () => visibleEvents.reduce((sum, e) => sum + (e.pnl || 0), 0),
    [visibleEvents]
  );

  const handlePlay = () => {
    if (currentIndex >= MOCK_EVENTS.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);

    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= MOCK_EVENTS.length - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "trade":
        return "💰";
      case "signal":
        return "📡";
      case "alert":
        return "⚠️";
      default:
        return "📌";
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            {MOCK_EVENTS[0].timestamp.toLocaleDateString()}
          </span>
          <span>
            {MOCK_EVENTS[MOCK_EVENTS.length - 1].timestamp.toLocaleDateString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MOCK_EVENTS.length - 1}
          value={currentIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentIndex(parseInt(e.target.value));
          }}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-goldngoose-neon"
        />
        <div className="text-center text-sm text-slate-400">
          Event {currentIndex + 1} of {MOCK_EVENTS.length}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentIndex(Math.max(0, currentIndex - 1));
          }}
          className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
        >
          ⏮️
        </button>
        <button
          onClick={handlePlay}
          className="px-4 py-1 bg-goldngoose-neon/20 text-goldngoose-neon rounded hover:bg-goldngoose-neon/30"
        >
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentIndex(Math.min(MOCK_EVENTS.length - 1, currentIndex + 1));
          }}
          className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
        >
          ⏭️
        </button>
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="bg-slate-700 text-white text-xs rounded px-2 py-1"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      {/* P&L Summary */}
      <div className="bg-slate-800/50 p-3 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Cumulative P&L</span>
          <span
            className={`text-lg font-bold ${
              totalPnl >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {visibleEvents.map((event, index) => (
          <div
            key={index}
            className={`p-2 rounded text-xs ${
              index === currentIndex
                ? "bg-goldngoose-neon/20 border border-goldngoose-neon/50"
                : "bg-slate-800/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{getEventIcon(event.type)}</span>
              <span className="text-slate-500">
                {event.timestamp.toLocaleTimeString()}
              </span>
              {event.pnl !== undefined && (
                <span
                  className={`ml-auto ${
                    event.pnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {event.pnl >= 0 ? "+" : ""}${event.pnl}
                </span>
              )}
            </div>
            <p className="text-slate-300">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}