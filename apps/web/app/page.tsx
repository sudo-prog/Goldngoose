"use client";

import Link from "next/link";

export default function Home() {
  const features = [
    { icon: "📊", title: "Live Markets", desc: "Real-time data from CoinGecko and Binance" },
    { icon: "🎰", title: "Polymarket", desc: "Prediction markets and CLOB trading" },
    { icon: "🤖", title: "AI Agents", desc: "Trading strategies, paper-trading by default" },
    { icon: "📰", title: "News Radar", desc: "Headlines with sentiment analysis" },
    { icon: "⏮️", title: "Backtester", desc: "Historical simulation and strategy replay" },
    { icon: "🎨", title: "Multi-Panel Grid", desc: "Drag, resize and dock panels" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-goldngoose-dark">
      {/* Forensic Dot Grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, var(--goldngoose-gold) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="text-center mb-12">
          <p
            className="font-mono text-goldngoose-white-dim"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            THE BESPOKE LEDGER / GRAND OPUS PROTOCOL
          </p>
          <h1
            className="font-display neon-glow"
            style={{
              fontStyle: 'italic',
              fontSize: '4rem',
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            goldngoose
          </h1>
          <p
            className="font-body text-goldngoose-white"
            style={{
              fontSize: '1.125rem',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Private-grade crypto intelligence & Polymarket terminal
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 bg-goldngoose-navy-mid"
              style={{
                border: '1px solid var(--border-primary)',
                borderRadius: '0.125rem',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '1.25rem' }}>{f.icon}</span>
                <h3
                  className="font-mono text-goldngoose-gold"
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {f.title}
                </h3>
              </div>
              <p
                className="font-body text-goldngoose-white"
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link
            href="/terminal"
            className="px-8 py-3 transition-colors font-mono bg-goldngoose-gold text-goldngoose-dark"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: '0.125rem',
            }}
          >
            Launch Terminal →
          </Link>
          <Link
            href="/polymarket"
            className="px-8 py-3 transition-colors font-mono text-goldngoose-gold border-goldngoose-neon"
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '1px solid',
              borderRadius: '0.125rem',
            }}
          >
            Polymarket
          </Link>
        </div>

        {/* Page Links */}
        <div className="flex gap-6 mt-8">
          {[
            { href: '/signals', label: 'Signals' },
            { href: '/portfolio', label: 'Portfolio' },
            { href: '/news', label: 'News' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-goldngoose-white-dim"
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="py-6 text-center"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <p
          className="font-mono text-goldngoose-white-dim"
          style={{
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Built with Next.js 15, Expo 52 · The Bespoke Ledger Design System
        </p>
      </div>
    </div>
  );
}