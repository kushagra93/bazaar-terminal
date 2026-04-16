"use client";

import { useState } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useEvents, useStocks } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { Calendar, Mic, BarChart3, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const IMPACT_STYLES: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-500",
};

export default function EventsPage() {
  const { events, loading } = useEvents();
  const { stocks } = useStocks(30_000);
  const { format } = useCurrency();
  const [tab, setTab] = useState<"all" | "earnings" | "economic">("all");

  const earnings = events.earnings || [];
  const economic = events.economic || [];
  const news = events.news || [];

  // Tonight's watchlist: stocks with upcoming earnings
  const watchlist = earnings
    .filter((e: any) => e.daysAway <= 7)
    .map((e: any) => {
      const stock = stocks.find((s: any) => s.symbol === e.symbol);
      return { ...e, stock };
    })
    .slice(0, 8);

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <h1 className="font-display text-2xl font-bold flex items-center gap-3">
        Events
        <span className="text-[10px] font-data text-[var(--text-secondary)] font-normal">Real-time from Finnhub</span>
      </h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "earnings", "economic"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-body font-medium uppercase tracking-wider border transition ${
              tab === t ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)] border-[var(--border-dim)]"
            }`}
          >{t === "all" ? "All" : t === "earnings" ? "Earnings" : "Economic Calendar"}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Main Content (2 cols) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Earnings Section */}
          {(tab === "all" || tab === "earnings") && earnings.length > 0 && (
            <div>
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={12} className="text-[var(--event-earnings)]" /> Upcoming Earnings
              </div>
              <div className="space-y-2">
                {earnings.map((e: any) => (
                  <div key={e.id} className={`card p-4 ${e.daysAway <= 1 ? "card--earnings" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={e.symbol} size={32} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body text-base font-bold">{e.symbol}</span>
                            <span className="text-[9px] font-body uppercase px-1.5 py-0.5 rounded font-semibold text-[var(--event-earnings)] bg-[rgba(129,140,248,0.1)]">EARNINGS</span>
                            {e.daysAway <= 0 && <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)] animate-pulse">TODAY</span>}
                            {e.daysAway === 1 && <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)]">TOMORROW</span>}
                          </div>
                          <div className="text-xs font-body text-[var(--text-secondary)] mt-0.5">{e.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-data text-sm text-[var(--text-primary)]">{e.date}</div>
                        <div className="font-data text-[10px] text-[var(--text-secondary)]">{e.time}</div>
                      </div>
                    </div>
                    {/* EPS data if available */}
                    {(e.epsEstimate || e.epsActual) && (
                      <div className="mt-3 flex gap-6 text-xs">
                        {e.epsEstimate && <div><span className="font-body text-[var(--text-secondary)]">EPS Est: </span><span className="font-data text-[var(--text-primary)]">${e.epsEstimate}</span></div>}
                        {e.epsActual && <div><span className="font-body text-[var(--text-secondary)]">EPS Act: </span><span className={`font-data font-semibold ${e.epsActual > e.epsEstimate ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>${e.epsActual}</span></div>}
                        {e.revenueEstimate && <div><span className="font-body text-[var(--text-secondary)]">Rev Est: </span><span className="font-data text-[var(--text-primary)]">{format(e.revenueEstimate)}</span></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Economic Calendar — Investing.com style */}
          {(tab === "all" || tab === "economic") && economic.length > 0 && (
            <div>
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 size={12} className="text-[var(--event-fed)]" /> Economic Calendar
              </div>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-dim)]" style={{ background: "var(--bg-overlay)" }}>
                      <th className="px-3 py-2.5 text-left text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-12">Time</th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-6">🌍</th>
                      <th className="px-3 py-2.5 text-center text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-16">Impact</th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider">Event</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-20">Actual</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-20">Estimate</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-20">Previous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {economic.map((e: any, i: number) => {
                      const actualBetter = e.actual != null && e.estimate != null && parseFloat(e.actual) > parseFloat(e.estimate);
                      const actualWorse = e.actual != null && e.estimate != null && parseFloat(e.actual) < parseFloat(e.estimate);
                      return (
                        <tr key={e.id || i} className="table-row border-b border-[var(--border-dim)] hover:bg-[var(--bg-elevated)] transition">
                          <td className="px-3 py-2.5">
                            <div className="font-data text-[10px] text-[var(--text-secondary)]">{e.timeIST || e.timeET}</div>
                          </td>
                          <td className="px-3 py-2.5 text-[10px]">{e.country === "US" ? "🇺🇸" : e.country === "EU" ? "🇪🇺" : e.country === "GB" ? "🇬🇧" : e.country === "JP" ? "🇯🇵" : e.country === "CN" ? "🇨🇳" : "🌍"}</td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex justify-center gap-0.5">
                              {[1, 2, 3].map(level => (
                                <div key={level} className={`w-2 h-2.5 rounded-sm ${
                                  e.impact === "high" ? (level <= 3 ? IMPACT_STYLES.high : "bg-[var(--border-dim)]")
                                  : e.impact === "medium" ? (level <= 2 ? IMPACT_STYLES.medium : "bg-[var(--border-dim)]")
                                  : (level <= 1 ? IMPACT_STYLES.low : "bg-[var(--border-dim)]")
                                }`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-body text-xs text-[var(--text-primary)]">{e.event}</div>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {e.actual != null ? (
                              <span className={`font-data text-xs font-semibold ${actualBetter ? "text-[var(--bull)]" : actualWorse ? "text-[var(--bear)]" : "text-[var(--text-primary)]"}`}>
                                {e.actual}{e.unit}
                              </span>
                            ) : <span className="font-data text-xs text-[var(--text-dim)]">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data text-xs text-[var(--text-secondary)]">
                            {e.estimate != null ? `${e.estimate}${e.unit}` : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-data text-xs text-[var(--text-dim)]">
                            {e.prev != null ? `${e.prev}${e.unit}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* News */}
          {tab === "all" && news.length > 0 && (
            <div>
              <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-3">Latest News</div>
              <div className="space-y-2">
                {news.map((n: any) => (
                  <div key={n.id} className="card p-3 flex items-start gap-3">
                    <span className="text-sm mt-0.5">📰</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-xs font-semibold text-[var(--bazaar-gold)]">{n.symbol}</span>
                        <span className="font-body text-[10px] text-[var(--text-dim)]">{n.source}</span>
                      </div>
                      <div className="font-body text-sm text-[var(--text-primary)] mt-0.5 line-clamp-2">{n.headline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>}
        </div>

        {/* ── Sidebar: Tonight's Watchlist ── */}
        <div className="space-y-4">
          <div className="card p-4 sticky top-[100px]">
            <div className="text-[11px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle size={12} className="text-[var(--bazaar-gold)]" /> Earnings Watchlist
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 rounded shimmer" />)}</div>
            ) : watchlist.length === 0 ? (
              <div className="text-xs text-[var(--text-secondary)] py-4 text-center">No earnings this week</div>
            ) : watchlist.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-dim)] last:border-0">
                <StockLogo symbol={e.symbol} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-sm font-semibold">{e.symbol}</span>
                    {e.daysAway <= 1 && <span className="text-[8px] font-body font-bold px-1 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)]">{e.daysAway <= 0 ? "TODAY" : "TMW"}</span>}
                  </div>
                  <div className="text-[10px] font-body text-[var(--text-secondary)]">
                    {e.time} · {e.date}
                    {e.time === "After Close" && <span className="text-[var(--bazaar-gold)] ml-1">→ ~1:30 AM IST</span>}
                    {e.time === "Before Open" && <span className="text-[var(--bazaar-gold)] ml-1">→ ~5:30 PM IST</span>}
                  </div>
                </div>
                <div className="text-right">
                  {e.stock && (
                    <span className={`font-data text-xs font-medium ${(e.stock.change24h || 0) >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                      {(e.stock.change24h || 0) >= 0 ? "+" : ""}{(e.stock.change24h || 0).toFixed(2)}%
                    </span>
                  )}
                  <div className="font-data text-[10px] text-[var(--text-dim)]">{e.daysAway}d</div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Legend */}
          <div className="card p-4">
            <div className="text-[10px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-2">Impact Legend</div>
            <div className="space-y-1.5 text-[10px] font-body text-[var(--text-secondary)]">
              <div className="flex items-center gap-2"><div className="flex gap-0.5">{[1,2,3].map(i=><div key={i} className="w-2 h-2.5 rounded-sm bg-red-500"/>)}</div> High — expect 1-2% swings</div>
              <div className="flex items-center gap-2"><div className="flex gap-0.5">{[1,2].map(i=><div key={i} className="w-2 h-2.5 rounded-sm bg-amber-500"/>)}<div className="w-2 h-2.5 rounded-sm bg-[var(--border-dim)]"/></div> Medium — moderate volatility</div>
              <div className="flex items-center gap-2"><div className="flex gap-0.5"><div className="w-2 h-2.5 rounded-sm bg-slate-500"/>{[1,2].map(i=><div key={i} className="w-2 h-2.5 rounded-sm bg-[var(--border-dim)]"/>)}</div> Low — minimal impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
