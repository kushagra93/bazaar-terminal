/** Centralized data fetching hooks — pulls from real API routes */

import { useState, useEffect, useCallback } from "react";

const BASE = "";

async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

/** Live stock perps data from Kraken + Coinbase International */
export function useStocks(refreshMs = 3_000) {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const data = await fetchJSON("/api/stocks", []);
    if (data.length > 0) {
      setStocks(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const i = setInterval(load, refreshMs);
    return () => clearInterval(i);
  }, [load, refreshMs]);

  return { stocks, loading, reload: load, lastUpdated };
}

/** Live events from Finnhub — returns { earnings, economic, news } */
export function useEvents() {
  const [events, setEvents] = useState<any>({ earnings: [], economic: [], news: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJSON("/api/events", { earnings: [], economic: [], news: [] }).then(d => { setEvents(d); setLoading(false); });
    const i = setInterval(() => fetchJSON("/api/events", { earnings: [], economic: [], news: [] }).then(setEvents), 300_000);
    return () => clearInterval(i);
  }, []);

  return { events, loading };
}

/** Sentiment data */
export function useSentiment() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJSON("/api/sentiment", null).then(d => { setData(d); setLoading(false); });
    const i = setInterval(() => fetchJSON("/api/sentiment", null).then(setData), 120_000);
    return () => clearInterval(i);
  }, []);

  return { sentiment: data, loading };
}

// Sector helpers
export const SECTOR_MAP: Record<string, string[]> = {
  tech: ["AAPL", "MSFT", "NVDA", "AMD", "INTC", "GOOGL", "META"],
  ev: ["TSLA", "RIVN", "LCID", "NIO"],
  fintech: ["COIN", "HOOD", "SOFI", "PYPL", "SQ", "MSTR"],
  meme: ["GME", "AMC"],
  growth: ["PLTR", "SHOP", "UBER", "SNAP", "SPOT", "RBLX", "ROKU", "ABNB", "BABA", "NFLX", "LYFT", "AMZN"],
};

export const CONTEXT_SYMBOLS = ["SPY", "QQQ"];

export function getSectorForSymbol(sym: string): string {
  for (const [sector, symbols] of Object.entries(SECTOR_MAP)) {
    if (symbols.includes(sym)) return sector;
  }
  return "growth";
}

/** Live computed signals from PineScript-style indicators */
export function useSignals(refreshMs = 60_000) {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJSON("/api/signals", []).then(d => { setSignals(d); setLoading(false); });
    const i = setInterval(() => fetchJSON("/api/signals", []).then(setSignals), refreshMs);
    return () => clearInterval(i);
  }, [refreshMs]);

  return { signals, loading };
}

/** Live Reddit social data */
export function useSocial(refreshMs = 120_000) {
  const [data, setData] = useState<any>({ posts: [], trending: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJSON("/api/social", { posts: [], trending: [] }).then(d => { setData(d); setLoading(false); });
    const i = setInterval(() => fetchJSON("/api/social", { posts: [], trending: [] }).then(setData), refreshMs);
    return () => clearInterval(i);
  }, [refreshMs]);

  return { social: data, loading };
}
