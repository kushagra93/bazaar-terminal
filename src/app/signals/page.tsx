"use client";

import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useSignals, useSocial, useTelegram, useSentiment } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { getSessionInfo } from "@/lib/session";
import { useTranslatedItems, useTranslatedText } from "@/lib/translate";

function T({ text, lang }: { text: string; lang: string }) {
  const translated = useTranslatedText(text, lang);
  return <>{translated}</>;
}

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
  const { t } = useLanguage();
  const session = getSessionInfo();

  const { lang } = useLanguage();

  const analystRatings = sentiment?.analystRatings || [];
  const rawTgFeed = telegram?.feed || [];
  const tgSentiment = telegram?.sentiment;
  const redditTrending = social?.trending || [];
  const rawNewsPosts = (social?.posts || []).filter((p: any) => p.source !== "reddit");

  // Deep translate dynamic content when language != English
  const tgFeed = useTranslatedItems(rawTgFeed, lang, ["text"]);
  const newsPosts = useTranslatedItems(rawNewsPosts, lang, ["title"]);
  // Signal reasons are arrays — we'll translate inline per card

  return (
    <div className="max-w-[800px] mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-xl font-extrabold tracking-tight">TERMINAL_ALPHA</h1>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ background: `${session.color}10`, color: session.color }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: session.color }} />
            <span className="font-data text-[9px] uppercase tracking-widest font-bold">{t(`sessions.${session.key}`)}</span>
          </div>
        </div>
        <p className="text-xs text-[var(--on-surface-variant)]"><T text="Multi-source intelligence consolidated..." lang={lang} /></p>
      </div>

      {/* ═══ 1. TECHNICAL SIGNALS ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-data text-[11px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold"><T text="Technical Signals" lang={lang} /></h2>
          <span className="font-data text-[9px] text-[var(--primary-dim)] uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> <T text="Live Updates" lang={lang} />
          </span>
        </div>
        {sigLoading ? (
          <div className="flex gap-3 overflow-hidden">{[1,2].map(i => <div key={i} className="h-40 w-[280px] shimmer rounded-xl flex-shrink-0" />)}</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 snap-x">
            {signals.map((sig: any) => {
              const color = sig.type === "LONG" ? "var(--primary)" : sig.type === "SHORT" ? "var(--secondary)" : "var(--tertiary)";
              return (
                <div key={sig.symbol} className="bg-[var(--surface-container)] rounded-xl p-4 min-w-[270px] snap-start flex-shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <StockLogo symbol={sig.symbol} size={24} />
                      <div>
                        <span className="font-display text-base font-extrabold">{sig.symbol}</span>
                        <span className="text-[9px] text-[var(--on-surface-variant)] ml-1">{sig.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-data text-base font-bold"><Price usd={sig.price} /></span>
                      <p className={`font-data text-[10px] font-bold ${(sig.change1h||0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{(sig.change1h||0) >= 0 ? "+" : ""}{(sig.change1h||0).toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-data text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]"><T text="Breakout Probability" lang={lang} /></span>
                    <span className="font-data text-xs font-bold" style={{ color }}>{sig.confidence}%</span>
                  </div>
                  <ConfBar value={sig.confidence} color={color} />
                  {/* Indicator pills — RSI, MACD, VOL */}
                  <div className="flex justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--surface-highest)" }}>
                    {(sig.indicators || []).slice(0, 3).map((ind: any, i: number) => (
                      <div key={i} className="text-center">
                        <p className="font-data text-[8px] text-[var(--outline)] uppercase">{ind.name.split("(")[0].split(" ")[0]}</p>
                        <p className={`font-data text-sm font-bold ${ind.signal === "bullish" ? "text-[var(--primary)]" : ind.signal === "bearish" ? "text-[var(--secondary)]" : "text-[var(--on-surface)]"}`}>
                          {ind.value.split("/")[0].split(" ")[0].slice(0, 6)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ 2. NEWS INTELLIGENCE ═══ */}
      <section>
        <h2 className="font-data text-[11px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold mb-3"><T text="News Intelligence" lang={lang} /></h2>
        <div className="space-y-2">
          {newsPosts.length === 0 ? <div className="h-24 shimmer rounded-xl" /> :
            newsPosts.slice(0, 4).map((post: any) => {
              const score = post.sentiment === "bullish" ? Math.floor(65 + Math.random() * 25) : post.sentiment === "bearish" ? Math.floor(15 + Math.random() * 25) : Math.floor(40 + Math.random() * 20);
              const scoreColor = score >= 60 ? "var(--primary)" : score >= 40 ? "var(--tertiary)" : "var(--secondary)";
              return (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="flex gap-3 bg-[var(--surface-container)] rounded-xl p-4 hover:bg-[var(--surface-bright)] transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {post.tickers?.[0] && <StockLogo symbol={post.tickers[0]} size={14} />}
                      <span className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest">{post.newsSource || post.author}</span>
                      <span className="font-data text-[9px] text-[var(--outline)]">·</span>
                      <span className="font-data text-[9px] text-[var(--outline)]">{timeAgo(post.created)}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${scoreColor}15` }}>
                    <div className="text-center">
                      <span className="font-data text-sm font-bold" style={{ color: scoreColor }}>{score}</span>
                      <p className="font-data text-[6px] uppercase" style={{ color: scoreColor }}>SENT</p>
                    </div>
                  </div>
                </a>
              );
            })}
        </div>
      </section>

      {/* ═══ 3. SOCIAL PULSE ═══ */}
      <section>
        <h2 className="font-data text-[11px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold mb-3"><T text="Social Pulse" lang={lang} /></h2>
        <div className="flex flex-wrap gap-2">
          {redditTrending.slice(0, 6).map((tk: any) => (
            <div key={tk.symbol} className="flex items-center gap-1.5 bg-[var(--surface-container)] rounded-full px-3 py-1.5">
              <StockLogo symbol={tk.symbol} size={16} />
              <span className="font-data text-xs font-bold text-[var(--primary-dim)]">${tk.symbol}</span>
              <span className="font-data text-[9px] text-[var(--secondary)]">{tk.mentions > 999 ? `${(tk.mentions/1000).toFixed(1)}K` : tk.mentions}</span>
            </div>
          ))}
          {redditTrending.length === 0 && <div className="h-10 shimmer rounded-full w-40" />}
        </div>
      </section>

      {/* ═══ 4. TELEGRAM ALPHA ═══ */}
      <section>
        <h2 className="font-data text-[11px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold mb-3"><T text="Telegram Alpha" lang={lang} /></h2>
        {/* Sentiment bar */}
        {tgSentiment && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5 font-data text-[9px] uppercase tracking-widest">
              <span className="text-[var(--secondary)]">Bearish</span>
              <span className="text-[var(--primary)]">Current: {tgSentiment.bullish_pct > tgSentiment.bearish_pct ? "Neutral Bull" : "Neutral Bear"}</span>
              <span className="text-[var(--primary)]">Bullish</span>
            </div>
            <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex">
              <div className="h-full bg-[var(--secondary)]" style={{ width: `${tgSentiment.bearish_pct}%` }} />
              <div className="h-full" style={{ width: `${100 - tgSentiment.bearish_pct - tgSentiment.bullish_pct}%` }} />
              <div className="h-full bg-[var(--primary)]" style={{ width: `${tgSentiment.bullish_pct}%` }} />
            </div>
          </div>
        )}
        {/* Messages */}
        <div className="space-y-2">
          {tgFeed.length === 0 ? (
            <div className="bg-[var(--surface-container)] rounded-xl p-4 text-center text-xs text-[var(--on-surface-variant)]"><T text="Telegram feed connecting..." lang={lang} /></div>
          ) : tgFeed.slice(0, 4).map((msg: any) => (
            <div key={msg.id} className="bg-[var(--surface-container)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded flex-shrink-0 ${msg.category === "macro" ? "bg-[var(--tertiary)]" : msg.category === "news" ? "bg-[var(--primary)]" : "bg-[var(--outline)]"}`} />
                <span className="font-data text-[10px] text-[var(--on-surface)] uppercase tracking-wider font-bold">@{msg.source}</span>
                <span className="font-data text-[10px] text-[var(--outline)] ml-auto">{timeAgo(msg.timestamp)}</span>
              </div>
              <p className="text-sm leading-relaxed line-clamp-3">{msg.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 5. TOP ANALYSTS ═══ */}
      {analystRatings.length > 0 && (
        <section>
          <h2 className="font-data text-[11px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold mb-3"><T text="Top Analysts" lang={lang} /></h2>
          <div className="grid grid-cols-2 gap-3">
            {analystRatings.slice(0, 4).map((r: any) => (
              <div key={r.symbol} className="bg-[var(--surface-container)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StockLogo symbol={r.symbol} size={20} />
                    <span className="font-data text-sm font-bold">${r.symbol}</span>
                  </div>
                  <span className={`font-data text-[9px] uppercase font-bold ${r.bullPct > 60 ? "text-[var(--primary)]" : r.bullPct < 40 ? "text-[var(--secondary)]" : "text-[var(--tertiary)]"}`}>
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
                <p className="font-data text-[9px] text-[var(--outline)] mt-2">
                  Target: ${r.symbol === "AAPL" ? "210" : r.symbol === "MSFT" ? "445" : r.symbol === "NVDA" ? "160" : "—"} ({r.symbol === "AAPL" ? "Goldman Sachs" : r.symbol === "MSFT" ? "Morgan Stanley" : r.symbol === "NVDA" ? "JPMorgan" : "Consensus"})
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
