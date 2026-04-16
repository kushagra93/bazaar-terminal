"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { getSessionInfo, getISTTime } from "@/lib/session";
import { useStocks, useEvents, useSentiment, SECTOR_MAP, CONTEXT_SYMBOLS } from "@/lib/data";
import { TrendingUp, TrendingDown, Zap, Calendar, BarChart3, ArrowUp, ArrowDown, Activity, Shield, ExternalLink } from "lucide-react";
import { StockLogo } from "@/components/StockLogo";

function MiniChange({ pct }: { pct: number }) {
  const c = pct > 0 ? "var(--bull)" : pct < 0 ? "var(--bear)" : "var(--neutral)";
  return (
    <span className="font-data text-xs font-semibold inline-flex items-center gap-0.5" style={{ color: c }}>
      {pct > 0 ? <ArrowUp size={10} /> : pct < 0 ? <ArrowDown size={10} /> : null}
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

export default function OverviewPage() {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [session, setSession] = useState(getSessionInfo());
  const [istTime, setIstTime] = useState(getISTTime());
  const { stocks, loading, lastUpdated } = useStocks(10_000);
  const { events } = useEvents();
  const { sentiment } = useSentiment();

  useEffect(() => {
    const i = setInterval(() => { setSession(getSessionInfo()); setIstTime(getISTTime()); }, 1000);
    return () => clearInterval(i);
  }, []);

  const context = useMemo(() => stocks.filter((s: any) => CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);
  const ranked = useMemo(() => stocks.filter((s: any) => !CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);
  const sectors = useMemo(() => Object.entries(SECTOR_MAP).map(([sector, symbols]) => {
    const ss = ranked.filter((s: any) => symbols.includes(s.symbol));
    const avgChange = ss.length > 0 ? ss.reduce((sum: number, s: any) => sum + (s.stockChange || s.change24h || 0), 0) / ss.length : 0;
    const totalOI = ss.reduce((sum: number, s: any) => sum + (s.openInterest || 0), 0);
    return { sector, avgChange, totalOI, count: ss.length };
  }), [ranked]);

  const topMovers = useMemo(() => [...ranked].sort((a: any, b: any) => Math.abs(b.stockChange || b.change24h || 0) - Math.abs(a.stockChange || a.change24h || 0)).slice(0, 8), [ranked]);
  const negFunding = useMemo(() => ranked.filter((s: any) => s.fundingRate < -0.001).sort((a: any, b: any) => a.fundingRate - b.fundingRate).slice(0, 4), [ranked]);
  const posFunding = useMemo(() => ranked.filter((s: any) => s.fundingRate > 0.005).sort((a: any, b: any) => b.fundingRate - a.fundingRate).slice(0, 4), [ranked]);
  const earningsEvents = useMemo(() => (events.earnings || []).slice(0, 6), [events]);

  const totalOI = ranked.reduce((s: number, st: any) => s + (st.openInterest || 0), 0);
  const totalVol = ranked.reduce((s: number, st: any) => s + (st.volume24h || 0), 0);
  const fng = sentiment?.fearGreed;
  const sectorLabels: Record<string, string> = { tech: "Tech", ev: "EV/Auto", fintech: "Fintech", meme: "Meme", growth: "Growth" };

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* ═══ ROW 1: Hero Session + Market Context ═══ */}
      <div className="grid grid-cols-12 gap-3" style={{ minHeight: 180 }}>
        {/* Session Card — spans 5 */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl p-5 relative overflow-hidden" style={{
          background: `linear-gradient(145deg, ${session.color}0a 0%, var(--bg-surface) 50%)`,
          border: `1px solid ${session.color}18`,
        }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-[0.07]" style={{ background: session.color }} />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${session.color}15`, color: session.color, animation: session.key === "open" ? "pulse-dot 2s ease infinite" : "none" }}>
                {session.icon}
              </div>
              <div>
                <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-[3px]">Market Pulse</div>
                <div className="font-display text-xl font-bold" style={{ color: session.color }}>{session.label}</div>
              </div>
            </div>
            <div className="mt-3 font-data text-2xl font-semibold text-[var(--text-primary)]">{istTime}</div>
            <div className="text-[10px] font-body text-[var(--text-dim)] mt-0.5">{session.sublabel}</div>
            {/* Quick stats */}
            <div className="flex gap-4 mt-4 text-[11px] font-body text-[var(--text-secondary)]">
              {context[0] && <span>SPY <span className="font-data" style={{ color: (context[0] as any).change24h >= 0 ? "var(--bull)" : "var(--bear)" }}>{((context[0] as any).change24h >= 0 ? "+" : "")}{((context[0] as any).change24h || 0).toFixed(2)}%</span></span>}
              {context[1] && <span>QQQ <span className="font-data" style={{ color: (context[1] as any).change24h >= 0 ? "var(--bull)" : "var(--bear)" }}>{((context[1] as any).change24h >= 0 ? "+" : "")}{((context[1] as any).change24h || 0).toFixed(2)}%</span></span>}
              {fng && <span>F&G <span className="font-data" style={{ color: fng.value >= 55 ? "var(--bull)" : fng.value >= 45 ? "var(--bazaar-gold)" : "var(--bear)" }}>{fng.value}</span></span>}
            </div>
            {/* Session bar */}
            <div className="mt-3 flex gap-0.5 h-1 rounded-full overflow-hidden">
              {[{ key: "premarket", color: "var(--session-premarket)", w: "23%" }, { key: "open", color: "var(--session-open)", w: "27%" }, { key: "afterhours", color: "var(--session-afterhours)", w: "17%" }, { key: "overnight", color: "var(--session-overnight)", w: "33%" }].map(s => (
                <div key={s.key} className="h-full rounded-sm" style={{ background: s.color, width: s.w, opacity: session.key === s.key ? 1 : 0.1 }} />
              ))}
            </div>
          </div>
        </div>

        {/* SPY + QQQ — spans 4 */}
        <div className="col-span-6 lg:col-span-2 flex flex-col gap-3">
          {(loading && context.length === 0 ? [null, null] : context.slice(0, 2)).map((s: any, i) =>
            s ? (
              <div key={s.symbol} className="flex-1 rounded-xl p-4 relative overflow-hidden" style={{
                background: `linear-gradient(155deg, ${s.change24h >= 0 ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)"}, var(--bg-surface))`,
                border: `1px solid ${s.change24h >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}`,
              }}>
                <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">{s.symbol}</div>
                <div className="font-display text-xl font-bold mt-1"><Price usd={s.stockPrice || s.price} /></div>
                <MiniChange pct={s.stockChange || s.change24h || 0} />
              </div>
            ) : <div key={i} className="flex-1 rounded-xl shimmer" />
          )}
        </div>

        {/* Stats — spans 3 */}
        <div className="col-span-6 lg:col-span-2 flex flex-col gap-3">
          <div className="flex-1 rounded-xl p-3 border border-[var(--border-dim)]" style={{ background: "linear-gradient(155deg, rgba(232,160,69,0.04), var(--bg-surface))" }}>
            <div className="flex items-center gap-1.5 text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">
              <BarChart3 size={10} className="text-[var(--bazaar-gold)]" /> OI
            </div>
            <div className="font-display text-lg font-bold mt-1 text-[var(--bazaar-gold)]">{loading ? "..." : format(totalOI)}</div>
          </div>
          <div className="flex-1 rounded-xl p-3 border border-[var(--border-dim)]" style={{ background: "linear-gradient(155deg, rgba(99,102,241,0.04), var(--bg-surface))" }}>
            <div className="flex items-center gap-1.5 text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">
              <Activity size={10} className="text-indigo-400" /> Volume
            </div>
            <div className="font-display text-lg font-bold mt-1 text-indigo-400">{loading ? "..." : format(totalVol)}</div>
          </div>
        </div>

        {/* Perps count + freshness — spans 3 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          <div className="flex-1 rounded-xl p-3 border border-[var(--border-dim)] bg-[var(--bg-surface)]">
            <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">Live Perps</div>
            <div className="font-display text-lg font-bold mt-1">{ranked.filter((s:any) => s.openInterest > 0).length} <span className="text-sm font-data text-[var(--text-dim)]">with OI</span></div>
            <div className="font-data text-[10px] text-[var(--text-dim)] mt-1">{ranked.length} stocks tracked total</div>
          </div>
          <div className="flex-1 rounded-xl p-3 border border-[var(--border-dim)] bg-[var(--bg-surface)] flex flex-col justify-center">
            <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider">Sources</div>
            <div className="flex gap-1.5 mt-1.5">
              {["coinbase", "kraken", "finnhub"].map(src => (
                <span key={src} className="text-[8px] font-data px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-dim)]">{src}</span>
              ))}
            </div>
            {lastUpdated && <div className="font-data text-[9px] text-[var(--bazaar-gold)] mt-1.5">{Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago</div>}
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: Movers + Funding + Earnings ═══ */}
      <div className="grid grid-cols-12 gap-3">
        {/* Top Movers — 5 cols */}
        <div className="col-span-12 md:col-span-5 card p-4">
          <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={11} className="text-[var(--bull)]" /> Biggest Movers
          </div>
          {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-7 rounded shimmer mb-2" />) :
            topMovers.map((s: any, i: number) => {
              const chg = s.stockChange || s.change24h || 0;
              return (
                <div key={s.symbol} className="flex items-center justify-between py-1.5 border-b border-[var(--border-dim)] last:border-0 hover:bg-[var(--bg-elevated)] transition rounded px-1 -mx-1">
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[9px] text-[var(--text-dim)] w-4">#{i+1}</span>
                    <StockLogo symbol={s.symbol} size={18} />
                    <span className="font-body text-[13px] font-semibold">{s.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-data text-[11px] text-[var(--text-secondary)]"><Price usd={s.stockPrice || s.price} /></span>
                    <span className={`font-data text-[11px] font-semibold px-1.5 py-0.5 rounded ${chg >= 0 ? "text-[var(--bull)] bg-[var(--bull-dim)]" : "text-[var(--bear)] bg-[var(--bear-dim)]"}`}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Funding — 3 cols */}
        <div className="col-span-6 md:col-span-3 card p-4">
          <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap size={11} className="text-[var(--squeeze)]" /> Funding Rates
          </div>
          {negFunding.length > 0 && (
            <div className="mb-3">
              <div className="text-[8px] font-body text-[var(--bear)] uppercase tracking-wider mb-1.5">Shorts pay longs</div>
              {negFunding.map((s: any) => (
                <div key={s.symbol} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-1.5"><StockLogo symbol={s.symbol} size={16} /><span className="font-body text-[13px] font-semibold">{s.symbol}</span></div>
                  <span className="font-data text-[11px] text-[var(--bear)] font-medium">{(s.fundingRate * 100).toFixed(4)}%</span>
                </div>
              ))}
            </div>
          )}
          {posFunding.length > 0 && (
            <div>
              <div className="text-[8px] font-body text-[var(--bull)] uppercase tracking-wider mb-1.5">Longs pay shorts</div>
              {posFunding.map((s: any) => (
                <div key={s.symbol} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-1.5"><StockLogo symbol={s.symbol} size={16} /><span className="font-body text-[13px] font-semibold">{s.symbol}</span></div>
                  <span className="font-data text-[11px] text-[var(--bull)] font-medium">+{(s.fundingRate * 100).toFixed(4)}%</span>
                </div>
              ))}
            </div>
          )}
          {!loading && negFunding.length === 0 && posFunding.length === 0 && (
            <div className="text-[11px] text-[var(--text-dim)] py-6 text-center">No extreme rates</div>
          )}
        </div>

        {/* Earnings — 4 cols */}
        <div className="col-span-6 md:col-span-4 card p-4">
          <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={11} className="text-[var(--event-earnings)]" /> Upcoming Earnings
          </div>
          {earningsEvents.length === 0 ? <div className="text-[11px] text-[var(--text-dim)] py-4 text-center">{loading ? "Loading..." : "No upcoming earnings"}</div> :
            earningsEvents.map((e: any) => {
              const daysAway = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
              return (
                <div key={e.id} className="flex items-center gap-2.5 py-1.5 border-b border-[var(--border-dim)] last:border-0">
                  <StockLogo symbol={e.symbol} size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-[13px] font-semibold">{e.symbol}</span>
                      {daysAway <= 1 && <span className="text-[7px] font-body font-bold px-1 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)] animate-pulse">{daysAway <= 0 ? "TODAY" : "TMW"}</span>}
                    </div>
                    <div className="text-[9px] font-data text-[var(--text-dim)]">{e.time} · {e.date}</div>
                  </div>
                  <span className="font-data text-[10px] text-[var(--text-dim)]">{daysAway}d</span>
                </div>
              );
            })}
          <a href="/events" className="block mt-2 text-[10px] text-[var(--bazaar-gold)] hover:underline font-body">All events →</a>
        </div>
      </div>

      {/* ═══ ROW 3: Sector Heatmap ═══ */}
      <div className="grid grid-cols-5 gap-2">
        {sectors.map(s => {
          const isUp = s.avgChange >= 0;
          const intensity = Math.min(Math.abs(s.avgChange) / 4, 1);
          return (
            <a key={s.sector} href={`/markets?sector=${s.sector}`}
              className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
              style={{
                background: `linear-gradient(155deg, ${isUp ? `rgba(34,197,94,${0.06+intensity*0.2})` : `rgba(239,68,68,${0.06+intensity*0.2})`}, var(--bg-surface))`,
                border: `1px solid ${isUp ? `rgba(34,197,94,${0.08+intensity*0.12})` : `rgba(239,68,68,${0.08+intensity*0.12})`}`,
              }}
            >
              <div className="text-[10px] font-body font-medium uppercase tracking-wider text-[var(--text-primary)]">{sectorLabels[s.sector] || s.sector}</div>
              <div className="font-data text-xl font-bold mt-1.5" style={{ color: isUp ? "var(--bull)" : "var(--bear)" }}>
                {s.count > 0 ? `${isUp ? "+" : ""}${s.avgChange.toFixed(2)}%` : "—"}
              </div>
              <div className="text-[9px] font-data text-[var(--text-dim)] mt-0.5">{s.count} stocks{s.totalOI > 0 ? ` · OI ${format(s.totalOI)}` : ""}</div>
            </a>
          );
        })}
      </div>

      {/* ═══ ROW 4: Quick Perps Table ═══ */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-dim)]">
          <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider">All Stocks</div>
          <a href="/markets" className="text-[10px] text-[var(--bazaar-gold)] hover:underline font-body flex items-center gap-1">Full table <ExternalLink size={9} /></a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-dim)]" style={{ background: "var(--bg-overlay)" }}>
              <th className="px-3 py-2 text-left text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">#</th>
              <th className="px-3 py-2 text-left text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">Stock</th>
              <th className="px-3 py-2 text-right text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">Price</th>
              <th className="px-3 py-2 text-right text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">24H</th>
              <th className="px-3 py-2 text-right text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">OI</th>
              <th className="px-3 py-2 text-right text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">Volume</th>
              <th className="px-3 py-2 text-right text-[8px] font-body font-medium text-[var(--text-dim)] uppercase tracking-wider">Funding</th>
            </tr>
          </thead>
          <tbody>
            {(loading ? [] : ranked.sort((a: any, b: any) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 15)).map((s: any, i: number) => {
              const chg = s.stockChange || s.change24h || 0;
              return (
                <tr key={s.symbol} className="table-row border-b border-[var(--border-dim)] hover:bg-[var(--bg-elevated)] transition" style={{ height: 42 }}>
                  <td className="px-3 font-data text-[9px] text-[var(--text-dim)]">{i+1}</td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <StockLogo symbol={s.symbol} size={20} />
                      <span className="font-body text-[13px] font-semibold">{s.symbol}</span>
                    </div>
                  </td>
                  <td className="px-3 text-right font-data text-[12px]"><Price usd={s.stockPrice || s.price} /></td>
                  <td className="px-3 text-right">
                    <span className={`font-data text-[10px] font-medium px-1.5 py-0.5 rounded ${chg >= 0 ? "text-[var(--bull)] bg-[var(--bull-dim)]" : "text-[var(--bear)] bg-[var(--bear-dim)]"}`}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 text-right font-data text-[10px] text-[var(--text-secondary)]">{s.openInterest > 0 ? format(s.openInterest) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 text-right font-data text-[10px] text-[var(--text-secondary)]">{s.volume24h > 0 ? format(s.volume24h) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 text-right font-data text-[10px]" style={{ color: (s.fundingRate || 0) > 0 ? "var(--bull)" : (s.fundingRate || 0) < 0 ? "var(--bear)" : "var(--text-dim)" }}>
                    {s.fundingRate ? `${(s.fundingRate * 100).toFixed(3)}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
