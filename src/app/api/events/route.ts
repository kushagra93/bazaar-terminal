import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "d7gb999r01qqb8rj0s0gd7gb999r01qqb8rj0s10";
const FINNHUB = "https://finnhub.io/api/v1";

const TRACKED = [
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "NFLX",
  "AMD", "INTC", "PLTR", "COIN", "HOOD", "SOFI", "GME", "AMC",
  "BABA", "NIO", "RIVN", "LCID", "PYPL", "SQ", "SHOP", "UBER",
  "SNAP", "RBLX", "ABNB", "ROKU", "SPOT", "LYFT",
];

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 300_000) {
    return NextResponse.json(cache.data);
  }

  const result: any = { earnings: [], economic: [], news: [] };
  const today = new Date();
  const twoWeeks = new Date(today.getTime() + 14 * 86400000);

  try {
    // ── Earnings Calendar ──
    const earningsRes = await fetch(
      `${FINNHUB}/calendar/earnings?from=${fmt(today)}&to=${fmt(twoWeeks)}&token=${FINNHUB_KEY}`
    );
    if (earningsRes.ok) {
      const data = await earningsRes.json();
      for (const e of data.earningsCalendar || []) {
        if (!TRACKED.includes(e.symbol)) continue;
        const daysAway = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
        result.earnings.push({
          id: `earn_${e.symbol}_${e.date}`,
          symbol: e.symbol,
          title: `${e.symbol} Q${e.quarter || "?"} FY${e.year || "?"} Earnings`,
          date: e.date,
          time: e.hour === "bmo" ? "Before Open" : e.hour === "amc" ? "After Close" : e.hour || "TBD",
          daysAway,
          epsEstimate: e.epsEstimate,
          epsActual: e.epsActual,
          revenueEstimate: e.revenueEstimate,
          revenueActual: e.revenueActual,
        });
      }
    }

    // ── Economic Calendar (Investing.com-style data from Finnhub) ──
    const ecoRes = await fetch(`${FINNHUB}/calendar/economic?token=${FINNHUB_KEY}`);
    if (ecoRes.ok) {
      const data = await ecoRes.json();
      // Filter to US events primarily, plus major global events (high impact only)
      const ecoEvents = (data.economicCalendar || []).filter((e: any) =>
        e.country === "US" || (e.impact === 3 && ["EU", "GB", "CN", "JP"].includes(e.country))
      );
      for (const e of ecoEvents.slice(0, 30)) {
        // Map impact: 1=low, 2=medium, 3=high
        const impact = e.impact === 3 ? "high" : e.impact === 2 ? "medium" : "low";
        // Parse time
        // Parse time as UTC explicitly (Finnhub sends "2026-04-16 08:30:00" without timezone)
        const rawTime = e.time ? e.time.replace(" ", "T") + "Z" : null;
        const eventTime = rawTime ? new Date(rawTime) : null;
        const timeStr = eventTime && !isNaN(eventTime.getTime()) ? eventTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/New_York" }) + " ET" : "";
        const istStr = eventTime && !isNaN(eventTime.getTime()) ? eventTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) + " IST" : "";

        result.economic.push({
          id: `eco_${e.country || "XX"}_${e.event}_${e.time || Math.random()}`,
          event: e.event || "Economic Event",
          country: e.country || "US",
          date: e.time?.split("T")[0] || fmt(today),
          timeET: timeStr,
          timeIST: istStr,
          impact,
          actual: e.actual,
          estimate: e.estimate,
          prev: e.prev,
          unit: e.unit || "",
        });
      }
    }

    // ── Company News (top 5 stocks) ──
    for (const sym of TRACKED.slice(0, 5)) {
      try {
        const newsRes = await fetch(
          `${FINNHUB}/company-news?symbol=${sym}&from=${fmt(today)}&to=${fmt(today)}&token=${FINNHUB_KEY}`
        );
        if (newsRes.ok) {
          const articles = await newsRes.json();
          for (const a of articles.slice(0, 2)) {
            result.news.push({
              id: `news_${a.id || Date.now()}`,
              symbol: sym,
              headline: a.headline,
              source: a.source,
              url: a.url,
              summary: a.summary?.slice(0, 200),
              datetime: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
            });
          }
        }
      } catch {}
    }
  } catch (e) {
    console.error("Events API error:", e);
  }

  // Sort earnings by date
  result.earnings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  cache = { data: result, ts: Date.now() };
  return NextResponse.json(result);
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}
