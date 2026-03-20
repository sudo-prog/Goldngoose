"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SAMPLE_INSIGHTS = [
  "📊 **BTC Analysis**: Strong support at $60K with increasing volume. RSI showing oversold conditions - potential reversal incoming.",
  "🐋 **Whale Alert**: Large BTC transfer (2,500 BTC) to Binance. Historically precedes volatility within 24-48 hours.",
  "📈 **Market Sentiment**: Fear & Greed Index at 45 (Fear). Contrarian indicator suggests buying opportunity.",
  "⚡ **DeFi Yield**: AAVE lending rates spiked to 12% APY. High demand for borrowing indicates bullish positioning.",
  "🔮 **Prediction**: Based on on-chain metrics, ETH likely to test $3,500 resistance this week.",
];

export function InsightChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome to PolyBloom AI Insights! I analyze market data, on-chain metrics, and trading patterns to give you actionable intelligence.\n\nTry asking:\n• \"What's the BTC sentiment?\"\n• \"Show me whale movements\"\n• \"Analyze ETH price action\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const randomInsight =
        SAMPLE_INSIGHTS[Math.floor(Math.random() * SAMPLE_INSIGHTS.length)];
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: randomInsight,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-polybloom-neon/10 ml-8"
                : "bg-slate-800/50 mr-8"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500">
                {msg.role === "user" ? "👤 You" : "🤖 AI"}
              </span>
              <span className="text-xs text-slate-600">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
        {isTyping && (
          <div className="bg-slate-800/50 p-3 rounded-lg mr-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">🤖 AI</span>
              <span className="text-xs text-polybloom-neon animate-pulse">
                analyzing...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for market insights..."
          className="flex-1 bg-slate-800/50 text-white text-sm rounded px-3 py-2 outline-none focus:ring-2 focus:ring-polybloom-neon"
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="px-4 py-2 bg-polybloom-neon/20 text-polybloom-neon rounded hover:bg-polybloom-neon/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}