import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Target US stock perps universe */
const TARGET_SYMBOLS = [
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "NFLX",
  "AMD", "INTC", "BABA", "NIO", "PLTR", "COIN", "HOOD", "SOFI",
  "RIVN", "LCID", "GME", "AMC", "PYPL", "SQ", "SHOP", "UBER",
  "LYFT", "SNAP", "SPOT", "RBLX", "ROKU", "ABNB", "SPY", "QQQ",
  "MSTR", "GLD",
];

const SECTOR_MAP: Record<string, string> = {
  AAPL: "tech", MSFT: "tech", NVDA: "tech", AMD: "tech", INTC: "tech", GOOGL: "tech", META: "tech",
  TSLA: "ev", RIVN: "ev", LCID: "ev", NIO: "ev",
  COIN: "fintech", HOOD: "fintech", SOFI: "fintech", PYPL: "fintech", SQ: "fintech",
  GME: "meme", AMC: "meme",
  PLTR: "growth", SHOP: "growth", UBER: "growth", SNAP: "growth", SPOT: "growth",
  RBLX: "growth", ROKU: "growth", ABNB: "growth", BABA: "growth", NFLX: "growth", LYFT: "growth",
  SPY: "index", QQQ: "index", MSTR: "fintech", GLD: "commodity",
};

const DOMAIN_MAP: Record<string, string> = {
  TSLA: "tesla.com", NVDA: "nvidia.com", AAPL: "apple.com", MSFT: "microsoft.com",
  AMZN: "amazon.com", META: "meta.com", GOOGL: "google.com", NFLX: "netflix.com",
  AMD: "amd.com", INTC: "intel.com", BABA: "alibaba.com", NIO: "nio.com",
  PLTR: "palantir.com", COIN: "coinbase.com", HOOD: "robinhood.com", SOFI: "sofi.com",
  RIVN: "rivian.com", LCID: "lucidmotors.com", GME: "gamestop.com", AMC: "amctheatres.com",
  PYPL: "paypal.com", SQ: "block.xyz", SHOP: "shopify.com", UBER: "uber.com",
  LYFT: "lyft.com", SNAP: "snap.com", SPOT: "spotify.com", RBLX: "roblox.com",
  ROKU: "roku.com", ABNB: "airbnb.com", MSTR: "microstrategy.com", GLD: "spdrgoldshares.com",
  SPY: "ssga.com", QQQ: "invesco.com",
};

const NAME_MAP: Record<string, string> = {
  TSLA: "Tesla Inc.", NVDA: "NVIDIA Corp.", AAPL: "Apple Inc.", MSFT: "Microsoft Corp.",
  AMZN: "Amazon.com", META: "Meta Platforms", GOOGL: "Alphabet Inc.", NFLX: "Netflix Inc.",
  AMD: "AMD Inc.", INTC: "Intel Corp.", BABA: "Alibaba Group", NIO: "NIO Inc.",
  PLTR: "Palantir Tech", COIN: "Coinbase Global", HOOD: "Robinhood Markets", SOFI: "SoFi Technologies",
  RIVN: "Rivian Automotive", LCID: "Lucid Group", GME: "GameStop Corp.", AMC: "AMC Entertainment",
  PYPL: "PayPal Holdings", SQ: "Block Inc.", SHOP: "Shopify Inc.", UBER: "Uber Technologies",
  LYFT: "Lyft Inc.", SNAP: "Snap Inc.", SPOT: "Spotify Technology", RBLX: "Roblox Corp.",
  ROKU: "Roku Inc.", ABNB: "Airbnb Inc.", SPY: "S&P 500 ETF", QQQ: "NASDAQ 100 ETF",
  MSTR: "MicroStrategy", GLD: "SPDR Gold Trust",
};

interface StockPerp {
  symbol: string;
  name: string;
  sector: string;
  domain: string;
  price: number;          // perp price
  stockPrice: number;     // actual stock price from Finnhub
  change24h: number;      // perp 24h change
  stockChange: number;    // stock daily change %
  openInterest: number;
  volume24h: number;
  fundingRate: number;
  markPrice: number;
  indexPrice: number;
  fundingExtreme: boolean;
  spread: number;         // perp premium/discount vs stock (%)
  preMarketPrice: number | null;
  sources: string[];
}

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "d7gb999r01qqb8rj0s0gd7gb999r01qqb8rj0s10";

// Separate caches: perp data refreshes fast, stock quotes slower
let cache: { data: StockPerp[]; ts: number } | null = null;
let stockQuoteCache: { data: Map<string, { price: number; change: number; prevClose: number }>; ts: number } | null = null;
const PERP_CACHE_TTL = 3_000;   // perp prices every 3s (near real-time)
const QUOTE_CACHE_TTL = 30_000; // stock quotes every 30s (Finnhub rate limit)

/** Fetch real stock prices from Finnhub (pre-market + regular hours) */
async function fetchStockQuotes(symbols: string[]): Promise<Map<string, { price: number; change: number; prevClose: number }>> {
  const map = new Map();
  // Fetch in parallel batches of 10 (Finnhub allows 60 req/min)
  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    const promises = batch.map(async (sym) => {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`);
        if (!res.ok) return;
        const q = await res.json();
        if (q.c && q.c > 0) {
          map.set(sym, {
            price: q.c, // current price (includes pre/post market)
            change: q.dp || 0, // daily change %
            prevClose: q.pc || q.c,
          });
        }
      } catch {}
    });
    await Promise.all(promises);
  }
  return map;
}

async function fetchKraken(): Promise<Map<string, Partial<StockPerp>>> {
  const map = new Map<string, Partial<StockPerp>>();
  try {
    const res = await fetch("https://futures.kraken.com/derivatives/api/v3/tickers", { next: { revalidate: 30 } });
    if (!res.ok) return map;
    const data = await res.json();
    for (const t of data.tickers || []) {
      const sym = t.symbol || "";
      if (!sym.startsWith("PF_") || !sym.endsWith("XUSD")) continue;
      const base = sym.replace("PF_", "").replace("XUSD", "");
      if (!TARGET_SYMBOLS.includes(base) || !t.last) continue;
      const price = t.last;
      map.set(base, {
        price,
        change24h: t.change24h || 0,
        // Kraken vol24h and openInterest are in CONTRACTS — convert to USD notional
        volume24h: (t.vol24h || 0) * price,
        openInterest: (t.openInterest || 0) * price,
        fundingRate: t.fundingRate || 0,
        markPrice: t.markPrice || price,
        indexPrice: t.indexPrice || price,
      });
    }
  } catch (e) { console.error("Kraken error:", e); }
  return map;
}

async function fetchCoinbaseIntl(): Promise<Map<string, Partial<StockPerp>>> {
  const map = new Map<string, Partial<StockPerp>>();
  try {
    const instRes = await fetch("https://api.international.coinbase.com/api/v1/instruments", { next: { revalidate: 60 } });
    if (!instRes.ok) return map;
    const instruments: any[] = await instRes.json();
    const stockPerps = instruments.filter(i => i.type === "PERP" && TARGET_SYMBOLS.some(s => i.symbol === `${s}-PERP`));

    // Fetch quotes in parallel
    const quotes = await Promise.allSettled(
      stockPerps.map(async (inst) => {
        const sym = inst.symbol.replace("-PERP", "");
        const [quoteRes, candleRes] = await Promise.all([
          fetch(`https://api.international.coinbase.com/api/v1/instruments/${inst.symbol}/quote`),
          fetch(`https://api.international.coinbase.com/api/v1/instruments/${inst.symbol}/candles?granularity=ONE_DAY&start=${new Date(Date.now() - 2 * 86400000).toISOString()}&end=${new Date().toISOString()}`),
        ]);
        const quote = quoteRes.ok ? await quoteRes.json() : null;
        const candle = candleRes.ok ? await candleRes.json() : null;

        if (!quote?.trade_price) return null;

        const price = parseFloat(quote.trade_price);
        const todayCandle = candle?.aggregations?.[0];
        const yesterdayCandle = candle?.aggregations?.[1];
        const prevClose = yesterdayCandle ? parseFloat(yesterdayCandle.close) : price;
        const change24h = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        const vol = todayCandle ? parseFloat(todayCandle.volume) : 0;

        return {
          sym,
          data: {
            price,
            change24h,
            volume24h: vol * price, // convert from contracts to USD notional
            markPrice: parseFloat(quote.mark_price || quote.trade_price),
            indexPrice: parseFloat(quote.index_price || quote.trade_price),
            fundingRate: parseFloat(quote.predicted_funding || "0"),
          },
        };
      })
    );

    for (const result of quotes) {
      if (result.status === "fulfilled" && result.value) {
        map.set(result.value.sym, result.value.data);
      }
    }
  } catch (e) { console.error("Coinbase Intl error:", e); }
  return map;
}

export async function GET() {
  if (cache && Date.now() - cache.ts < PERP_CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  // Perp data: always refresh (fast APIs)
  // Stock quotes: use longer cache (Finnhub rate limited)
  const needQuoteRefresh = !stockQuoteCache || Date.now() - stockQuoteCache.ts > QUOTE_CACHE_TTL;

  const [kraken, coinbase, stockQuotes] = await Promise.all([
    fetchKraken(),
    fetchCoinbaseIntl(),
    needQuoteRefresh ? fetchStockQuotes(TARGET_SYMBOLS) : Promise.resolve(stockQuoteCache!.data),
  ]);

  if (needQuoteRefresh) {
    stockQuoteCache = { data: stockQuotes, ts: Date.now() };
  }

  // Merge: prefer Coinbase (more liquid for stocks), fill gaps with Kraken
  const stocks: StockPerp[] = [];
  for (const sym of TARGET_SYMBOLS) {
    const cb = coinbase.get(sym);
    const kr = kraken.get(sym);

    const sq = stockQuotes.get(sym);
    if (!cb && !kr && !sq) continue; // no data from any source

    const sources: string[] = [];
    if (cb) sources.push("coinbase");
    if (kr) sources.push("kraken");
    if (sq && !cb && !kr) sources.push("finnhub"); // stock-only, no perp

    // Use Coinbase as primary for perp, Kraken as fallback
    const primary = cb || kr;
    const perpPrice = primary?.price || 0;
    const stockPrice = sq?.price || 0;

    // Calculate spread: how much perp deviates from stock price
    const spread = stockPrice > 0 && perpPrice > 0
      ? ((perpPrice - stockPrice) / stockPrice) * 100
      : 0;

    const merged: StockPerp = {
      symbol: sym,
      name: NAME_MAP[sym] || sym,
      sector: SECTOR_MAP[sym] || "growth",
      domain: DOMAIN_MAP[sym] || "",
      price: perpPrice || stockPrice, // perp price if available, else stock
      stockPrice,
      change24h: primary?.change24h || 0,
      stockChange: sq?.change || 0,
      openInterest: (cb?.openInterest || 0) + (kr?.openInterest || 0),
      volume24h: (cb?.volume24h || 0) + (kr?.volume24h || 0),
      fundingRate: primary?.fundingRate || 0,
      markPrice: primary?.markPrice || perpPrice || 0,
      indexPrice: primary?.indexPrice || stockPrice || 0,
      fundingExtreme: Math.abs(primary?.fundingRate || 0) > 0.005,
      spread,
      preMarketPrice: stockPrice, // Finnhub returns current price including pre-market
      sources,
    };

    stocks.push(merged);
  }

  // Sort by volume
  stocks.sort((a, b) => b.volume24h - a.volume24h);

  cache = { data: stocks, ts: Date.now() };
  return NextResponse.json(stocks);
}
