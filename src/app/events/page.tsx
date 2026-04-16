"use client";

import { useState, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useEvents, useStocks } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { Q2_2026_CALENDAR, CATEGORY_CONFIG, ScheduledEvent } from "@/config/economic-calendar";
import { Calendar, Filter, ChevronDown } from "lucide-react";

const MONTHS = ["April", "May", "June"];

export default function EventsPage() {
  const { events, loading } = useEvents();
  const { stocks } = useStocks(30_000);
  const { format } = useCurrency();
  const [tab, setTab] = useState<"all" | "earnings" | "economic">("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const earnings = events.earnings || [];

  // Full quarter economic calendar
  const allEco = useMemo(() => {
    let list = [...Q2_2026_CALENDAR];
    if (catFilter !== "all") list = list.filter(e => e.category === catFilter);
    if (monthFilter !== "all") {
      const monthNum = monthFilter === "April" ? "04" : monthFilter === "May" ? "05" : "06";
      list = list.filter(e => e.date.includes(`-${monthNum}-`));
    }
    return list;
  }, [catFilter, monthFilter]);

  // Group by week
  const groupedByWeek = useMemo(() => {
    const groups: { weekLabel: string; events: ScheduledEvent[] }[] = [];
    let currentWeek = "";
    let currentGroup: ScheduledEvent[] = [];

    for (const e of allEco) {
      const d = new Date(e.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay() + 1); // Monday
      const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " +
        new Date(weekStart.getTime() + 4 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (label !== currentWeek) {
        if (currentGroup.length > 0) groups.push({ weekLabel: currentWeek, events: currentGroup });
        currentWeek = label;
        currentGroup = [e];
      } else {
        currentGroup.push(e);
      }
    }
    if (currentGroup.length > 0) groups.push({ weekLabel: currentWeek, events: currentGroup });
    return groups;
  }, [allEco]);

  // Watchlist
  const watchlist = earnings.filter((e: any) => e.daysAway <= 14).map((e: any) => ({
    ...e, stock: stocks.find((s: any) => s.symbol === e.symbol),
  })).slice(0, 8);

  // Stats
  const highImpact = allEco.filter(e => e.impact === "high").length;
  const fedEvents = allEco.filter(e => e.category === "fed").length;
  const today = new Date().toISOString().split("T")[0];
  const thisWeekEvents = allEco.filter(e => {
    const diff = (new Date(e.date).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Events</h1>
          <p className="text-[11px] font-body text-[var(--text-dim)] mt-0.5">Q2 2026 Economic Calendar + Live Earnings · Real-time from Finnhub</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-data">
          <span className="text-[var(--bazaar-gold)]">{highImpact} high-impact</span>
          <span className="text-[var(--event-fed)]">{fedEvents} Fed events</span>
          <span className="text-[var(--text-dim)]">{allEco.length} total</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "earnings", "economic"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-body font-medium uppercase tracking-wider border transition ${
              tab === t ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)] border-[var(--border-dim)]"
            }`}
          >{t === "all" ? "All" : t === "earnings" ? "Earnings" : "Economic Calendar"}</button>
        ))}

        {/* Category + Month filters for economic tab */}
        {tab !== "earnings" && <>
          <span className="text-[var(--border-default)]">|</span>
          {["all", "fed", "inflation", "jobs", "gdp", "consumer", "manufacturing"].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-body font-medium border transition ${
                catFilter === c ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-dim)] border-[var(--border-dim)]"
              }`}
            >{c === "all" ? "All" : CATEGORY_CONFIG[c]?.emoji + " " + (CATEGORY_CONFIG[c]?.label || c)}</button>
          ))}
          <span className="text-[var(--border-default)]">|</span>
          {["all", ...MONTHS].map(m => (
            <button key={m} onClick={() => setMonthFilter(m)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-body font-medium border transition ${
                monthFilter === m ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-dim)] border-[var(--border-dim)]"
              }`}
            >{m === "all" ? "Q2" : m}</button>
          ))}
        </>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Earnings */}
          {(tab === "all" || tab === "earnings") && earnings.length > 0 && (
            <div>
              <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={11} className="text-[var(--event-earnings)]" /> Upcoming Earnings (Live from Finnhub)
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
                            <span className="text-[8px] font-body uppercase px-1.5 py-0.5 rounded font-semibold text-[var(--event-earnings)] bg-[rgba(129,140,248,0.1)]">EARNINGS</span>
                            {e.daysAway <= 0 && <span className="text-[8px] font-body font-bold px-1.5 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)] animate-pulse">TODAY</span>}
                            {e.daysAway === 1 && <span className="text-[8px] font-body font-bold px-1.5 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)]">TOMORROW</span>}
                          </div>
                          <div className="text-[10px] font-body text-[var(--text-secondary)] mt-0.5">{e.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-data text-sm text-[var(--text-primary)]">{e.date}</div>
                        <div className="font-data text-[10px] text-[var(--text-secondary)]">
                          {e.time}
                          {e.time === "After Close" && <span className="text-[var(--bazaar-gold)] ml-1">→ ~1:30 AM IST</span>}
                          {e.time === "Before Open" && <span className="text-[var(--bazaar-gold)] ml-1">→ ~5:30 PM IST</span>}
                        </div>
                      </div>
                    </div>
                    {(e.epsEstimate || e.epsActual) && (
                      <div className="mt-2 flex gap-4 text-[10px]">
                        {e.epsEstimate && <span className="font-body text-[var(--text-dim)]">EPS Est: <span className="font-data text-[var(--text-primary)]">${e.epsEstimate}</span></span>}
                        {e.revenueEstimate && <span className="font-body text-[var(--text-dim)]">Rev Est: <span className="font-data text-[var(--text-primary)]">{format(e.revenueEstimate)}</span></span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Economic Calendar — Full Quarter */}
          {(tab === "all" || tab === "economic") && (
            <div>
              <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-2 flex items-center gap-2">
                📅 Q2 2026 Economic Calendar — {allEco.length} events
              </div>

              {groupedByWeek.map(group => {
                const isPast = new Date(group.events[0].date) < new Date(today);
                const isThisWeek = group.events.some(e => {
                  const diff = (new Date(e.date).getTime() - Date.now()) / 86400000;
                  return diff >= -1 && diff <= 7;
                });
                return (
                  <div key={group.weekLabel} className={`mb-3 ${isPast ? "opacity-40" : ""}`}>
                    <div className={`text-[9px] font-data uppercase tracking-wider mb-1.5 px-1 ${isThisWeek ? "text-[var(--bazaar-gold)]" : "text-[var(--text-dim)]"}`}>
                      {isThisWeek && "→ "}{group.weekLabel}{isThisWeek && " ← THIS WEEK"}
                    </div>
                    <div className="card overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {group.events.map((e, i) => {
                            const cat = CATEGORY_CONFIG[e.category];
                            const isToday = e.date === today;
                            const isPastEvent = new Date(e.date) < new Date(today);
                            return (
                              <tr key={`${e.date}-${e.event}-${i}`}
                                className={`border-b border-[var(--border-dim)] last:border-0 transition ${isToday ? "bg-[var(--bazaar-gold-dim)]" : "hover:bg-[var(--bg-elevated)]"}`}
                                style={{ height: 40 }}
                              >
                                <td className="px-3 py-2 w-20">
                                  <div className="font-data text-[10px] text-[var(--text-secondary)]">
                                    {new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                  </div>
                                </td>
                                <td className="px-2 py-2 w-16">
                                  <div className="font-data text-[9px] text-[var(--bazaar-gold)]">{e.timeIST}</div>
                                  <div className="font-data text-[8px] text-[var(--text-dim)]">{e.timeET} ET</div>
                                </td>
                                <td className="px-2 py-2 w-6 text-center">
                                  <div className="flex gap-0.5 justify-center">
                                    {[1,2,3].map(l => (
                                      <div key={l} className={`w-1.5 h-2 rounded-sm ${
                                        e.impact === "high" ? (l <= 3 ? "bg-red-500" : "bg-[var(--border-dim)]")
                                        : e.impact === "medium" ? (l <= 2 ? "bg-amber-500" : "bg-[var(--border-dim)]")
                                        : (l <= 1 ? "bg-slate-500" : "bg-[var(--border-dim)]")
                                      }`} />
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">{cat?.emoji}</span>
                                    <div>
                                      <div className="font-body text-[12px] text-[var(--text-primary)] font-medium">{e.event}</div>
                                      <div className="font-body text-[9px] text-[var(--text-dim)]">{e.detail}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 w-16">
                                  <span className="text-[8px] font-body font-semibold uppercase px-1.5 py-0.5 rounded" style={{ color: cat?.color, background: `${cat?.color}12` }}>
                                    {cat?.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* This week highlight */}
          <div className="card p-4" style={{ background: "linear-gradient(155deg, rgba(232,160,69,0.05), var(--bg-surface))", borderColor: "rgba(232,160,69,0.12)" }}>
            <div className="text-[10px] font-body text-[var(--bazaar-gold)] uppercase tracking-wider mb-3">This Week</div>
            {thisWeekEvents.length === 0 ? (
              <div className="text-[11px] text-[var(--text-dim)] py-2">No major events this week</div>
            ) : thisWeekEvents.slice(0, 6).map((e, i) => {
              const cat = CATEGORY_CONFIG[e.category];
              return (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-dim)] last:border-0">
                  <span className="text-xs">{cat?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[11px] font-medium text-[var(--text-primary)] truncate">{e.event}</div>
                    <div className="font-data text-[9px] text-[var(--bazaar-gold)]">{e.timeIST}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3].map(l => <div key={l} className={`w-1 h-1.5 rounded-sm ${e.impact === "high" ? "bg-red-500" : e.impact === "medium" ? "bg-amber-500" : "bg-slate-500"}`} style={{ opacity: l <= (e.impact === "high" ? 3 : e.impact === "medium" ? 2 : 1) ? 1 : 0.15 }} />)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Earnings watchlist */}
          <div className="card p-4">
            <div className="text-[10px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-3">Earnings Watchlist</div>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 rounded shimmer" />)}</div>
            ) : watchlist.length === 0 ? (
              <div className="text-[11px] text-[var(--text-dim)] py-3 text-center">No earnings next 2 weeks</div>
            ) : watchlist.map((e: any) => (
              <div key={e.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-dim)] last:border-0">
                <StockLogo symbol={e.symbol} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-[12px] font-semibold">{e.symbol}</span>
                    {e.daysAway <= 1 && <span className="text-[7px] font-body font-bold px-1 py-0.5 rounded bg-[var(--bazaar-gold-dim)] text-[var(--bazaar-gold)]">{e.daysAway <= 0 ? "TODAY" : "TMW"}</span>}
                  </div>
                  <div className="font-data text-[9px] text-[var(--text-dim)]">{e.time} · {e.date}</div>
                </div>
                {e.stock && (
                  <span className={`font-data text-[10px] font-medium ${(e.stock.stockChange || 0) >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
                    {(e.stock.stockChange || 0) >= 0 ? "+" : ""}{(e.stock.stockChange || 0).toFixed(2)}%
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Impact legend */}
          <div className="card p-4">
            <div className="text-[9px] font-body text-[var(--text-dim)] uppercase tracking-wider mb-2">Impact Legend</div>
            <div className="space-y-1.5 text-[9px] font-body text-[var(--text-dim)]">
              <div className="flex items-center gap-2"><div className="flex gap-0.5">{[1,2,3].map(i=><div key={i} className="w-1.5 h-2 rounded-sm bg-red-500"/>)}</div> High — expect 1-2% swings</div>
              <div className="flex items-center gap-2"><div className="flex gap-0.5">{[1,2].map(i=><div key={i} className="w-1.5 h-2 rounded-sm bg-amber-500"/>)}<div className="w-1.5 h-2 rounded-sm bg-[var(--border-dim)]"/></div> Medium — moderate volatility</div>
              <div className="flex items-center gap-2"><div className="flex gap-0.5"><div className="w-1.5 h-2 rounded-sm bg-slate-500"/>{[1,2].map(i=><div key={i} className="w-1.5 h-2 rounded-sm bg-[var(--border-dim)]"/>)}</div> Low — minimal impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
