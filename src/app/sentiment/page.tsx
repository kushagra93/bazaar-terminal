"use client";

import { useCurrency } from "@/lib/currency";
import { useSentiment, useSocial } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";

function FearGreedDial({ score, label }: { score: number; label: string }) {
  const angle = 180 - (score / 100) * 180;
  const color = score >= 75 ? "var(--primary)" : score >= 55 ? "var(--primary-dim)" : score >= 45 ? "var(--tertiary)" : score >= 25 ? "var(--secondary)" : "var(--secondary)";
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 200 110" className="w-56">
          <defs>
            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="30%" stopColor="var(--secondary)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--tertiary)" stopOpacity="0.5" />
              <stop offset="70%" stopColor="var(--primary-dim)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="var(--surface-highest)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#gauge-grad)" strokeWidth="14" strokeLinecap="round" opacity="0.7" />
          <line
            x1="100" y1="100"
            x2={100 + 65 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 65 * Math.sin((angle * Math.PI) / 180)}
            stroke={color} strokeWidth="3" strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={color} />
          <circle cx="100" cy="100" r="3" fill="var(--surface)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="font-display text-4xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="flex justify-between w-56 mt-2 font-data text-[9px] uppercase tracking-widest text-[var(--outline)]">
        <span>Extreme Fear</span>
        <span>Neutral</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() / 1000 - ts) / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function SentimentPage() {
  const { sentiment, loading: sentLoading } = useSentiment();
  const { social, loading: socLoading } = useSocial();
  const { format } = useCurrency();

  const fng = sentiment?.fearGreed;
  const analystRatings = sentiment?.analystRatings || [];
  const posts = social?.posts || [];
  const trending = social?.trending || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* Hero */}
      <div>
        <span className="font-data text-xs text-[var(--primary)] uppercase tracking-[0.3em] font-bold">Sentiment Engine</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">SENTIMENT</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Column 1: Fear & Greed + Market Bias (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fear & Greed Dial */}
          <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg">Fear & Greed<br/>Dial</h3>
              {fng && <span className="font-data text-sm uppercase tracking-widest" style={{
                color: fng.value >= 55 ? "var(--primary)" : fng.value >= 45 ? "var(--tertiary)" : "var(--secondary)"
              }}>{fng.label}</span>}
            </div>
            {fng ? <FearGreedDial score={fng.value} label={fng.label} /> : <div className="h-40 shimmer rounded-xl" />}
          </div>

          {/* Market Bias */}
          <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">📊</span>
              <h3 className="font-display font-bold">Market Bias</h3>
            </div>
            {trending.length > 0 ? (() => {
              const totalBull = trending.reduce((s: number, t: any) => s + (t.bullish || 0), 0);
              const totalBear = trending.reduce((s: number, t: any) => s + (t.bearish || 0), 0);
              const total = totalBull + totalBear || 1;
              const bullPct = ((totalBull / total) * 100).toFixed(1);
              return (
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-data text-3xl font-bold text-[var(--primary)]">{bullPct}%</span>
                    <span className="font-data text-xs text-[var(--on-surface-variant)] uppercase tracking-widest">Bullish</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex mb-4">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${bullPct}%` }} />
                    <div className="h-full bg-[var(--secondary)]" style={{ width: `${100 - parseFloat(bullPct)}%` }} />
                  </div>
                  <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                    The aggregate bias remains {parseFloat(bullPct) > 55 ? "bullish" : parseFloat(bullPct) < 45 ? "bearish" : "neutral"},
                    based on {social?.totalPosts || 0} posts across Reddit communities.
                  </p>
                </div>
              );
            })() : <div className="h-20 shimmer rounded-xl" />}
          </div>

          {/* VIX */}
          {fng?.vix && (
            <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-2">VIX Volatility Index</p>
              <span className={`font-data text-3xl font-bold ${fng.vix < 20 ? "text-[var(--primary)]" : fng.vix < 30 ? "text-[var(--tertiary)]" : "text-[var(--secondary)]"}`}>{fng.vix}</span>
              <p className="text-sm text-[var(--on-surface-variant)] mt-2">
                {fng.vix < 16 ? "Low volatility — trending market conditions" : fng.vix < 20 ? "Moderate — normal trading conditions" : fng.vix < 30 ? "Elevated — trade smaller, wider stops" : "High fear — extreme caution advised"}
              </p>
            </div>
          )}
        </div>

        {/* ── Column 2: Social Intelligence (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">🌐</span>
                <h3 className="font-display font-bold">Social Intelligence</h3>
              </div>
              <span className="font-data text-[10px] text-[var(--primary-dim)] uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> Live Feed
              </span>
            </div>

            {/* Trending Tickers */}
            <div className="mb-6">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-3">Trending Tickers</p>
              <div className="space-y-0">
                {trending.slice(0, 8).map((t: any) => (
                  <div key={t.symbol} className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-bright)] transition-colors rounded-lg px-2 -mx-2">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={t.symbol} size={20} />
                      <span className="font-data text-sm font-bold">${t.symbol}</span>
                      <span className="font-data text-[10px] text-[var(--on-surface-variant)]">{t.mentions} mentions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.bullish > 0 && <span className="font-data text-[10px] text-[var(--primary)]">{t.bullish}↑</span>}
                      {t.bearish > 0 && <span className="font-data text-[10px] text-[var(--secondary)]">{t.bearish}↓</span>}
                    </div>
                  </div>
                ))}
                {trending.length === 0 && <div className="h-32 shimmer rounded-xl" />}
              </div>
            </div>

            {/* Reddit Posts */}
            <div>
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-3">Reddit Feed</p>
              <div className="space-y-3">
                {posts.slice(0, 6).map((post: any) => (
                  <a key={post.id} href={post.url} target="_blank" rel="noopener"
                    className="block hover:bg-[var(--surface-bright)] rounded-xl p-3 -mx-3 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${post.sentiment === "bullish" ? "bg-[var(--primary)]" : post.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                      <span className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest">r/{post.subreddit}</span>
                      <span className="font-data text-[9px] text-[var(--outline)]">{timeAgo(post.created)}</span>
                      {post.tickers?.map((t: string) => (
                        <span key={t} className="font-data text-[9px] text-[var(--primary-dim)] font-bold">${t}</span>
                      ))}
                    </div>
                    <p className="text-sm leading-snug line-clamp-2">{post.title}</p>
                  </a>
                ))}
                {posts.length === 0 && <div className="h-40 shimmer rounded-xl" />}
              </div>
            </div>
          </div>
        </div>

        {/* ── Column 3: Analyst Consensus + Summary (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Analyst Consensus */}
          <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <h3 className="font-display font-bold text-lg mb-6">Top Analysts</h3>
            <div className="space-y-4">
              {analystRatings.slice(0, 6).map((r: any) => (
                <div key={r.symbol} className="hover:bg-[var(--surface-bright)] rounded-xl p-3 -mx-3 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={r.symbol} size={20} />
                      <span className="font-display font-bold text-sm">{r.symbol}</span>
                    </div>
                    <span className={`font-data text-xs font-bold ${r.bullPct > 60 ? "text-[var(--primary)]" : r.bullPct < 40 ? "text-[var(--secondary)]" : "text-[var(--tertiary)]"}`}>
                      {r.bullPct > 60 ? "BULLISH" : r.bullPct < 40 ? "BEARISH" : "MIXED"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface-highest)] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${r.bullPct}%` }} />
                    <div className="h-full bg-[var(--outline)]" style={{ width: `${r.holdPct}%` }} />
                    <div className="h-full bg-[var(--secondary)]" style={{ width: `${r.bearPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 font-data text-[9px] text-[var(--outline)]">
                    <span>Buy {r.bullPct}%</span>
                    <span>Hold {r.holdPct}%</span>
                    <span>Sell {r.bearPct}%</span>
                  </div>
                </div>
              ))}
              {analystRatings.length === 0 && <div className="h-40 shimmer rounded-xl" />}
            </div>
          </div>

          {/* Sentiment Summary */}
          <div className="bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <h3 className="font-display font-bold mb-4">Sentiment Intelligence Summary</h3>
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed mb-4">
              {fng && fng.value >= 55
                ? `The market is currently exhibiting ${fng.label}. While retail sentiment on Reddit shows signs of optimism, institutional positioning suggests caution. Watch for a "Sentiment Divergence" if social activity continues to climb while prices consolidate.`
                : fng && fng.value < 45
                ? `Fear is elevated with the index at ${fng.value}. Reddit discussions are dominated by defensive positioning. This historically signals potential buying opportunities for contrarian traders, but wait for VIX to peak before going long.`
                : `Neutral sentiment territory. The market is balanced between bulls and bears. Key upcoming events (FOMC, earnings) will likely determine the next directional move. Position sizing should remain conservative.`
              }
            </p>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary-dim)] rounded-full font-data text-xs font-bold">{fng && fng.value >= 50 ? "Favor Longs" : "Favor Shorts"}</span>
              <span className="px-4 py-2 bg-[var(--surface-highest)] text-[var(--on-surface-variant)] rounded-full font-data text-xs font-bold">Low Volatility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
