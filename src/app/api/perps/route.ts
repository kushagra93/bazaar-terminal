import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PerpsCoin {
  symbol: string;
  baseAsset: string;
  price: number;
  change24h: number;
  openInterest: number;
  volume24h: number;
  fundingRate: number;
  longShortRatio: number | null;
  liquidations1h: number | null;
  sources: string[];
}

// In-memory cache (60s TTL)
let cache: { data: PerpsCoin[]; timestamp: number } | null = null;
const CACHE_TTL = 60_000;

async function fetchBinance(): Promise<PerpsCoin[]> {
  try {
    const res = await fetch("https://fapi.binance.com/fapi/v1/ticker/24hr", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: any[] = await res.json();

    return data
      .filter((t: any) => t.symbol.endsWith("USDT"))
      .map((t: any) => ({
        symbol: t.symbol,
        baseAsset: t.symbol.replace("USDT", ""),
        price: parseFloat(t.lastPrice) || 0,
        change24h: parseFloat(t.priceChangePercent) || 0,
        openInterest: 0, // separate endpoint needed
        volume24h: parseFloat(t.quoteVolume) || 0,
        fundingRate: 0,
        longShortRatio: null,
        liquidations1h: null,
        sources: ["binance"],
      }));
  } catch {
    return [];
  }
}

async function fetchBinanceOI(symbols: string[]): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  try {
    // Fetch top coins OI
    const res = await fetch("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT");
    // Single symbol endpoint — batch not available. Skip for now, use premium data later.
    // For MVP, we'll get OI from Bybit which returns it in the ticker response.
  } catch {}
  return map;
}

async function fetchBinanceFunding(): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  try {
    const res = await fetch("https://fapi.binance.com/fapi/v1/premiumIndex");
    if (!res.ok) return map;
    const data: any[] = await res.json();
    for (const item of data) {
      const base = item.symbol?.replace("USDT", "");
      if (base) map[base] = parseFloat(item.lastFundingRate) || 0;
    }
  } catch {}
  return map;
}

async function fetchBybit(): Promise<PerpsCoin[]> {
  try {
    const res = await fetch("https://api.bybit.com/v5/market/tickers?category=linear", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data?.result?.list || [];

    return list
      .filter((t: any) => t.symbol.endsWith("USDT"))
      .map((t: any) => ({
        symbol: t.symbol,
        baseAsset: t.symbol.replace("USDT", ""),
        price: parseFloat(t.lastPrice) || 0,
        change24h: parseFloat(t.price24hPcnt) * 100 || 0,
        openInterest: parseFloat(t.openInterest) * (parseFloat(t.lastPrice) || 0),
        volume24h: parseFloat(t.turnover24h) || 0,
        fundingRate: parseFloat(t.fundingRate) || 0,
        longShortRatio: null,
        liquidations1h: null,
        sources: ["bybit"],
      }));
  } catch {
    return [];
  }
}

async function fetchOKX(): Promise<PerpsCoin[]> {
  try {
    const res = await fetch("https://www.okx.com/api/v5/market/tickers?instType=SWAP", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data?.data || [];

    return list
      .filter((t: any) => t.instId.endsWith("-USDT-SWAP"))
      .map((t: any) => ({
        symbol: t.instId,
        baseAsset: t.instId.split("-")[0],
        price: parseFloat(t.last) || 0,
        change24h: ((parseFloat(t.last) - parseFloat(t.open24h)) / parseFloat(t.open24h)) * 100 || 0,
        openInterest: parseFloat(t.openInterest || "0") * (parseFloat(t.last) || 0),
        volume24h: parseFloat(t.volCcy24h) || 0,
        fundingRate: 0,
        longShortRatio: null,
        liquidations1h: null,
        sources: ["okx"],
      }));
  } catch {
    return [];
  }
}

function mergeByBaseAsset(sources: PerpsCoin[][]): PerpsCoin[] {
  const map = new Map<string, PerpsCoin>();

  for (const coins of sources) {
    for (const coin of coins) {
      const key = coin.baseAsset.toUpperCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, { ...coin, baseAsset: key });
      } else {
        // Merge: sum OI and volume, average price/change, combine sources
        existing.openInterest += coin.openInterest;
        existing.volume24h += coin.volume24h;
        // Use Binance price as primary (most liquid)
        if (coin.sources.includes("binance") && coin.price > 0) {
          existing.price = coin.price;
          existing.change24h = coin.change24h;
        }
        if (coin.fundingRate !== 0 && existing.fundingRate === 0) {
          existing.fundingRate = coin.fundingRate;
        }
        existing.sources = [...new Set([...existing.sources, ...coin.sources])];
      }
    }
  }

  // Sort by volume
  return Array.from(map.values())
    .filter(c => c.price > 0 && c.volume24h > 0)
    .sort((a, b) => b.volume24h - a.volume24h);
}

export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  // Fetch from all sources in parallel
  const [binance, bybit, okx, binanceFunding] = await Promise.all([
    fetchBinance(),
    fetchBybit(),
    fetchOKX(),
    fetchBinanceFunding(),
  ]);

  // Apply Binance funding rates
  for (const coin of binance) {
    const rate = binanceFunding[coin.baseAsset];
    if (rate !== undefined) coin.fundingRate = rate;
  }

  const merged = mergeByBaseAsset([binance, bybit, okx]);

  // Update cache
  cache = { data: merged, timestamp: Date.now() };

  return NextResponse.json(merged);
}
