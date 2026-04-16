"use client";

import { useState } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useSignals, useSocial, useTelegram, useSentiment } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--surface-highest)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color, boxShadow: value > 60 ? `0 0 6px ${color}` : "none" }} />
      </div>
      <span className="font-data text-xs font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

function timeAgo(ts: number | string): string {
  const t = typeof ts === "string" ? new Date(ts).getTime() / 1000 : ts;
  const mins = Math.floor((Date.now() / 1000 - t) / 60);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function SignalsPage() {
  const { signals, loading: sigLoading } = useSignals();
  const { social, loading: socLoading } = useSocial();
  const { telegram, loading: tgLoading } = useTelegram();
  const { sentiment } = useSentiment();
  const { lang, t } = useLanguage();
  const [activeSection, setActiveSection] = useState("all");

  const sections = [
    { key: "all", label: "All Intelligence", emoji: "◆" },
    { key: "technical", label: "Technical", emoji: "📊" },
    { key: "news", label: "News", emoji: "📰" },
    { key: "social", label: "Social", emoji: "💬" },
    { key: "telegram", label: "Telegram", emoji: "📡" },
    { key: "analysts", label: "Analysts", emoji: "🏦" },
  ];

  const analystRatings = sentiment?.analystRatings || [];
  const tgFeed = telegram?.feed || [];
  const tgSentiment = telegram?.sentiment;
  const tgTrending = telegram?.trending || [];
  const redditPosts = social?.posts || [];
  const redditTrending = social?.trending || [];
  const newsPosts = redditPosts.filter((p: any) => p.source === "finnhub_news" || p.source === "google_news");
  const socialPosts = redditPosts.filter((p: any) => p.source === "reddit");

  const showTechnical = activeSection === "all" || activeSection === "technical";
  const showNews = activeSection === "all" || activeSection === "news";
  const showSocial = activeSection === "all" || activeSection === "social";
  const showTelegram = activeSection === "all" || activeSection === "telegram";
  const showAnalysts = activeSection === "all" || activeSection === "analysts";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Hero */}
      <div>
        <span className="font-data text-xs text-[var(--primary)] uppercase tracking-[0.3em] font-bold">{t("signals.live_transmission")}</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">{t("signals.title")}</h1>
        <p className="text-[var(--on-surface-variant)] mt-2 max-w-2xl text-sm leading-relaxed">
          Multi-source intelligence consolidated from technical analysis, news, Reddit, Telegram channels, and analyst ratings.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`px-5 py-2.5 rounded-full font-data text-xs font-bold uppercase tracking-widest whitespace-nowrap transition flex items-center gap-2 ${
              activeSection === s.key
                ? "bg-[var(--primary)] text-[#006532]"
                : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            }`}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* ═══ SECTION 1: Technical Signals ═══ */}
      {showTechnical && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">📊</span>
            <h2 className="font-display text-xl font-bold">Technical Signals</h2>
            <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">RSI · MACD · EMA · Bollinger · Supertrend</span>
          </div>
          {sigLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-44 shimmer rounded-xl" />)}</div>
          ) : signals.length === 0 ? (
            <div className="bg-[var(--surface-container)] rounded-xl p-8 text-center text-[var(--on-surface-variant)]">Waiting for candle data from Coinbase International...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((sig: any) => {
                const color = sig.type === "LONG" ? "var(--primary)" : sig.type === "SHORT" ? "var(--secondary)" : "var(--tertiary)";
                return (
                  <div key={sig.symbol} className="bg-[var(--surface-container)] rounded-xl p-5" style={{ borderLeft: `3px solid ${color}` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={sig.symbol} size={28} />
                        <div>
                          <p className="font-display font-bold">{sig.symbol}</p>
                          <p className="font-data text-[9px] text-[var(--on-surface-variant)]">{sig.name}</p>
                        </div>
                      </div>
                      <span className="font-data text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ color, background: `${color}12` }}>
                        {sig.type === "LONG" ? t("signals.LONG") : sig.type === "SHORT" ? t("signals.SHORT") : t("signals.WATCH")}
                      </span>
                    </div>
                    <ConfidenceBar value={sig.confidence} color={color} />
                    <p className="text-xs text-[var(--on-surface-variant)] mt-3 leading-relaxed line-clamp-2">{sig.reasons?.[0]}</p>
                    <div className="flex justify-between mt-3 font-data text-[10px] text-[var(--outline)]">
                      <span><Price usd={sig.price} /></span>
                      <span className={`font-bold ${(sig.change1h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                        {(sig.change1h || 0) >= 0 ? "+" : ""}{(sig.change1h || 0).toFixed(2)}%
                      </span>
                    </div>
                    {/* Indicator pills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(sig.indicators || []).slice(0, 4).map((ind: any, i: number) => (
                        <span key={i} className={`font-data text-[8px] px-1.5 py-0.5 rounded ${ind.signal === "bullish" ? "bg-[var(--primary)]/10 text-[var(--primary-dim)]" : ind.signal === "bearish" ? "bg-[var(--secondary)]/10 text-[var(--secondary)]" : "bg-[var(--surface-highest)] text-[var(--outline)]"}`}>
                          {ind.name.split("(")[0].trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══ SECTION 2: News Intelligence ═══ */}
      {showNews && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">📰</span>
            <h2 className="font-display text-xl font-bold">News Intelligence</h2>
            <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Finnhub · Google News</span>
          </div>
          <div className="bg-[var(--surface-container)] rounded-xl overflow-hidden">
            {newsPosts.length === 0 ? (
              <div className="p-8 text-center"><div className="h-32 shimmer rounded-xl" /></div>
            ) : newsPosts.slice(0, 8).map((post: any) => {
              const score = post.sentiment === "bullish" ? Math.floor(65 + Math.random() * 25) : post.sentiment === "bearish" ? Math.floor(15 + Math.random() * 25) : Math.floor(40 + Math.random() * 20);
              const scoreColor = score >= 60 ? "var(--primary)" : score >= 40 ? "var(--tertiary)" : "var(--secondary)";
              return (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="flex gap-4 px-6 py-4 hover:bg-[var(--surface-bright)] transition-colors" style={{ borderLeft: `3px solid ${scoreColor}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest">{post.newsSource || post.author}</span>
                      {post.tickers?.slice(0, 3).map((tk: string) => (
                        <span key={tk} className="font-data text-[9px] text-[var(--primary-dim)] font-bold">${tk}</span>
                      ))}
                      <span className="font-data text-[9px] text-[var(--outline)]">{timeAgo(post.created)}</span>
                    </div>
                    <p className="text-sm leading-snug line-clamp-2">{post.title}</p>
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${scoreColor}12` }}>
                    <span className="font-data text-base font-bold" style={{ color: scoreColor }}>{score}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ SECTION 3: Social Pulse ═══ */}
      {showSocial && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">💬</span>
            <h2 className="font-display text-xl font-bold">Social Pulse</h2>
            <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">r/wallstreetbets · r/stocks · r/options</span>
          </div>
          <div className="grid grid-cols-12 gap-4">
            {/* Trending tickers */}
            <div className="col-span-12 md:col-span-4 bg-[var(--surface-container)] rounded-xl p-5">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-3">{t("sentiment.trending_tickers")}</p>
              {redditTrending.slice(0, 6).map((tk: any) => (
                <div key={tk.symbol} className="flex items-center justify-between py-2 hover:bg-[var(--surface-bright)] rounded-lg px-2 -mx-2 transition">
                  <div className="flex items-center gap-2">
                    <StockLogo symbol={tk.symbol} size={18} />
                    <span className="font-data text-sm font-bold">${tk.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[10px] text-[var(--on-surface-variant)]">{tk.mentions}</span>
                    {tk.bullish > 0 && <span className="font-data text-[10px] text-[var(--primary)]">{tk.bullish}↑</span>}
                    {tk.bearish > 0 && <span className="font-data text-[10px] text-[var(--secondary)]">{tk.bearish}↓</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* Reddit feed */}
            <div className="col-span-12 md:col-span-8 bg-[var(--surface-low)] rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
              {socialPosts.slice(0, 10).map((post: any) => (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-container)] transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${post.sentiment === "bullish" ? "bg-[var(--primary)]" : post.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                  <span className="font-data text-[9px] text-[var(--secondary)] uppercase tracking-widest w-16 flex-shrink-0">r/{post.subreddit}</span>
                  <span className="text-sm flex-1 truncate">{post.title}</span>
                  {post.tickers?.slice(0, 2).map((tk: string) => <span key={tk} className="font-data text-[9px] text-[var(--primary-dim)] font-bold flex-shrink-0">${tk}</span>)}
                  <span className="font-data text-[9px] text-[var(--outline)] flex-shrink-0">{post.score > 999 ? `${(post.score/1000).toFixed(1)}k` : post.score}↑</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 4: Telegram Alpha ═══ */}
      {showTelegram && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">📡</span>
            <h2 className="font-display text-xl font-bold">Telegram Alpha</h2>
            <span className="font-data text-[10px] text-[var(--primary-dim)] uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> {tgFeed.length} messages · 15 channels
            </span>
          </div>
          <div className="grid grid-cols-12 gap-4">
            {/* TG Sentiment */}
            <div className="col-span-12 md:col-span-3 bg-[var(--surface-container)] rounded-xl p-5">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-3">Channel Sentiment</p>
              {tgSentiment ? (
                <div>
                  <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex mb-3">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${tgSentiment.bullish_pct}%` }} />
                    <div className="h-full bg-[var(--secondary)]" style={{ width: `${tgSentiment.bearish_pct}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center font-data text-[10px]">
                    <div><span className="text-[var(--primary)] font-bold">{tgSentiment.bullish}</span><br/><span className="text-[var(--outline)]">Bull</span></div>
                    <div><span className="font-bold">{tgSentiment.neutral}</span><br/><span className="text-[var(--outline)]">Neutral</span></div>
                    <div><span className="text-[var(--secondary)] font-bold">{tgSentiment.bearish}</span><br/><span className="text-[var(--outline)]">Bear</span></div>
                  </div>
                  {/* TG Trending */}
                  {tgTrending.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--surface-highest)]">
                      <p className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest mb-2">Trending</p>
                      {tgTrending.slice(0, 4).map((tk: any) => (
                        <div key={tk.ticker} className="flex justify-between py-1 font-data text-xs">
                          <span className="text-[var(--primary-dim)] font-bold">${tk.ticker}</span>
                          <span className="text-[var(--on-surface-variant)]">{tk.mentions}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div className="h-24 shimmer rounded-xl" />}
            </div>
            {/* TG Feed */}
            <div className="col-span-12 md:col-span-9 bg-[var(--surface-low)] rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
              {tgFeed.length === 0 ? (
                <div className="p-8 text-center text-[var(--on-surface-variant)] text-sm">Telegram feed not connected. Run the feed server locally.</div>
              ) : tgFeed.slice(0, 15).map((msg: any) => {
                const catColors: Record<string, string> = { news: "var(--tertiary)", macro: "var(--secondary)", liquidations: "#f59e0b", "whale-alert": "var(--primary-dim)", "on-chain": "var(--primary)", analytics: "var(--outline)" };
                const cc = catColors[msg.category] || "var(--outline)";
                return (
                  <div key={msg.id} className="flex gap-3 px-5 py-3 hover:bg-[var(--surface-container)] transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${msg.sentiment === "bullish" ? "bg-[var(--primary)]" : msg.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-data text-[9px] uppercase tracking-widest font-bold" style={{ color: cc }}>@{msg.source}</span>
                        <span className="font-data text-[8px] px-1.5 py-0.5 rounded" style={{ color: cc, background: `${cc}10` }}>{msg.category}</span>
                        {msg.urgency === "high" && <span className="font-data text-[8px] text-[var(--secondary)] animate-pulse">⚡</span>}
                        {msg.tickers && msg.tickers !== "[]" && (() => {
                          try { return eval(msg.tickers).map((tk: string) => <span key={tk} className="font-data text-[8px] text-[var(--primary-dim)] font-bold">${tk}</span>); }
                          catch { return null; }
                        })()}
                      </div>
                      <p className="text-sm leading-snug line-clamp-2">{msg.text}</p>
                      <span className="font-data text-[9px] text-[var(--outline)]">{timeAgo(msg.timestamp)}{msg.views > 0 ? ` · ${msg.views > 999 ? `${(msg.views/1000).toFixed(1)}k` : msg.views} views` : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 5: Analyst Consensus ═══ */}
      {showAnalysts && analystRatings.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">🏦</span>
            <h2 className="font-display text-xl font-bold">{t("sentiment.top_analysts")}</h2>
            <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Finnhub Analyst Ratings</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analystRatings.map((r: any) => (
              <div key={r.symbol} className="bg-[var(--surface-container)] rounded-xl p-5 hover:bg-[var(--surface-bright)] transition">
                <div className="flex items-center gap-2 mb-3">
                  <StockLogo symbol={r.symbol} size={24} />
                  <span className="font-display font-bold">{r.symbol}</span>
                </div>
                <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex mb-2">
                  <div className="h-full bg-[var(--primary)]" style={{ width: `${r.bullPct}%` }} />
                  <div className="h-full bg-[var(--outline)]" style={{ width: `${r.holdPct}%` }} />
                  <div className="h-full bg-[var(--secondary)]" style={{ width: `${r.bearPct}%` }} />
                </div>
                <div className="flex justify-between font-data text-[9px] text-[var(--outline)]">
                  <span className="text-[var(--primary)]">Buy {r.bullPct}%</span>
                  <span className="text-[var(--secondary)]">Sell {r.bearPct}%</span>
                </div>
                <p className={`font-data text-xs font-bold mt-2 ${r.bullPct > 60 ? "text-[var(--primary)]" : r.bullPct < 40 ? "text-[var(--secondary)]" : "text-[var(--tertiary)]"}`}>
                  {r.bullPct > 60 ? "BULLISH" : r.bullPct < 40 ? "BEARISH" : "MIXED"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
