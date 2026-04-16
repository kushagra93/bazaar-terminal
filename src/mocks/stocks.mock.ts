export interface StockPerp {
  symbol: string;
  name: string;
  sector: "tech" | "ev" | "fintech" | "meme" | "growth";
  domain: string; // for clearbit logo
  price: number; // USD
  change24h: number; // %
  change1h: number;
  openInterest: number; // USD
  oiChange1h: number; // %
  volume24h: number; // USD
  fundingRate: number; // per 8h
  longRatio: number; // 0-1
  liquidations1h: number; // USD
  sessionVolume: "pre" | "open" | "ah" | "night";
  sessionVolRatio: number; // vs average
  daysToEarnings: number | null;
  earningsTime: string | null; // "bmo" | "amc"
}

export const SECTOR_MAP: Record<string, string[]> = {
  tech: ["AAPL", "MSFT", "NVDA", "AMD", "INTC", "GOOGL", "META"],
  ev: ["TSLA", "RIVN", "LCID", "NIO"],
  fintech: ["COIN", "HOOD", "SOFI", "PYPL", "SQ"],
  meme: ["GME", "AMC"],
  growth: ["PLTR", "SHOP", "UBER", "SNAP", "SPOT", "RBLX", "ROKU", "ABNB", "BABA", "NFLX", "LYFT"],
};

export const STOCKS: StockPerp[] = [
  // === SPY & QQQ (market context) ===
  { symbol: "SPY", name: "S&P 500 ETF", sector: "tech", domain: "ssga.com", price: 582.30, change24h: 0.47, change1h: 0.12, openInterest: 8_200_000_000, oiChange1h: 1.2, volume24h: 12_400_000_000, fundingRate: 0.0008, longRatio: 0.54, liquidations1h: 2_800_000, sessionVolume: "open", sessionVolRatio: 1.1, daysToEarnings: null, earningsTime: null },
  { symbol: "QQQ", name: "NASDAQ 100 ETF", sector: "tech", domain: "invesco.com", price: 502.18, change24h: 0.62, change1h: 0.18, openInterest: 5_600_000_000, oiChange1h: 2.1, volume24h: 8_900_000_000, fundingRate: 0.0012, longRatio: 0.56, liquidations1h: 1_900_000, sessionVolume: "open", sessionVolRatio: 1.3, daysToEarnings: null, earningsTime: null },

  // === Tech ===
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "tech", domain: "nvidia.com", price: 138.42, change24h: 3.21, change1h: 0.87, openInterest: 4_200_000_000, oiChange1h: 8.4, volume24h: 6_800_000_000, fundingRate: 0.0034, longRatio: 0.64, liquidations1h: 4_200_000, sessionVolume: "open", sessionVolRatio: 1.8, daysToEarnings: 2, earningsTime: "amc" },
  { symbol: "AAPL", name: "Apple Inc.", sector: "tech", domain: "apple.com", price: 198.30, change24h: -0.42, change1h: -0.11, openInterest: 3_100_000_000, oiChange1h: -1.3, volume24h: 4_200_000_000, fundingRate: -0.0008, longRatio: 0.48, liquidations1h: 890_000, sessionVolume: "open", sessionVolRatio: 0.9, daysToEarnings: 18, earningsTime: "amc" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "tech", domain: "microsoft.com", price: 442.80, change24h: 0.89, change1h: 0.23, openInterest: 2_800_000_000, oiChange1h: 3.2, volume24h: 3_600_000_000, fundingRate: 0.0015, longRatio: 0.58, liquidations1h: 620_000, sessionVolume: "open", sessionVolRatio: 1.1, daysToEarnings: 12, earningsTime: "amc" },
  { symbol: "AMD", name: "AMD Inc.", sector: "tech", domain: "amd.com", price: 164.20, change24h: 2.14, change1h: 0.62, openInterest: 1_800_000_000, oiChange1h: 5.6, volume24h: 2_900_000_000, fundingRate: 0.0028, longRatio: 0.61, liquidations1h: 1_400_000, sessionVolume: "open", sessionVolRatio: 1.4, daysToEarnings: 8, earningsTime: "amc" },
  { symbol: "INTC", name: "Intel Corporation", sector: "tech", domain: "intel.com", price: 22.40, change24h: -1.82, change1h: -0.34, openInterest: 680_000_000, oiChange1h: -4.2, volume24h: 1_200_000_000, fundingRate: -0.0042, longRatio: 0.38, liquidations1h: 2_100_000, sessionVolume: "open", sessionVolRatio: 1.6, daysToEarnings: 5, earningsTime: "amc" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "tech", domain: "google.com", price: 178.90, change24h: 0.34, change1h: 0.08, openInterest: 2_400_000_000, oiChange1h: 1.8, volume24h: 3_100_000_000, fundingRate: 0.0006, longRatio: 0.52, liquidations1h: 340_000, sessionVolume: "open", sessionVolRatio: 0.8, daysToEarnings: 22, earningsTime: "amc" },
  { symbol: "META", name: "Meta Platforms", sector: "tech", domain: "meta.com", price: 582.40, change24h: 1.56, change1h: 0.42, openInterest: 2_600_000_000, oiChange1h: 4.1, volume24h: 3_400_000_000, fundingRate: 0.0022, longRatio: 0.59, liquidations1h: 780_000, sessionVolume: "open", sessionVolRatio: 1.2, daysToEarnings: 15, earningsTime: "amc" },

  // === EV/Auto ===
  { symbol: "TSLA", name: "Tesla Inc.", sector: "ev", domain: "tesla.com", price: 181.20, change24h: -2.34, change1h: -0.78, openInterest: 5_400_000_000, oiChange1h: -6.2, volume24h: 7_200_000_000, fundingRate: -0.0068, longRatio: 0.42, liquidations1h: 8_400_000, sessionVolume: "open", sessionVolRatio: 2.1, daysToEarnings: 1, earningsTime: "amc" },
  { symbol: "RIVN", name: "Rivian Automotive", sector: "ev", domain: "rivian.com", price: 14.80, change24h: -3.42, change1h: -1.12, openInterest: 420_000_000, oiChange1h: -8.4, volume24h: 680_000_000, fundingRate: -0.0092, longRatio: 0.35, liquidations1h: 3_200_000, sessionVolume: "open", sessionVolRatio: 1.8, daysToEarnings: null, earningsTime: null },
  { symbol: "LCID", name: "Lucid Group", sector: "ev", domain: "lucidmotors.com", price: 3.42, change24h: -4.18, change1h: -1.84, openInterest: 180_000_000, oiChange1h: -12.1, volume24h: 340_000_000, fundingRate: -0.0124, longRatio: 0.31, liquidations1h: 4_800_000, sessionVolume: "open", sessionVolRatio: 2.4, daysToEarnings: null, earningsTime: null },
  { symbol: "NIO", name: "NIO Inc.", sector: "ev", domain: "nio.com", price: 5.84, change24h: 1.92, change1h: 0.54, openInterest: 320_000_000, oiChange1h: 6.8, volume24h: 520_000_000, fundingRate: 0.0018, longRatio: 0.55, liquidations1h: 890_000, sessionVolume: "open", sessionVolRatio: 1.1, daysToEarnings: null, earningsTime: null },

  // === Fintech ===
  { symbol: "COIN", name: "Coinbase Global", sector: "fintech", domain: "coinbase.com", price: 264.80, change24h: 4.82, change1h: 1.24, openInterest: 1_200_000_000, oiChange1h: 12.4, volume24h: 2_100_000_000, fundingRate: 0.0048, longRatio: 0.68, liquidations1h: 2_800_000, sessionVolume: "open", sessionVolRatio: 2.2, daysToEarnings: null, earningsTime: null },
  { symbol: "HOOD", name: "Robinhood Markets", sector: "fintech", domain: "robinhood.com", price: 24.60, change24h: 2.18, change1h: 0.64, openInterest: 380_000_000, oiChange1h: 5.2, volume24h: 620_000_000, fundingRate: 0.0022, longRatio: 0.58, liquidations1h: 420_000, sessionVolume: "open", sessionVolRatio: 1.3, daysToEarnings: null, earningsTime: null },
  { symbol: "SOFI", name: "SoFi Technologies", sector: "fintech", domain: "sofi.com", price: 11.20, change24h: 1.42, change1h: 0.38, openInterest: 280_000_000, oiChange1h: 3.8, volume24h: 480_000_000, fundingRate: 0.0014, longRatio: 0.54, liquidations1h: 180_000, sessionVolume: "open", sessionVolRatio: 1.0, daysToEarnings: null, earningsTime: null },
  { symbol: "PYPL", name: "PayPal Holdings", sector: "fintech", domain: "paypal.com", price: 68.40, change24h: -0.68, change1h: -0.22, openInterest: 420_000_000, oiChange1h: -2.1, volume24h: 580_000_000, fundingRate: -0.0006, longRatio: 0.46, liquidations1h: 240_000, sessionVolume: "open", sessionVolRatio: 0.8, daysToEarnings: null, earningsTime: null },
  { symbol: "SQ", name: "Block Inc.", sector: "fintech", domain: "block.xyz", price: 72.80, change24h: 0.92, change1h: 0.28, openInterest: 360_000_000, oiChange1h: 1.4, volume24h: 520_000_000, fundingRate: 0.0008, longRatio: 0.51, liquidations1h: 160_000, sessionVolume: "open", sessionVolRatio: 0.9, daysToEarnings: null, earningsTime: null },

  // === Meme ===
  { symbol: "GME", name: "GameStop Corp.", sector: "meme", domain: "gamestop.com", price: 28.40, change24h: 8.42, change1h: 3.21, openInterest: 620_000_000, oiChange1h: 24.6, volume24h: 1_800_000_000, fundingRate: 0.0182, longRatio: 0.74, liquidations1h: 12_400_000, sessionVolume: "open", sessionVolRatio: 4.2, daysToEarnings: null, earningsTime: null },
  { symbol: "AMC", name: "AMC Entertainment", sector: "meme", domain: "amctheatres.com", price: 4.82, change24h: 6.18, change1h: 2.42, openInterest: 340_000_000, oiChange1h: 18.2, volume24h: 920_000_000, fundingRate: 0.0142, longRatio: 0.71, liquidations1h: 8_200_000, sessionVolume: "open", sessionVolRatio: 3.8, daysToEarnings: null, earningsTime: null },

  // === Growth ===
  { symbol: "PLTR", name: "Palantir Technologies", sector: "growth", domain: "palantir.com", price: 42.80, change24h: 1.84, change1h: 0.52, openInterest: 890_000_000, oiChange1h: 4.8, volume24h: 1_400_000_000, fundingRate: 0.0024, longRatio: 0.62, liquidations1h: 680_000, sessionVolume: "open", sessionVolRatio: 1.4, daysToEarnings: null, earningsTime: null },
  { symbol: "SHOP", name: "Shopify Inc.", sector: "growth", domain: "shopify.com", price: 82.40, change24h: 0.64, change1h: 0.18, openInterest: 480_000_000, oiChange1h: 1.2, volume24h: 680_000_000, fundingRate: 0.0006, longRatio: 0.50, liquidations1h: 120_000, sessionVolume: "open", sessionVolRatio: 0.7, daysToEarnings: null, earningsTime: null },
  { symbol: "UBER", name: "Uber Technologies", sector: "growth", domain: "uber.com", price: 78.20, change24h: 1.12, change1h: 0.32, openInterest: 420_000_000, oiChange1h: 2.4, volume24h: 580_000_000, fundingRate: 0.0010, longRatio: 0.53, liquidations1h: 180_000, sessionVolume: "open", sessionVolRatio: 0.9, daysToEarnings: null, earningsTime: null },
  { symbol: "SNAP", name: "Snap Inc.", sector: "growth", domain: "snap.com", price: 12.40, change24h: -2.84, change1h: -0.92, openInterest: 240_000_000, oiChange1h: -6.4, volume24h: 420_000_000, fundingRate: -0.0034, longRatio: 0.39, liquidations1h: 1_800_000, sessionVolume: "open", sessionVolRatio: 1.6, daysToEarnings: null, earningsTime: null },
  { symbol: "SPOT", name: "Spotify Technology", sector: "growth", domain: "spotify.com", price: 384.20, change24h: 0.42, change1h: 0.12, openInterest: 320_000_000, oiChange1h: 0.8, volume24h: 420_000_000, fundingRate: 0.0004, longRatio: 0.51, liquidations1h: 80_000, sessionVolume: "open", sessionVolRatio: 0.6, daysToEarnings: null, earningsTime: null },
  { symbol: "RBLX", name: "Roblox Corp.", sector: "growth", domain: "roblox.com", price: 48.60, change24h: -1.24, change1h: -0.42, openInterest: 280_000_000, oiChange1h: -3.2, volume24h: 380_000_000, fundingRate: -0.0012, longRatio: 0.44, liquidations1h: 420_000, sessionVolume: "open", sessionVolRatio: 1.1, daysToEarnings: null, earningsTime: null },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "growth", domain: "netflix.com", price: 724.80, change24h: 0.82, change1h: 0.24, openInterest: 1_200_000_000, oiChange1h: 2.1, volume24h: 1_800_000_000, fundingRate: 0.0012, longRatio: 0.55, liquidations1h: 340_000, sessionVolume: "open", sessionVolRatio: 0.9, daysToEarnings: null, earningsTime: null },
  { symbol: "ABNB", name: "Airbnb Inc.", sector: "growth", domain: "airbnb.com", price: 148.60, change24h: -0.92, change1h: -0.28, openInterest: 380_000_000, oiChange1h: -1.8, volume24h: 520_000_000, fundingRate: -0.0004, longRatio: 0.47, liquidations1h: 160_000, sessionVolume: "open", sessionVolRatio: 0.8, daysToEarnings: null, earningsTime: null },
  { symbol: "BABA", name: "Alibaba Group", sector: "growth", domain: "alibaba.com", price: 86.20, change24h: -1.48, change1h: -0.54, openInterest: 680_000_000, oiChange1h: -3.8, volume24h: 980_000_000, fundingRate: -0.0018, longRatio: 0.41, liquidations1h: 1_200_000, sessionVolume: "open", sessionVolRatio: 1.2, daysToEarnings: null, earningsTime: null },
  { symbol: "ROKU", name: "Roku Inc.", sector: "growth", domain: "roku.com", price: 68.40, change24h: -2.14, change1h: -0.68, openInterest: 180_000_000, oiChange1h: -5.2, volume24h: 280_000_000, fundingRate: -0.0028, longRatio: 0.38, liquidations1h: 840_000, sessionVolume: "open", sessionVolRatio: 1.4, daysToEarnings: null, earningsTime: null },
  { symbol: "LYFT", name: "Lyft Inc.", sector: "growth", domain: "lyft.com", price: 14.20, change24h: 0.82, change1h: 0.22, openInterest: 120_000_000, oiChange1h: 1.8, volume24h: 180_000_000, fundingRate: 0.0006, longRatio: 0.52, liquidations1h: 60_000, sessionVolume: "open", sessionVolRatio: 0.7, daysToEarnings: null, earningsTime: null },
];

export const CONTEXT_INSTRUMENTS = ["SPY", "QQQ"];

export function getStocksBySection() {
  const context = STOCKS.filter(s => CONTEXT_INSTRUMENTS.includes(s.symbol));
  const ranked = STOCKS.filter(s => !CONTEXT_INSTRUMENTS.includes(s.symbol));
  return { context, ranked };
}

export function getStocksBySector(sector: string): StockPerp[] {
  const symbols = SECTOR_MAP[sector] || [];
  return STOCKS.filter(s => symbols.includes(s.symbol));
}

export function getSectorPerformance(): { sector: string; avgChange: number; totalOI: number }[] {
  return Object.entries(SECTOR_MAP).map(([sector, symbols]) => {
    const stocks = STOCKS.filter(s => symbols.includes(s.symbol));
    const avgChange = stocks.reduce((s, st) => s + st.change24h, 0) / stocks.length;
    const totalOI = stocks.reduce((s, st) => s + st.openInterest, 0);
    return { sector, avgChange, totalOI };
  });
}
