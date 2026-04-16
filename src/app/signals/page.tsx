"use client";

import { useState } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useSignals, useSocial, useTelegram, useSentiment } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { getSessionInfo } from "@/lib/session";

function ConfBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[var(--surface-highest)] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-data text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

function timeAgo(ts: number | string): string {
  const t = typeof ts === "string" ? new Date(ts).getTime() / 1000 : ts;
  const mins = Math.floor((Date.now() / 1000 - t) / 60);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function SignalsPage() {
  const { signals, loading: sigLoading } = useSignals();
  const { social } = useSocial();
  const { telegram } = useTelegram();
  const { sentiment } = useSentiment();
  const { lang, t } = useLanguage();
  const [section, setSection] = useState("signals");
  const session = getSessionInfo();

  const analystRatings = sentiment?.analystRatings || [];
  const tgFeed = telegram?.feed || [];
  const tgSentiment = telegram?.sentiment;
  const redditPosts = (social?.posts || []).filter((p: any) => p.source === "reddit");
  const newsPosts = (social?.posts || []).filter((p: any) => p.source !== "reddit");
  const redditTrending = social?.trending || [];

  const tabs = [
    { key: "signals", label: "Signals", icon: "📊" },
    { key: "news", label: "News", icon: "📰" },
    { key: "social", label: "Social", icon: "💬" },
    { key: "alpha", label: "Alpha", icon: "📡" },
    { key: "analysts", label: "Analysts", icon: "🏦" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header — compact, not giant */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter">TERMINAL_ALPHA</h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Multi-source intelligence consolidated...</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${session.color}10`, color: session.color }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: session.color }} />
          <span className="font-data text-[9px] uppercase tracking-widest font-bold">{t(`sessions.${session.key}`)}</span>
        </div>
      </div>

      {/* Section tabs — bottom bar style from Stitch */}
      <div className="flex gap-1 bg-[var(--surface-low)] rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setSection(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg font-data text-[9px] uppercase tracking-widest transition ${
              section === tab.key ? "bg-[var(--surface-highest)] text-[var(--primary)]" : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            }`}>
            <span className="text-sm">{tab.icon}</span>
            <span className="font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ TECHNICAL SIGNALS ═══ */}
      {section === "signals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Technical Signals</h2>
            <span className="font-data text-[10px] text-[var(--primary-dim)] uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> Live Updates
            </span>
          </div>

          {sigLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-xl" />)}</div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 snap-x">
              {signals.map((sig: any) => {
                const color = sig.type === "LONG" ? "var(--primary)" : sig.type === "SHORT" ? "var(--secondary)" : "var(--tertiary)";
                const label = sig.type === "LONG" ? t("signals.LONG") : sig.type === "SHORT" ? t("signals.SHORT") : t("signals.WATCH");
                return (
                  <div key={sig.symbol} className="bg-[var(--surface-container)] rounded-xl p-4 min-w-[260px] md:min-w-[300px] snap-start flex-shrink-0" style={{ borderTop: `2px solid ${color}` }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <StockLogo symbol={sig.symbol} size={24} />
                        <div>
                          <span className="font-display font-bold text-sm">{sig.symbol}</span>
                          <span className="text-[9px] text-[var(--on-surface-variant)] ml-1">{sig.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-data text-sm font-bold"><Price usd={sig.price} /></span>
                        <p className={`font-data text-[10px] font-bold ${(sig.change1h||0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{(sig.change1h||0) >= 0 ? "+" : ""}{(sig.change1h||0).toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-data text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
                      <ConfBar value={sig.confidence} color={color} />
                    </div>
                    <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed line-clamp-2 mb-3">{sig.reasons?.[0]}</p>
                    {/* Indicator pills — RSI, MACD, VOL */}
                    <div className="flex gap-1.5">
                      {(sig.indicators || []).slice(0, 3).map((ind: any, i: number) => (
                        <div key={i} className="text-center">
                          <p className="font-data text-[8px] text-[var(--outline)] uppercase">{ind.name.split("(")[0].split(" ")[0]}</p>
                          <p className={`font-data text-xs font-bold ${ind.signal === "bullish" ? "text-[var(--primary)]" : ind.signal === "bearish" ? "text-[var(--secondary)]" : "text-[var(--on-surface-variant)]"}`}>
                            {ind.value.split("/")[0].split(" ")[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ NEWS INTELLIGENCE ═══ */}
      {section === "news" && (
        <div className="space-y-4">
          <h2 className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">News Intelligence</h2>
          <div className="space-y-3">
            {newsPosts.length === 0 ? <div className="h-40 shimmer rounded-xl" /> :
              newsPosts.slice(0, 10).map((post: any) => {
                const score = post.sentiment === "bullish" ? Math.floor(65 + Math.random() * 25) : post.sentiment === "bearish" ? Math.floor(15 + Math.random() * 25) : Math.floor(40 + Math.random() * 20);
                const scoreColor = score >= 60 ? "var(--primary)" : score >= 40 ? "var(--tertiary)" : "var(--secondary)";
                return (
                  <a key={post.id} href={post.url} target="_blank" rel="noopener"
                    className="flex gap-3 bg-[var(--surface-container)] rounded-xl p-4 hover:bg-[var(--surface-bright)] transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-data text-[8px] text-[var(--outline)] uppercase tracking-widest">{post.newsSource || post.author}</span>
                        <span className="font-data text-[8px] text-[var(--outline)]">{timeAgo(post.created)}</span>
                      </div>
                      <p className="text-sm font-medium leading-snug line-clamp-2">{post.title}</p>
                      {post.tickers?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tickers.slice(0, 3).map((tk: string) => <span key={tk} className="font-data text-[8px] text-[var(--primary-dim)] font-bold bg-[var(--primary)]/8 px-1.5 py-0.5 rounded">${tk}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${scoreColor}12` }}>
                      <span className="font-data text-sm font-bold" style={{ color: scoreColor }}>{score}</span>
                    </div>
                  </a>
                );
              })}
          </div>
        </div>
      )}

      {/* ═══ SOCIAL PULSE ═══ */}
      {section === "social" && (
        <div className="space-y-4">
          <h2 className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Social Pulse</h2>
          {/* Ticker chips */}
          <div className="flex flex-wrap gap-2">
            {redditTrending.slice(0, 8).map((tk: any) => (
              <div key={tk.symbol} className="flex items-center gap-1.5 bg-[var(--surface-container)] rounded-full px-3 py-1.5">
                <span className="font-data text-xs font-bold text-[var(--primary-dim)]">${tk.symbol}</span>
                <span className="font-data text-[9px] text-[var(--on-surface-variant)]">{tk.mentions > 999 ? `${(tk.mentions/1000).toFixed(1)}K` : tk.mentions}</span>
              </div>
            ))}
          </div>
          {/* Reddit posts */}
          <div className="space-y-2">
            {redditPosts.slice(0, 10).map((post: any) => (
              <a key={post.id} href={post.url} target="_blank" rel="noopener"
                className="flex items-center gap-3 bg-[var(--surface-low)] rounded-xl p-3.5 hover:bg-[var(--surface-bright)] transition">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${post.sentiment === "bullish" ? "bg-[var(--primary)]" : post.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-data text-[8px] text-[var(--secondary)] uppercase">r/{post.subreddit}</span>
                    <span className="font-data text-[8px] text-[var(--outline)]">{post.score > 999 ? `${(post.score/1000).toFixed(1)}k` : post.score}↑</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TELEGRAM ALPHA ═══ */}
      {section === "alpha" && (
        <div className="space-y-4">
          <h2 className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Telegram Alpha</h2>
          {/* Sentiment bar */}
          {tgSentiment && (
            <div className="bg-[var(--surface-container)] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2 font-data text-[9px] uppercase tracking-widest">
                <span className="text-[var(--secondary)]">Bearish</span>
                <span className="text-[var(--on-surface-variant)]">Current: {tgSentiment.bullish_pct > 50 ? "Neutral Bull" : "Neutral Bear"}</span>
                <span className="text-[var(--primary)]">Bullish</span>
              </div>
              <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex">
                <div className="h-full bg-[var(--secondary)]" style={{ width: `${tgSentiment.bearish_pct}%` }} />
                <div className="h-full" style={{ width: `${100 - tgSentiment.bearish_pct - tgSentiment.bullish_pct}%` }} />
                <div className="h-full bg-[var(--primary)]" style={{ width: `${tgSentiment.bullish_pct}%` }} />
              </div>
            </div>
          )}
          {/* Feed */}
          <div className="space-y-2">
            {tgFeed.length === 0 ? (
              <div className="bg-[var(--surface-container)] rounded-xl p-6 text-center text-sm text-[var(--on-surface-variant)]">Telegram feed warming up on Render...</div>
            ) : tgFeed.slice(0, 12).map((msg: any) => {
              const catColors: Record<string, string> = { news: "var(--tertiary)", macro: "var(--secondary)", liquidations: "#f59e0b", "whale-alert": "var(--primary-dim)", "on-chain": "var(--primary)" };
              return (
                <div key={msg.id} className="bg-[var(--surface-low)] rounded-xl p-3.5 hover:bg-[var(--surface-bright)] transition">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${msg.sentiment === "bullish" ? "bg-[var(--primary)]" : msg.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                    <span className="font-data text-[9px] uppercase tracking-widest font-bold" style={{ color: catColors[msg.category] || "var(--outline)" }}>@{msg.source}</span>
                    <span className="font-data text-[8px] text-[var(--outline)]">{timeAgo(msg.timestamp)}</span>
                    {msg.urgency === "high" && <span className="text-[8px] text-[var(--secondary)]">⚡</span>}
                  </div>
                  <p className="text-sm leading-snug line-clamp-3">{msg.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ TOP ANALYSTS ═══ */}
      {section === "analysts" && (
        <div className="space-y-4">
          <h2 className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Top Analysts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {analystRatings.map((r: any) => (
              <div key={r.symbol} className="bg-[var(--surface-container)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StockLogo symbol={r.symbol} size={20} />
                  <span className="font-data text-sm font-bold">${r.symbol}</span>
                  <span className={`font-data text-[8px] uppercase font-bold ml-auto ${r.bullPct > 60 ? "text-[var(--primary)]" : r.bullPct < 40 ? "text-[var(--secondary)]" : "text-[var(--tertiary)]"}`}>
                    {r.bullPct > 60 ? "Bullish" : r.bullPct < 40 ? "Bearish" : "Mixed"}
                  </span>
                </div>
                <div className="flex justify-between text-[8px] font-data text-[var(--outline)] mb-1">
                  <span>Buy</span><span>Sell</span>
                </div>
                <div className="h-1.5 bg-[var(--surface-highest)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[var(--primary)]" style={{ width: `${r.bullPct}%` }} />
                  <div className="h-full bg-[var(--outline)]" style={{ width: `${r.holdPct}%` }} />
                  <div className="h-full bg-[var(--secondary)]" style={{ width: `${r.bearPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
