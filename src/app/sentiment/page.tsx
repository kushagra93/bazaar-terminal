"use client";

import { useMemo } from "react";
import { useCurrency } from "@/lib/currency";
import { StockLogo } from "@/components/StockLogo";
import { useSentiment, useSocial } from "@/lib/data";
import { MessageSquare, TrendingUp, TrendingDown, ArrowUp, ExternalLink } from "lucide-react";

function FearGreedGauge({ score, label }: { score: number; label: string }) {
  // Arc goes from left (10,100) = fear to right (190,100) = greed
  // Score 0 → needle points left (180°), Score 100 → points right (0°)
  const angle = 180 - (score / 100) * 180;
  const color = score >= 75 ? "var(--bull)" : score >= 55 ? "var(--bazaar-gold)" : score >= 45 ? "var(--squeeze)" : score >= 25 ? "var(--squeeze)" : "var(--bear)";
  return (
    <div className="text-center">
      <svg viewBox="0 0 200 110" className="w-48 mx-auto">
        <path d="M 10 100 A 90 90 0 0 1 55 25" fill="none" stroke="var(--bear)" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
        <path d="M 55 25 A 90 90 0 0 1 100 10" fill="none" stroke="var(--squeeze)" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
        <path d="M 100 10 A 90 90 0 0 1 145 25" fill="none" stroke="var(--bazaar-gold)" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
        <path d="M 145 25 A 90 90 0 0 1 190 100" fill="none" stroke="var(--bull)" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
        <line x1="100" y1="100"
          x2={100 + 70 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 70 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="5" fill={color} />
      </svg>
      <div className="font-display text-4xl font-bold mt-2" style={{ color }}>{score}</div>
      <div className="font-body text-sm text-[var(--text-secondary)] mt-1">{label}</div>
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

function RedditPost({ post }: { post: any }) {
  const sentColor = post.sentiment === "bullish" ? "var(--bull)" : post.sentiment === "bearish" ? "var(--bear)" : "var(--neutral)";
  const subColors: Record<string, string> = {
    wallstreetbets: "text-amber-400 bg-amber-400/10",
    stocks: "text-blue-400 bg-blue-400/10",
    options: "text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="py-3 border-b border-[var(--border-dim)] last:border-0 group">
      <div className="flex items-start gap-3">
        {/* Score */}
        <div className="flex flex-col items-center gap-0.5 w-10 flex-shrink-0">
          <ArrowUp size={12} className="text-[var(--text-dim)]" />
          <span className="font-data text-xs font-semibold text-[var(--text-primary)]">{post.score > 999 ? `${(post.score/1000).toFixed(1)}k` : post.score}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[8px] font-body font-semibold uppercase px-1.5 py-0.5 rounded ${subColors[post.subreddit] || "text-[var(--text-secondary)]"}`}>
              r/{post.subreddit}
            </span>
            {post.flair && <span className="text-[8px] font-body px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{post.flair}</span>}
            {post.tickers.map((t: string) => (
              <span key={t} className="text-[8px] font-data font-bold px-1 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)]">${t}</span>
            ))}
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sentColor }} />
          </div>

          {/* Title */}
          <a href={post.url} target="_blank" rel="noopener" className="font-body text-sm text-[var(--text-primary)] group-hover:text-[var(--bazaar-gold)] transition line-clamp-2">
            {post.title}
          </a>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1 text-[10px] font-data text-[var(--text-dim)]">
            <span>u/{post.author}</span>
            <span>{post.numComments} comments</span>
            <span>{timeAgo(post.created)}</span>
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Sentiment</h1>
        <p className="text-xs font-body text-[var(--text-secondary)] mt-0.5">
          Live from Reddit r/wallstreetbets · r/stocks · r/options + Fear & Greed Index + Analyst Ratings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Market Sentiment */}
        <div className="space-y-4">
          {fng && (
            <div className="card p-5">
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-1">Fear & Greed Index</div>
              <div className="text-[9px] font-data text-[var(--text-dim)] mb-4">{fng.source || "US Stock Market"}</div>
              <FearGreedGauge score={fng.value} label={fng.label} />
              {fng.vix && (
                <div className="mt-4 bg-[var(--bg-base)] rounded-lg p-3 text-center">
                  <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">VIX (Volatility Index)</div>
                  <div className="font-data text-xl font-bold mt-1" style={{
                    color: fng.vix < 16 ? "var(--bull)" : fng.vix < 25 ? "var(--bazaar-gold)" : "var(--bear)"
                  }}>{fng.vix}</div>
                  <div className="text-[10px] font-body text-[var(--text-secondary)] mt-0.5">
                    {fng.vix < 16 ? "Low volatility — trending market" : fng.vix < 20 ? "Moderate — normal conditions" : fng.vix < 30 ? "Elevated — trade smaller" : "High fear — extreme caution"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trending tickers on Reddit */}
          <div className="card p-4">
            <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Trending on Reddit
            </div>
            {trending.length === 0 ? (
              <div className="text-xs text-[var(--text-dim)] py-3 text-center">Loading...</div>
            ) : trending.slice(0, 10).map((t: any) => (
              <div key={t.symbol} className="flex items-center justify-between py-2 border-b border-[var(--border-dim)] last:border-0">
                <div className="flex items-center gap-2">
                  <StockLogo symbol={t.symbol} size={20} />
                  <span className="font-data text-sm font-bold text-[var(--bazaar-gold)]">${t.symbol}</span>
                  <span className="font-data text-[10px] text-[var(--text-dim)]">{t.mentions} mentions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-data text-[10px] text-[var(--bull)]">{t.bullish}🟢</span>
                  <span className="font-data text-[10px] text-[var(--bear)]">{t.bearish}🔴</span>
                  <div className="w-12 h-1.5 rounded-full overflow-hidden bg-[var(--bg-base)] flex">
                    <div className="bg-[var(--bull)]" style={{ width: `${t.mentions > 0 ? (t.bullish / t.mentions) * 100 : 50}%` }} />
                    <div className="bg-[var(--bear)]" style={{ width: `${t.mentions > 0 ? (t.bearish / t.mentions) * 100 : 50}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Analyst Ratings */}
          {analystRatings.length > 0 && (
            <div className="card p-4">
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-3">Analyst Consensus (Finnhub)</div>
              {analystRatings.map((r: any) => (
                <div key={r.symbol} className="py-2 border-b border-[var(--border-dim)] last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <StockLogo symbol={r.symbol} size={18} />
                      <span className="font-body text-sm font-semibold">{r.symbol}</span>
                    </div>
                    <span className="font-data text-[10px] text-[var(--text-dim)]">{r.period}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--bull)]" style={{ width: `${r.bullPct}%` }} />
                    <div className="bg-[var(--neutral)]" style={{ width: `${r.holdPct}%` }} />
                    <div className="bg-[var(--bear)]" style={{ width: `${r.bearPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-0.5 text-[9px] font-data text-[var(--text-dim)]">
                    <span className="text-[var(--bull)]">Buy {r.bullPct}%</span>
                    <span>Hold {r.holdPct}%</span>
                    <span className="text-[var(--bear)]">Sell {r.bearPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2-3: Reddit Feed */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={12} className="text-orange-400" />
                Live Reddit Feed
                <span className="font-data text-[10px] text-[var(--text-dim)]">
                  {posts.length} posts from r/wallstreetbets · r/stocks · r/options
                </span>
              </div>
            </div>

            {socLoading ? (
              <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded shimmer" />)}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)] font-body text-sm">
                Unable to fetch Reddit data — Reddit may be rate-limiting
              </div>
            ) : (
              <div className="max-h-[700px] overflow-y-auto">
                {posts.map((post: any) => <RedditPost key={post.id} post={post} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
