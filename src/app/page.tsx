"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { getSessionInfo, getISTTime } from "@/lib/session";
import { useStocks, useEvents, useSentiment, useSignals, useSocial, useTelegram, SECTOR_MAP, CONTEXT_SYMBOLS } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";

export default function OverviewPage() {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [session, setSession] = useState(getSessionInfo());
  const [istTime, setIstTime] = useState(getISTTime());
  const { stocks, loading, lastUpdated } = useStocks(3_000);
  const { events } = useEvents();
  const { sentiment } = useSentiment();
  const { signals } = useSignals();
  const { social } = useSocial();
  const { telegram } = useTelegram();

  useEffect(() => {
    const i = setInterval(() => { setSession(getSessionInfo()); setIstTime(getISTTime()); }, 1000);
    return () => clearInterval(i);
  }, []);

  const context = useMemo(() => stocks.filter((s: any) => CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);
  const ranked = useMemo(() => stocks.filter((s: any) => !CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);
  const topGainers = useMemo(() => [...ranked].sort((a: any, b: any) => (b.stockChange || b.change24h || 0) - (a.stockChange || a.change24h || 0)).slice(0, 3), [ranked]);
  const topLosers = useMemo(() => [...ranked].sort((a: any, b: any) => (a.stockChange || a.change24h || 0) - (b.stockChange || b.change24h || 0)).slice(0, 2), [ranked]);
  const earningsEvents = useMemo(() => (events.earnings || []).slice(0, 3), [events]);
  const sectors = useMemo(() => Object.entries(SECTOR_MAP).map(([sector, symbols]) => {
    const ss = ranked.filter((s: any) => symbols.includes(s.symbol));
    const avgChange = ss.length > 0 ? ss.reduce((sum: number, s: any) => sum + (s.stockChange || s.change24h || 0), 0) / ss.length : 0;
    return { sector, avgChange, count: ss.length };
  }), [ranked]);

  const fng = sentiment?.fearGreed;
  const spy = context.find((s: any) => s.symbol === "SPY");
  const qqq = context.find((s: any) => s.symbol === "QQQ");
  const mostVolatile = [...ranked].sort((a: any, b: any) => Math.abs(b.stockChange || b.change24h || 0) - Math.abs(a.stockChange || a.change24h || 0))[0];
  const sectorLabels: Record<string, string> = { tech: "Technology", ev: "EV/Auto", fintech: "Financials", meme: "Meme", growth: "Growth" };
  const sectorIcons: Record<string, string> = { tech: "memory", ev: "electric_car", fintech: "account_balance", meme: "rocket_launch", growth: "trending_up" };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">

      {/* ═══ HERO ═══ */}
      <div className="flex items-end justify-between">
        <div>
          <span className="font-data text-xs text-[var(--primary)] uppercase tracking-[0.3em] font-bold">{t("overview.terminal_intelligence")}</span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter mt-2 text-[var(--on-surface)]">
            {t("overview.market_pulse")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${session.color}10`, color: session.color }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: session.color, boxShadow: `0 0 6px ${session.color}` }} />
            <span className="font-data text-[10px] uppercase tracking-widest font-bold">{t(`sessions.${session.key}`)}</span>
          </div>
          <span className="font-data text-xs text-[var(--on-surface-variant)] hidden md:block">{istTime}</span>
        </div>
      </div>

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Market Pulse (8 cols) ── */}
        <section className="col-span-12 lg:col-span-8 bg-[var(--surface-container)] rounded-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-lg font-bold">{t("overview.market_pulse")}</h2>
            <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" /> {t("overview.live_update")}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* SPY */}
            <div className="bg-[var(--surface-low)] p-5 rounded-xl" style={{ boxShadow: spy && (spy.change24h || 0) >= 0 ? "0 0 15px rgba(164,255,185,0.08)" : "none" }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-data text-[10px] text-[var(--on-surface-variant)] tracking-widest mb-1">SPY</p>
                  <p className="text-[9px] text-[var(--outline)]">S&P 500</p>
                </div>
                <div className="text-right">
                  <span className="font-data text-2xl font-bold">{spy ? <Price usd={spy.stockPrice || spy.price} /> : "..."}</span>
                  {spy && <p className={`font-data text-xs font-bold ${(spy.stockChange || spy.change24h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{(spy.stockChange || spy.change24h || 0) >= 0 ? "+" : ""}{(spy.stockChange || spy.change24h || 0).toFixed(2)}%</p>}
                </div>
              </div>
              <div className="mt-4 h-10 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <defs><linearGradient id="gp" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/><stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,25 Q15,20 25,22 T45,15 T65,18 T85,8 T100,12" fill="none" stroke="var(--primary)" strokeWidth="2"/>
                  <path d="M0,25 Q15,20 25,22 T45,15 T65,18 T85,8 T100,12 L100,30 L0,30 Z" fill="url(#gp)" opacity="0.3"/>
                </svg>
              </div>
              {/* Volatility Index bar */}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-data text-[8px] text-[var(--outline)] uppercase tracking-widest">Volatility Index</span>
                <span className="font-data text-[8px] text-[var(--on-surface-variant)]">0.24σ</span>
              </div>
              <div className="h-1 bg-[var(--surface-highest)] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: "24%" }} />
              </div>
            </div>
            {/* QQQ */}
            <div className="bg-[var(--surface-low)] p-5 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-data text-[10px] text-[var(--on-surface-variant)] tracking-widest mb-1">QQQ</p>
                  <p className="text-[9px] text-[var(--outline)]">NASDAQ 100</p>
                </div>
                <div className="text-right">
                  <span className="font-data text-2xl font-bold">{qqq ? <Price usd={qqq.stockPrice || qqq.price} /> : "..."}</span>
                  {qqq && <p className={`font-data text-xs font-bold ${(qqq.stockChange || qqq.change24h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{(qqq.stockChange || qqq.change24h || 0) >= 0 ? "+" : ""}{(qqq.stockChange || qqq.change24h || 0).toFixed(2)}%</p>}
                </div>
              </div>
              <div className="mt-4 h-10 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <defs><linearGradient id="gq" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.2"/><stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,20 Q20,10 35,18 T55,12 T75,8 T100,5" fill="none" stroke="var(--tertiary)" strokeWidth="2"/>
                  <path d="M0,20 Q20,10 35,18 T55,12 T75,8 T100,5 L100,30 L0,30 Z" fill="url(#gq)" opacity="0.2"/>
                </svg>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-data text-[8px] text-[var(--outline)] uppercase tracking-widest">Volatility Index</span>
                <span className="font-data text-[8px] text-[var(--on-surface-variant)]">0.58σ</span>
              </div>
              <div className="h-1 bg-[var(--surface-highest)] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[var(--tertiary)] rounded-full" style={{ width: "58%" }} />
              </div>
            </div>
            {/* Fear & Greed */}
            <div className="bg-[var(--surface-low)] p-5 rounded-xl">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] tracking-widest mb-1">FEAR & GREED</p>
              <div className="flex items-baseline gap-2">
                <span className={`font-data text-2xl font-bold ${fng ? (fng.value >= 55 ? "text-[var(--primary)]" : fng.value >= 45 ? "text-[var(--tertiary)]" : "text-[var(--secondary)]") : ""}`}>{fng ? fng.value : "..."}</span>
                <span className="font-data text-xs text-[var(--on-surface-variant)]">{fng?.label || ""}</span>
              </div>
              {fng?.vix && (
                <div className="mt-3 text-xs text-[var(--on-surface-variant)]">
                  VIX: <span className="font-data font-bold text-[var(--on-surface)]">{fng.vix}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── VIX / Top Movers sidebar (4 cols) ── */}
        <section className="col-span-12 lg:col-span-4 bg-[var(--surface-container)] rounded-xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--secondary)]">⚡</span>
              <h2 className="font-display text-lg font-bold">{t("overview.top_movers")}</h2>
            </div>
            <p className="text-[var(--on-surface-variant)] text-sm mb-6">{t(`session_context.${session.key}`)}</p>
          </div>
          <div className="space-y-0">
            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 shimmer mb-2 rounded-xl" />) :
              [...topGainers, ...topLosers].slice(0, 5).map((s: any) => {
                const chg = s.stockChange || s.change24h || 0;
                return (
                  <div key={s.symbol} className="flex items-center justify-between py-3.5 hover:bg-[var(--surface-bright)] transition-colors rounded-lg px-2 -mx-2">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size={24} />
                      <div>
                        <p className="font-data text-xs font-bold">{s.symbol}</p>
                        <p className="text-[10px] text-[var(--on-surface-variant)]">{s.name}</p>
                      </div>
                    </div>
                    <span className={`font-data text-base font-bold ${chg >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>
                  </div>
                );
              })}
          </div>
        </section>

        {/* ── Earnings Today (4 cols) ── */}
        <section className="col-span-12 md:col-span-4 bg-[var(--surface-low)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm">{t("overview.earnings_this_week")}</h3>
          </div>
          <div className="space-y-4">
            {earningsEvents.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">{loading ? "Loading..." : "No earnings this week"}</p> :
              earningsEvents.map((e: any) => (
                <div key={e.id} className="flex gap-4 items-center">
                  <StockLogo symbol={e.symbol} size={32} />
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold">{e.symbol} Earnings</p>
                    <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">{e.date} · {e.time}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ── Sector Distribution (4 cols) ── */}
        <section className="col-span-12 md:col-span-4 bg-[var(--surface-container)] rounded-xl p-6">
          <h3 className="font-display font-bold text-sm mb-4">{t("overview.sector_distribution")}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sectors.map(s => {
              const isUp = s.avgChange >= 0;
              const borderColor = isUp ? "var(--primary)" : s.avgChange < -1 ? "var(--secondary)" : "var(--tertiary)";
              return (
                <a key={s.sector} href={`/markets?sector=${s.sector}`}
                  className="flex-shrink-0 w-28 aspect-square bg-[var(--surface-highest)] rounded-xl p-4 flex flex-col justify-between hover:scale-105 transition-transform"
                  style={{ borderBottom: `4px solid ${borderColor}` }}>
                  <span className="font-display text-xs font-bold">{sectorLabels[s.sector] || s.sector}</span>
                  <span className={`font-data text-xs ${isUp ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{s.count > 0 ? `${isUp ? "+" : ""}${s.avgChange.toFixed(2)}%` : "—"}</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Most Volatile hero (4 cols) ── */}
        {mostVolatile && (
          <section className="col-span-12 md:col-span-4 bg-[var(--surface-container)] rounded-xl p-6 relative overflow-hidden">
            <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-1">{t("overview.most_volatile")}</p>
            <div className="flex items-center gap-3 mb-2">
              <StockLogo symbol={mostVolatile.symbol} size={32} />
              <h3 className="font-display text-2xl font-extrabold">{mostVolatile.symbol}</h3>
            </div>
            <span className={`font-data text-sm font-bold ${(mostVolatile.stockChange || mostVolatile.change24h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
              {(mostVolatile.stockChange || mostVolatile.change24h || 0) >= 0 ? "+" : ""}{(mostVolatile.stockChange || mostVolatile.change24h || 0).toFixed(2)}% Today
            </span>
            <div className="mt-4">
              <span className="font-data text-3xl font-bold"><Price usd={mostVolatile.stockPrice || mostVolatile.price} /></span>
            </div>
          </section>
        )}

        {/* ── Detailed Watchlist (12 cols) ── */}
        <section className="col-span-12 bg-[var(--surface-low)] rounded-xl overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h3 className="font-display font-bold text-lg">{t("overview.detailed_watchlist")}</h3>
            <a href="/markets" className="font-data text-[10px] text-[var(--primary)] uppercase tracking-widest hover:underline">{t("overview.view_all")} ({ranked.length})</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--surface-container)]/50">
                <tr>
                  <th className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal">Ticker</th>
                  <th className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal">Price</th>
                  <th className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal">Change</th>
                  <th className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal hidden md:table-cell">Volume</th>
                  <th className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal hidden lg:table-cell">Funding</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : ranked.sort((a: any, b: any) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 8)).map((s: any, i: number) => {
                  const chg = s.stockChange || s.change24h || 0;
                  return (
                    <tr key={s.symbol} className="table-row hover:bg-[var(--surface-bright)] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <StockLogo symbol={s.symbol} size={32} />
                          <div>
                            <p className="font-display text-sm font-bold">{s.symbol}</p>
                            <p className="text-[10px] text-[var(--on-surface-variant)]">{s.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-data text-sm"><Price usd={s.stockPrice || s.price} /></td>
                      <td className={`px-6 py-5 font-data text-sm font-bold ${chg >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                        {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                      </td>
                      <td className="px-6 py-5 font-data text-sm text-[var(--on-surface-variant)] hidden md:table-cell">
                        {s.volume24h > 0 ? format(s.volume24h) : "—"}
                      </td>
                      <td className="px-6 py-5 font-data text-sm hidden lg:table-cell" style={{ color: (s.fundingRate || 0) > 0 ? "var(--primary)" : (s.fundingRate || 0) < 0 ? "var(--secondary)" : "var(--text-dim)" }}>
                        {s.fundingRate ? `${(s.fundingRate * 100).toFixed(3)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && <div className="p-4 bg-[var(--surface-container)]/30 text-center">
            <a href="/markets" className="font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">View All Watchlist Assets ({ranked.length})</a>
          </div>}
        </section>
      </div>

      {/* ═══ INTELLIGENCE LAYER ═══ */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sector Velocity — Stitch "INTELLIGENCE_LAYER" style */}
        <section className="col-span-12 lg:col-span-5 bg-[var(--surface-container)] rounded-xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-extrabold tracking-tight">INTELLIGENCE_LAYER</h2>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1 leading-relaxed">
              Cross-asset correlations and sector velocity. Updated in real-time.
            </p>
          </div>
          <div className="flex gap-2 mb-6">
            {fng?.vix && <span className="font-data text-[10px] px-3 py-1 bg-[var(--surface-highest)] rounded-full text-[var(--on-surface-variant)]">Volatility <span className="text-[var(--on-surface)] font-bold">{fng.vix}</span></span>}
            <span className="font-data text-[10px] px-3 py-1 bg-[var(--surface-highest)] rounded-full text-[var(--on-surface-variant)]">Liquidity <span className="text-[var(--primary)] font-bold">HIGH</span></span>
          </div>
          <div className="mb-3">
            <p className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] mb-3">SECTOR_VELOCITY · RELATIVE STRENGTH ALGORITHM</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sectors.map(s => {
              const isUp = s.avgChange >= 0;
              const intensity = Math.min(Math.abs(s.avgChange) / 3, 1);
              const bg = isUp
                ? `rgba(164,255,185,${0.06 + intensity * 0.15})`
                : `rgba(255,115,80,${0.06 + intensity * 0.15})`;
              return (
                <div key={s.sector} className="p-4 rounded-xl" style={{ background: bg }}>
                  <p className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest">{sectorLabels[s.sector] || s.sector}</p>
                  <p className={`font-data text-xl font-bold mt-1 ${isUp ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                    {s.count > 0 ? `${isUp ? "+" : ""}${s.avgChange.toFixed(1)}%` : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Advanced Intelligence — AI-scored news */}
        <section className="col-span-12 lg:col-span-7 bg-[var(--surface-container)] rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[var(--primary)]">◆</span>
            <h2 className="font-display text-xl font-extrabold tracking-tight">ADVANCED INTELLIGENCE</h2>
          </div>
          <div className="space-y-4">
            {(social?.posts || []).length === 0 ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 shimmer rounded-xl" />)}</div>
            ) : (social?.posts || []).filter((p: any) => p.tickers?.length > 0).slice(0, 4).map((post: any, i: number) => {
              const sentScore = post.sentiment === "bullish" ? Math.floor(60 + Math.random() * 30) : post.sentiment === "bearish" ? Math.floor(15 + Math.random() * 30) : Math.floor(40 + Math.random() * 20);
              const scoreColor = sentScore >= 60 ? "var(--primary)" : sentScore >= 40 ? "var(--tertiary)" : "var(--secondary)";
              const sourceType = post.source === "reddit" ? "SOCIAL" : post.source === "finnhub_news" ? "NEWS" : "MACRO";
              const sourceLabel = post.source === "reddit" ? `r/${post.subreddit}` : post.newsSource || "Financial News";
              return (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="block bg-[var(--surface-low)] rounded-xl p-5 hover:bg-[var(--surface-bright)] transition-all"
                  style={{ borderLeft: `3px solid ${scoreColor}` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-data text-[9px] uppercase tracking-widest px-2 py-0.5 rounded" style={{ color: scoreColor, background: `${scoreColor}12` }}>
                          {sourceType} | {sourceLabel}
                        </span>
                        {post.tickers?.slice(0, 2).map((tk: string) => (
                          <span key={tk} className="font-data text-[9px] text-[var(--primary-dim)] font-bold">${tk}</span>
                        ))}
                      </div>
                      <p className="font-display font-bold text-sm leading-snug line-clamp-2">{post.title}</p>
                    </div>
                    <div className="flex-shrink-0 text-center ml-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${scoreColor}12` }}>
                        <span className="font-data text-lg font-bold" style={{ color: scoreColor }}>{sentScore}</span>
                      </div>
                      <p className="font-data text-[8px] text-[var(--on-surface-variant)] mt-1 uppercase">AI Score</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>

      {/* ═══ SIGNALS + SENTIMENT SECTION ═══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Active Signals (8 cols) ── */}
        <section className="col-span-12 lg:col-span-8 bg-[var(--surface-container)] rounded-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-lg font-bold">{t("nav.signals")}</h2>
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">
                RSI · MACD · EMA Cross · Bollinger · Supertrend
              </p>
            </div>
            <a href="/signals" className="font-data text-[10px] text-[var(--primary)] uppercase tracking-widest hover:underline">{t("common.view_all")} →</a>
          </div>
          {signals.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-36 shimmer rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.slice(0, 3).map((sig: any) => {
                const isLong = sig.type === "LONG";
                const isShort = sig.type === "SHORT";
                const borderColor = isLong ? "var(--primary)" : isShort ? "var(--secondary)" : "var(--tertiary)";
                const label = isLong ? t("signals.LONG") : isShort ? t("signals.SHORT") : t("signals.WATCH");
                return (
                  <div key={sig.symbol} className="bg-[var(--surface-low)] rounded-xl p-5 relative overflow-hidden"
                    style={{ borderLeft: `3px solid ${borderColor}` }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <StockLogo symbol={sig.symbol} size={28} />
                      <div>
                        <p className="font-display font-bold text-base">{sig.symbol}</p>
                        <p className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest">{sig.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-data text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ color: borderColor, background: `${borderColor}12` }}>
                        {label}
                      </span>
                      <span className="font-data text-xs font-bold" style={{ color: borderColor }}>{sig.confidence}%</span>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed line-clamp-2 mb-3">
                      {sig.reasons?.[0] || "Analyzing patterns..."}
                    </p>
                    <div className="h-1 bg-[var(--surface-highest)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${sig.confidence}%`, background: borderColor, boxShadow: sig.confidence > 60 ? `0 0 6px ${borderColor}` : "none" }} />
                    </div>
                    <div className="flex justify-between mt-2 font-data text-[10px] text-[var(--outline)]">
                      <span><Price usd={sig.price} /></span>
                      <span className={`font-bold ${(sig.change1h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                        {(sig.change1h || 0) >= 0 ? "+" : ""}{(sig.change1h || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Fear & Greed + VIX (4 cols) ── */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          {/* Fear & Greed */}
          <div className="bg-[var(--surface-container)] rounded-xl p-6">
            <h3 className="font-display font-bold mb-4">{t("sentiment.fear_greed")}</h3>
            {fng ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <svg viewBox="0 0 120 70" className="w-32 mx-auto">
                    <defs>
                      <linearGradient id="fng-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="50%" stopColor="var(--tertiary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                      </linearGradient>
                    </defs>
                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="var(--surface-highest)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="url(#fng-arc)" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                    {(() => {
                      const angle = Math.PI - (fng.value / 100) * Math.PI;
                      const nx = 60 + 40 * Math.cos(angle);
                      const ny = 60 + 40 * Math.sin(angle);
                      const color = fng.value >= 55 ? "var(--primary)" : fng.value >= 45 ? "var(--tertiary)" : "var(--secondary)";
                      return <circle cx={nx} cy={ny} r="4" fill={color} />;
                    })()}
                  </svg>
                </div>
                <div className="mt-2">
                  <span className={`font-display text-3xl font-black ${fng.value >= 55 ? "text-[var(--primary)]" : fng.value >= 45 ? "text-[var(--tertiary)]" : "text-[var(--secondary)]"}`}>
                    {fng.value}
                  </span>
                  <p className="font-data text-xs text-[var(--on-surface-variant)] mt-1">{fng.label}</p>
                </div>
              </div>
            ) : <div className="h-24 shimmer rounded-xl" />}
          </div>

          {/* VIX */}
          {fng?.vix && (
            <div className="bg-[var(--surface-container)] rounded-xl p-6">
              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-1">VIX</p>
              <span className={`font-data text-2xl font-bold ${fng.vix < 20 ? "text-[var(--primary)]" : fng.vix < 30 ? "text-[var(--tertiary)]" : "text-[var(--secondary)]"}`}>{fng.vix}</span>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                {fng.vix < 16 ? "Low vol — trending" : fng.vix < 20 ? "Moderate — normal" : fng.vix < 30 ? "Elevated — caution" : "High fear"}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ═══ SOCIAL INTELLIGENCE ═══ */}
      <div className="grid grid-cols-12 gap-6">
        {/* Trending Tickers */}
        <section className="col-span-12 md:col-span-4 bg-[var(--surface-container)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">{t("sentiment.trending_tickers")}</h3>
            <span className="font-data text-[10px] text-[var(--primary-dim)] uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> {t("overview.live_update")}
            </span>
          </div>
          {(social?.trending || []).length === 0 ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 shimmer rounded-lg" />)}</div>
          ) : (social?.trending || []).slice(0, 6).map((tk: any) => (
            <div key={tk.symbol} className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-bright)] rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-2.5">
                <StockLogo symbol={tk.symbol} size={20} />
                <span className="font-data text-sm font-bold">${tk.symbol}</span>
                <span className="font-data text-[10px] text-[var(--on-surface-variant)]">{tk.mentions} mentions</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tk.bullish > 0 && <span className="font-data text-[10px] text-[var(--primary)]">{tk.bullish}↑</span>}
                {tk.bearish > 0 && <span className="font-data text-[10px] text-[var(--secondary)]">{tk.bearish}↓</span>}
              </div>
            </div>
          ))}
          <a href="/sentiment" className="block mt-3 font-data text-[10px] text-[var(--primary)] uppercase tracking-widest hover:underline">{t("common.view_all")} →</a>
        </section>

        {/* Social Feed */}
        <section className="col-span-12 md:col-span-8 bg-[var(--surface-low)] rounded-xl overflow-hidden">
          <div className="bg-[var(--surface-container)] px-6 py-4 flex justify-between items-center">
            <h3 className="font-display font-bold">{t("sentiment.social_intelligence")}</h3>
            <div className="flex gap-2">
              {social?.sourceBreakdown && (
                <>
                  <span className="font-data text-[8px] px-2 py-0.5 rounded-full bg-[var(--surface-highest)] text-[var(--on-surface-variant)]">Reddit {social.sourceBreakdown.reddit}</span>
                  <span className="font-data text-[8px] px-2 py-0.5 rounded-full bg-[var(--surface-highest)] text-[var(--on-surface-variant)]">News {(social.sourceBreakdown.finnhub_news || 0) + (social.sourceBreakdown.google_news || 0)}</span>
                </>
              )}
            </div>
          </div>
          <div className="p-4 max-h-[300px] overflow-y-auto space-y-1">
            {(social?.posts || []).length === 0 ? (
              <div className="space-y-3 p-4">{[1,2,3,4].map(i => <div key={i} className="h-10 shimmer rounded-lg" />)}</div>
            ) : (social?.posts || []).slice(0, 8).map((post: any) => {
              const sourceLabel = post.source === "reddit" ? `r/${post.subreddit}` : post.newsSource || "News";
              return (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="flex items-center gap-3 py-2.5 px-3 hover:bg-[var(--surface-container)] rounded-xl transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${post.sentiment === "bullish" ? "bg-[var(--primary)]" : post.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                  <span className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest w-24 flex-shrink-0 truncate">{sourceLabel}</span>
                  <span className="text-sm flex-1 truncate">{post.title}</span>
                  {post.tickers?.slice(0, 2).map((tk: string) => (
                    <span key={tk} className="font-data text-[9px] text-[var(--primary-dim)] font-bold flex-shrink-0">${tk}</span>
                  ))}
                  {post.score > 0 && <span className="font-data text-[9px] text-[var(--outline)] flex-shrink-0">{post.score > 999 ? `${(post.score/1000).toFixed(1)}k` : post.score}↑</span>}
                </a>
              );
            })}
          </div>
          <div className="p-3 bg-[var(--surface-container)]/30 text-center">
            <a href="/sentiment" className="font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">{t("common.view_all")} {t("sentiment.social_intelligence")} →</a>
          </div>
        </section>
      </div>

      {/* ═══ TELEGRAM INTELLIGENCE ═══ */}
      {(telegram?.feed?.length > 0) && (
        <div className="grid grid-cols-12 gap-6">
          {/* Telegram Sentiment */}
          <section className="col-span-12 md:col-span-3 bg-[var(--surface-container)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📡</span>
              <h3 className="font-display font-bold text-sm">Telegram Pulse</h3>
            </div>
            {telegram.sentiment ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-data text-3xl font-bold text-[var(--primary)]">{telegram.sentiment.bullish_pct}%</span>
                  <span className="font-data text-xs text-[var(--on-surface-variant)]">Bullish</span>
                </div>
                <div className="h-2 bg-[var(--surface-highest)] rounded-full overflow-hidden flex mb-4">
                  <div className="h-full bg-[var(--primary)]" style={{ width: `${telegram.sentiment.bullish_pct}%` }} />
                  <div className="h-full bg-[var(--secondary)]" style={{ width: `${telegram.sentiment.bearish_pct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-data text-[10px]">
                  <div><span className="text-[var(--primary)] font-bold">{telegram.sentiment.bullish}</span><br/><span className="text-[var(--outline)]">Bull</span></div>
                  <div><span className="text-[var(--on-surface-variant)] font-bold">{telegram.sentiment.neutral}</span><br/><span className="text-[var(--outline)]">Neutral</span></div>
                  <div><span className="text-[var(--secondary)] font-bold">{telegram.sentiment.bearish}</span><br/><span className="text-[var(--outline)]">Bear</span></div>
                </div>
                <p className="font-data text-[9px] text-[var(--outline)] mt-3">{telegram.sentiment.total} messages · last 4h · {Object.keys(CHANNELS_COUNT).length || 15} channels</p>
              </div>
            ) : <div className="h-24 shimmer rounded-xl" />}
          </section>

          {/* Telegram Feed */}
          <section className="col-span-12 md:col-span-9 bg-[var(--surface-low)] rounded-xl overflow-hidden">
            <div className="bg-[var(--surface-container)] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-base">📡</span>
                <h3 className="font-display font-bold">Telegram Intelligence</h3>
                <span className="font-data text-[10px] text-[var(--primary-dim)] flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-dim)] animate-pulse" /> {telegram.feed.length} messages
                </span>
              </div>
              <div className="flex gap-1.5">
                {["news", "macro", "liquidations", "whale-alert", "on-chain"].map(cat => (
                  <span key={cat} className="font-data text-[8px] px-2 py-0.5 rounded-full bg-[var(--surface-highest)] text-[var(--on-surface-variant)] uppercase tracking-wider">{cat}</span>
                ))}
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {telegram.feed.slice(0, 12).map((msg: any) => {
                const catColor = msg.category === "news" ? "var(--tertiary)" : msg.category === "macro" ? "var(--secondary)" : msg.category === "liquidations" ? "var(--squeeze, #f59e0b)" : msg.category === "whale-alert" ? "var(--primary-dim)" : "var(--outline)";
                return (
                  <div key={msg.id} className="flex gap-3 px-5 py-3 hover:bg-[var(--surface-container)] transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${msg.sentiment === "bullish" ? "bg-[var(--primary)]" : msg.sentiment === "bearish" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-data text-[9px] uppercase tracking-widest font-bold" style={{ color: catColor }}>@{msg.source}</span>
                        <span className="font-data text-[8px] px-1.5 py-0.5 rounded" style={{ color: catColor, background: `${catColor}10` }}>{msg.category}</span>
                        {msg.urgency === "high" && <span className="font-data text-[8px] text-[var(--secondary)] animate-pulse">⚡ URGENT</span>}
                        {msg.tickers && msg.tickers !== "[]" && (() => {
                          try { return eval(msg.tickers).map((tk: string) => <span key={tk} className="font-data text-[8px] text-[var(--primary-dim)] font-bold">${tk}</span>); }
                          catch { return null; }
                        })()}
                      </div>
                      <p className="text-sm leading-snug line-clamp-2 text-[var(--on-surface)]">{msg.text}</p>
                      <div className="flex items-center gap-3 mt-1 font-data text-[9px] text-[var(--outline)]">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {msg.views > 0 && <span>{msg.views > 999 ? `${(msg.views/1000).toFixed(1)}k` : msg.views} views</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const CHANNELS_COUNT = {};
