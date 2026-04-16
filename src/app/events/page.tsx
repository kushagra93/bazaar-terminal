"use client";

import { useState, useMemo, useEffect } from "react";
import { useCurrency } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useEvents, useStocks, useSentiment } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { Q2_2026_CALENDAR, CATEGORY_CONFIG, ScheduledEvent } from "@/config/economic-calendar";

function Countdown({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [remaining, setRemaining] = useState("—");
  useEffect(() => {
    const update = () => {
      const match = targetTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) { setRemaining("—"); return; }
      let h = parseInt(match[1]); const m = parseInt(match[2]);
      if (match[3].toUpperCase() === "PM" && h < 12) h += 12;
      if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
      const target = new Date(`${targetDate}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00+05:30`);
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setRemaining("LIVE NOW"); return; }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`);
    };
    update(); const i = setInterval(update, 1000); return () => clearInterval(i);
  }, [targetDate, targetTime]);
  return <span className="font-data text-4xl font-bold">{remaining}</span>;
}

export default function EventsPage() {
  const { events, loading } = useEvents();
  const { stocks } = useStocks(30_000);
  const { sentiment } = useSentiment();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"all" | "earnings" | "economic">("all");
  const [impactFilter, setImpactFilter] = useState<"all" | "high">("all");

  const earnings = events.earnings || [];
  const fng = sentiment?.fearGreed;
  const today = new Date().toISOString().split("T")[0];

  // Week selector
  const weekDays = useMemo(() => {
    const d = new Date();
    const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
    return Array.from({ length: 5 }, (_, i) => {
      const day = new Date(mon); day.setDate(mon.getDate() + i);
      return { date: day.toISOString().split("T")[0], day: day.toLocaleDateString("en", { weekday: "short" }).toUpperCase(), num: day.getDate(), isToday: day.toISOString().split("T")[0] === today };
    });
  }, []);
  const weekStart = weekDays[0]?.date;
  const weekEnd = weekDays[4]?.date;

  const allEco = useMemo(() => {
    let list = [...Q2_2026_CALENDAR];
    if (impactFilter === "high") list = list.filter(e => e.impact === "high");
    return list;
  }, [impactFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; label: string; events: ScheduledEvent[] }[] = [];
    let cur = ""; let curGroup: ScheduledEvent[] = [];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    for (const e of allEco) {
      if (e.date !== cur) {
        if (curGroup.length > 0) groups.push({ date: cur, label: cur === today ? "TODAY" : cur === tomorrow ? "TOMORROW" : "", events: curGroup });
        cur = e.date; curGroup = [e];
      } else curGroup.push(e);
    }
    if (curGroup.length > 0) groups.push({ date: cur, label: cur === today ? "TODAY" : cur === tomorrow ? "TOMORROW" : "", events: curGroup });
    return groups;
  }, [allEco, today]);

  const nextMajor = allEco.find(e => e.date >= today && e.impact === "high");
  const watchlist = earnings.filter((e: any) => e.daysAway <= 14).slice(0, 6);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* ═══ HERO ═══ */}
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter">MACRO_<span className="text-[var(--primary)]">CALENDAR</span></h1>
        <p className="text-sm text-[var(--on-surface-variant)] mt-2 max-w-xl leading-relaxed">
          Real-time synchronization of global economic indicators and central bank interventions.{" "}
          <span className="italic text-[var(--primary)]">High-fidelity data stream.</span>
        </p>
      </div>

      {/* Date range + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[var(--surface-highest)] rounded-full px-4 py-2">
          <span className="font-data text-xs uppercase tracking-widest">
            {weekDays[0] && new Date(weekDays[0].date).toLocaleDateString("en", { month: "short", day: "numeric" }).toUpperCase()}
            {" — "}
            {weekDays[4] && new Date(weekDays[4].date).toLocaleDateString("en", { month: "short", day: "numeric" }).toUpperCase()}
          </span>
          <span className="text-[var(--on-surface-variant)]">📅</span>
        </div>
        <button onClick={() => setImpactFilter("all")}
          className={`px-4 py-2 rounded-full font-data text-[10px] font-bold uppercase tracking-widest transition ${impactFilter === "all" ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)]"}`}>
          ALL_REGIONS
        </button>
        <button onClick={() => setImpactFilter("high")}
          className={`px-4 py-2 rounded-full font-data text-[10px] font-bold uppercase tracking-widest transition ${impactFilter === "high" ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)]"}`}>
          IMPACT_HIGH
        </button>
        <button onClick={() => setTab(tab === "earnings" ? "all" : "earnings")}
          className={`px-4 py-2 rounded-full font-data text-[10px] font-bold uppercase tracking-widest transition ${tab === "earnings" ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)]"}`}>
          {t("events.earnings")}
        </button>
      </div>

      {/* Week day pills */}
      <div className="flex gap-2">
        {weekDays.map(d => (
          <div key={d.date} className={`flex flex-col items-center px-4 py-2 rounded-xl font-data ${d.isToday ? "bg-[var(--primary)] text-[#006532]" : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"}`}>
            <span className="text-[9px] uppercase tracking-widest">{d.day}</span>
            <span className="text-lg font-bold">{d.num}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Main content (8 cols) ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* VIX + Countdown */}
          <div className="bg-[var(--surface-container)] rounded-xl p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-1">Volatility Index</p>
                <p className="font-display text-3xl font-extrabold">VIX {fng?.vix || "—"}</p>
                <p className={`font-data text-[10px] uppercase tracking-widest mt-1 ${(fng?.vix || 20) < 20 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                  {(fng?.vix || 20) < 20 ? "LOW INTENSITY ENVIRONMENT" : "ELEVATED ENVIRONMENT"}
                </p>
              </div>
              {nextMajor && (
                <div>
                  <p className="font-data text-[9px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-1">Next Major Event</p>
                  <Countdown targetDate={nextMajor.date} targetTime={nextMajor.timeIST} />
                  <p className="font-data text-[10px] text-[var(--secondary)] uppercase tracking-widest mt-1">{nextMajor.event}</p>
                </div>
              )}
            </div>
          </div>

          {/* Earnings */}
          {(tab === "all" || tab === "earnings") && earnings.length > 0 && (
            <div className="space-y-3">
              <p className="font-data text-[10px] text-[var(--tertiary)] uppercase tracking-widest">Earnings Reports</p>
              {earnings.slice(0, 5).map((e: any) => (
                <div key={e.id} className="bg-[var(--surface-container)] rounded-xl p-5 flex gap-4 items-center" style={{ borderLeft: "3px solid var(--tertiary)" }}>
                  <StockLogo symbol={e.symbol} size={36} />
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-bold">{e.symbol}</span>
                    <p className="font-data text-[10px] text-[var(--on-surface-variant)] truncate">{e.title}</p>
                  </div>
                  {e.epsEstimate && <div className="text-center hidden sm:block"><p className="font-data text-[9px] text-[var(--outline)] uppercase">Est EPS</p><p className="font-data text-sm font-bold">${e.epsEstimate}</p></div>}
                  {e.revenueEstimate && <div className="text-center hidden md:block"><p className="font-data text-[9px] text-[var(--outline)] uppercase">Revenue</p><p className="font-data text-sm font-bold">{format(e.revenueEstimate)}</p></div>}
                  <div className="text-right"><p className="font-data text-sm font-bold">{e.date}</p><p className="font-data text-[9px] text-[var(--on-surface-variant)]">{e.time}</p></div>
                </div>
              ))}
            </div>
          )}

          {/* Economic Calendar — grouped by date */}
          {tab !== "earnings" && grouped.map(group => {
            const isPast = new Date(group.date) < new Date(today);
            const isCritical = group.events.some(e => e.impact === "high" && e.category === "fed");
            return (
              <div key={group.date} className={isPast ? "opacity-30" : ""}>
                <p className={`font-data text-lg font-bold uppercase tracking-wider mb-3 ${group.label === "TODAY" ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                  {new Date(group.date).toLocaleDateString("en", { month: "short", day: "numeric" }).toUpperCase()}
                  {group.label && <span className="text-xs ml-2 font-normal">{group.label}</span>}
                </p>

                <div className="space-y-3">
                  {group.events.map((e, i) => {
                    const cat = CATEGORY_CONFIG[e.category];
                    const isFedCritical = e.impact === "high" && (e.category === "fed" || e.event.includes("FOMC") || e.event.includes("CPI") || e.event.includes("Non-Farm"));

                    if (isFedCritical) {
                      // ── CRITICAL EVENT CARD (Stitch style) ──
                      return (
                        <div key={`${e.date}-${i}`} className="bg-[var(--surface-container)] rounded-xl p-6 relative overflow-hidden" style={{ borderLeft: "4px solid var(--secondary)" }}>
                          <div className="absolute top-4 right-4 font-data text-5xl font-black text-[var(--surface-highest)]">{new Date(e.date).getDate()}</div>
                          <div className="relative">
                            <span className="inline-block px-2 py-0.5 bg-[var(--secondary)]/20 text-[var(--secondary)] font-data text-[9px] uppercase tracking-widest font-bold rounded mb-2">Critical Event</span>
                            <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{e.event.toUpperCase().replace(/ /g, "_")}</h3>
                            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed mb-4">{e.detail}</p>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center"><p className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest">Expected</p><p className="font-data text-lg font-bold">—</p></div>
                              <div className="text-center"><p className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest">Previous</p><p className="font-data text-lg font-bold">—</p></div>
                              <div className="text-center"><p className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest">Probability</p><p className="font-data text-lg font-bold text-[var(--primary)]">—</p></div>
                            </div>
                            <div className="bg-[var(--surface-low)] rounded-lg p-3 flex gap-2 items-start">
                              <span className="text-[var(--primary)]">⚡</span>
                              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                                <span className="font-bold text-[var(--on-surface)]">ANALYST NOTE:</span> {e.detail}
                              </p>
                            </div>
                          </div>
                          <p className="font-data text-[10px] text-[var(--on-surface-variant)] mt-3">{e.timeIST} · {e.timeET}</p>
                        </div>
                      );
                    }

                    // ── Regular event row ──
                    return (
                      <div key={`${e.date}-${i}`} className="flex items-center gap-4 px-4 py-3 bg-[var(--surface-low)] rounded-xl hover:bg-[var(--surface-bright)] transition">
                        <span className="font-data text-sm font-bold w-12">{e.timeIST.replace(" IST", "").split(" ")[0]}</span>
                        <span className="text-xs">{cat?.emoji}</span>
                        <span className="font-data text-sm font-bold uppercase tracking-wider flex-1 truncate">{e.event}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3].map(l => <div key={l} className="w-1 h-3 rounded-sm" style={{ background: l <= (e.impact === "high" ? 3 : e.impact === "medium" ? 2 : 1) ? (e.impact === "high" ? "var(--secondary)" : "var(--tertiary)") : "var(--surface-highest)" }} />)}
                        </div>
                        <div className="flex gap-3 font-data text-sm w-36 justify-end">
                          <span className="text-[var(--primary)] font-bold">—</span>
                          <span className="text-[var(--on-surface-variant)]">—</span>
                          <span className="text-[var(--on-surface-variant)]">—</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* MACRO_INSIGHT */}
          <div className="bg-[var(--surface-container)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--primary)]">✦</span>
              <span className="font-data text-xs text-[var(--primary)] uppercase tracking-widest font-bold">MACRO_INSIGHT</span>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
              The "Actual" vs "Forecast" delta is the primary driver of intraday volatility. Significant misses (outside 2 standard deviations) typically trigger automated algorithmic liquidation or accumulation. For Indian traders: these events happen during your prime trading hours (8 PM–2 AM IST).
            </p>
          </div>
        </div>

        {/* ── Sidebar (4 cols) ── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[var(--surface-container)] rounded-xl p-6 sticky top-24">
            <h3 className="font-display font-bold mb-4">{t("events.earnings_watchlist")}</h3>
            {watchlist.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">No upcoming</p> :
              watchlist.map((e: any) => {
                const stock = stocks.find((s: any) => s.symbol === e.symbol);
                return (
                  <div key={e.id} className="flex items-center gap-3 py-3 hover:bg-[var(--surface-bright)] rounded-lg px-2 -mx-2 transition">
                    <StockLogo symbol={e.symbol} size={28} />
                    <div className="flex-1"><p className="font-display font-bold text-sm">{e.symbol}</p><p className="font-data text-[9px] text-[var(--on-surface-variant)]">{e.date}</p></div>
                    {stock && <span className={`font-data text-xs font-bold ${(stock.stockChange || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>{(stock.stockChange || 0) >= 0 ? "+" : ""}{(stock.stockChange || 0).toFixed(2)}%</span>}
                  </div>
                );
              })}
          </div>
          <div className="bg-[var(--surface-container)] rounded-xl p-6">
            <p className="font-data text-[9px] text-[var(--outline)] uppercase tracking-widest mb-3">Categories</p>
            {Object.entries(CATEGORY_CONFIG).map(([k, c]) => (
              <button key={k} onClick={() => setImpactFilter("all")} className="flex items-center gap-2 w-full py-2 hover:bg-[var(--surface-bright)] rounded-lg px-2 -mx-2 transition text-left">
                <span>{c.emoji}</span><span className="font-data text-xs text-[var(--on-surface-variant)]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
