"use client";

import { create } from "zustand";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: number;
  sentiment: "bullish" | "neutral" | "bearish";
  relatedMarkets: string[];
  impact: "high" | "medium" | "low";
}

interface NewsStore {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
}

// Demo news items
const DEMO_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Bitcoin Halving Expected Q3 2026",
    source: "CoinDesk",
    timestamp: Date.now() - 3600000,
    sentiment: "bullish",
    relatedMarkets: ["BTC", "ETH"],
    impact: "high",
  },
  {
    id: "news-2",
    title: "Ethereum Shanghai Upgrade Success",
    source: "TheBlock",
    timestamp: Date.now() - 7200000,
    sentiment: "bullish",
    relatedMarkets: ["ETH"],
    impact: "high",
  },
  {
    id: "news-3",
    title: "Regulatory Clarity on Staking",
    source: "Reuters",
    timestamp: Date.now() - 10800000,
    sentiment: "neutral",
    relatedMarkets: ["ETH", "LIDO"],
    impact: "medium",
  },
  {
    id: "news-4",
    title: "Concerns Over FTX Contagion",
    source: "Bloomberg",
    timestamp: Date.now() - 14400000,
    sentiment: "bearish",
    relatedMarkets: ["FTT", "SOL"],
    impact: "high",
  },
];

export const useNewsStore = create<NewsStore>(() => ({
  news: DEMO_NEWS,
  loading: false,
  error: null,
}));

// Component
import { Button } from "ui";

export function NewsRadarPanel() {
  const { news } = useNewsStore();

  const sentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "border-green-600 bg-green-900/10 text-green-400";
      case "bearish":
        return "border-red-600 bg-red-900/10 text-red-400";
      default:
        return "border-slate-600 bg-slate-900/10 text-slate-400";
    }
  };

  const impactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <div className="space-y-3">
      <div className="panel flex items-center justify-between">
        <h2 className="neon-glow text-xl">📰 News Radar</h2>
        <Button size="sm" variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {news.map((item) => (
        <div
          key={item.id}
          className={`panel border-l-4 ${sentimentColor(item.sentiment)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.source}</p>
              <div className="flex gap-2 mt-2">
                {item.relatedMarkets.map((market) => (
                  <span
                    key={market}
                    className="text-xs bg-slate-800 px-2 py-1 rounded"
                  >
                    ${market}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl">{impactIcon(item.impact)}</p>
              <p className="text-xs text-slate-400 mt-1">
                {Math.floor((Date.now() - item.timestamp) / 60000)}m ago
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
