"use client";

import { useState, useMemo } from "react";
import { useCurrency } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useEvents, useStocks } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { Q2_2026_CALENDAR, CATEGORY_CONFIG, ScheduledEvent } from "@/config/economic-calendar";

const MONTHS = ["April", "May", "June"];

export default function EventsPage() {
  const { events, loading } = useEvents();
  const { stocks } = useStocks(30_000);
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"all" | "earnings" | "economic">("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const earnings = events.earnings || [];
  const allEco = useMemo(() => {
    let list = [...Q2_2026_CALENDAR];
    if (catFilter !== "all") list = list.filter(e => e.category === catFilter);
    return list;
  }, [catFilter]);

  // Group economic events by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; label: string; events: ScheduledEvent[] }[] = [];
    let currentDate = "";
    let currentGroup: ScheduledEvent[] = [];
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    for (const e of allEco) {
      if (e.date !== currentDate) {
        if (currentGroup.length > 0) {
          const label = currentDate === today ? "TODAY" : currentDate === tomorrow ? "TOMORROW" : "";
          groups.push({ date: currentDate, label, events: currentGroup });
        }
        currentDate = e.date;
        currentGroup = [e];
      } else {
        currentGroup.push(e);
      }
    }
    if (currentGroup.length > 0) {
      const label = currentDate === today ? "TODAY" : currentDate === tomorrow ? "TOMORROW" : "";
      groups.push({ date: currentDate, label, events: currentGroup });
    }
    return groups;
  }, [allEco]);

  const watchlist = earnings.filter((e: any) => e.daysAway <= 14).slice(0, 6);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      {/* Hero — Stitch financial_calendar style */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary-dim)] rounded-full font-data text-xs tracking-widest uppercase">Live Feed</span>
          <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/New_York" })} EST
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter">
          {t("events.title")} <span className="text-[var(--primary)]">{t("events.calendar")}</span>
        </h1>
      </div>

      {/* Filters — rounded pills */}
      <div className="flex flex-wrap gap-3">
        {(["all", "earnings", "economic"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-full font-data text-xs font-bold uppercase tracking-widest transition ${
              tab === t ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-highest)] text-[var(--on-surface)] hover:bg-[var(--surface-bright)]"
            }`}
          >{t === "all" ? "All Events" : t === "earnings" ? "Earnings" : "Central Banks"}</button>
        ))}
        {tab !== "earnings" && <>
          {["all", "fed", "inflation", "jobs", "gdp"].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-5 py-2.5 rounded-full font-data text-xs font-bold uppercase tracking-widest transition ${
                catFilter === c ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-highest)] text-[var(--on-surface)] hover:bg-[var(--surface-bright)]"
              }`}
            >{c === "all" ? "All" : CATEGORY_CONFIG[c]?.label || c}</button>
          ))}
        </>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main timeline */}
        <div className="lg:col-span-2 relative space-y-10">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-24 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--primary)]/40 via-[var(--outline-variant)]/20 to-transparent hidden md:block" />

          {/* Earnings */}
          {(tab === "all" || tab === "earnings") && earnings.length > 0 && (
            <section className="relative">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-24 shrink-0">
                  <h3 className="font-data text-lg font-bold text-[var(--tertiary)]">EARNINGS</h3>
                </div>
                <div className="flex-1 space-y-4">
                  {earnings.map((e: any) => (
                    <div key={e.id} className="bg-[var(--surface-container)] rounded-xl p-6 border-l-4 border-[var(--primary)] hover:bg-[var(--surface-bright)]/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <StockLogo symbol={e.symbol} size={40} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-data text-[10px] text-[var(--primary)] uppercase tracking-widest">Earnings</span>
                              {e.daysAway <= 1 && <span className="font-data text-[10px] text-[var(--primary)] animate-pulse">● {e.daysAway <= 0 ? "TODAY" : "TOMORROW"}</span>}
                            </div>
                            <h4 className="font-display text-xl font-bold">{e.symbol}</h4>
                          </div>
                        </div>
                        <span className="font-data text-lg font-bold bg-[var(--surface-highest)] px-3 py-1 rounded-lg">
                          {e.time === "After Close" ? "16:00" : e.time === "Before Open" ? "08:00" : e.time}
                        </span>
                      </div>
                      {(e.epsEstimate || e.revenueEstimate) && (
                        <div className="grid grid-cols-2 gap-4">
                          {e.epsEstimate && (
                            <div className="bg-[var(--surface-low)]/50 p-4 rounded-xl">
                              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase mb-1">Est. EPS</p>
                              <p className="font-data text-lg font-medium">${e.epsEstimate}</p>
                            </div>
                          )}
                          {e.revenueEstimate && (
                            <div className="bg-[var(--surface-low)]/50 p-4 rounded-xl">
                              <p className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase mb-1">Est. Revenue</p>
                              <p className="font-data text-lg font-medium">{format(e.revenueEstimate)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="font-data text-[10px] text-[var(--on-surface-variant)] mt-3">{e.date} · {e.time === "After Close" ? "→ ~1:30 AM IST" : e.time === "Before Open" ? "→ ~5:30 PM IST" : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Economic Calendar */}
          {(tab === "all" || tab === "economic") && groupedByDate.map(group => {
            const d = new Date(group.date);
            const isPast = d < new Date(new Date().toISOString().split("T")[0]);
            return (
              <section key={group.date} className={`relative ${isPast ? "opacity-40" : ""}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-24 shrink-0">
                    <div className="sticky top-28">
                      <h3 className={`font-data text-lg font-bold ${group.label ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`}>
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
                      </h3>
                      {group.label && <p className="font-data text-xs text-[var(--on-surface-variant)] uppercase">{group.label}</p>}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    {group.events.map((e, i) => {
                      const cat = CATEGORY_CONFIG[e.category];
                      const borderColor = e.impact === "high" ? "var(--primary)" : e.impact === "medium" ? "var(--tertiary)" : "var(--outline-variant)";
                      return (
                        <div key={`${e.date}-${i}`}
                          className={`bg-[var(--surface-container)] rounded-xl p-6 border-l-4 hover:bg-[var(--surface-bright)]/40 transition-all ${e.impact === "low" ? "opacity-70" : ""}`}
                          style={{ borderLeftColor: borderColor }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {e.impact === "high" && <span className="text-[var(--primary)]">❗</span>}
                                <span className="font-data text-[10px] uppercase tracking-widest" style={{ color: borderColor }}>{e.impact} Impact</span>
                              </div>
                              <h4 className="font-display text-lg font-bold">{e.event}</h4>
                            </div>
                            <span className="font-data text-lg font-bold bg-[var(--surface-highest)] px-3 py-1 rounded-lg">{e.timeIST.replace(" IST", "")}</span>
                          </div>
                          <p className="text-sm text-[var(--on-surface-variant)] mb-3">{e.detail}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cat?.emoji}</span>
                            <span className="font-data text-[10px] uppercase tracking-widest" style={{ color: cat?.color }}>{cat?.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--surface-container)] rounded-xl p-6 sticky top-24">
            <h3 className="font-display font-bold text-sm mb-4">Earnings Watchlist</h3>
            {watchlist.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">No upcoming earnings</p> :
              watchlist.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 py-3">
                  <StockLogo symbol={e.symbol} size={28} />
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold">{e.symbol}</p>
                    <p className="font-data text-[10px] text-[var(--on-surface-variant)]">{e.date}</p>
                  </div>
                  <span className="font-data text-xs text-[var(--on-surface-variant)]">{e.daysAway}d</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
