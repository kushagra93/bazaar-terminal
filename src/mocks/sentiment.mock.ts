export interface SentimentData {
  fearGreed: number; // 0-100
  fearGreedLabel: string;
  fearGreedHistory: number[]; // last 7 days
  vix: number;
  vixInterpretation: string;
  putCallRatio: number;
  putCallInterpretation: string;
}

export const SENTIMENT: SentimentData = {
  fearGreed: 72,
  fearGreedLabel: "Greed",
  fearGreedHistory: [58, 62, 65, 68, 64, 70, 72],
  vix: 18.4,
  vixInterpretation: "Moderate — normal conditions. Trending market.",
  putCallRatio: 0.82,
  putCallInterpretation: "Neutral-bullish — puts slightly below average",
};

export interface Influencer {
  handle: string;
  name: string;
  followers: string;
  lastCall: { type: "LONG" | "SHORT"; symbol: string; outcome: string | null };
  accuracy: number; // 0-100
}

export const INFLUENCERS: Influencer[] = [
  { handle: "chaikinamit", name: "Amit Chaiki", followers: "284K", lastCall: { type: "LONG", symbol: "NVDA", outcome: "+12.4%" }, accuracy: 68 },
  { handle: "stocktrader_raj", name: "Raj Malhotra", followers: "142K", lastCall: { type: "SHORT", symbol: "TSLA", outcome: "+4.2%" }, accuracy: 62 },
  { handle: "niftyqueen", name: "Priya Sharma", followers: "98K", lastCall: { type: "LONG", symbol: "META", outcome: "+8.1%" }, accuracy: 71 },
  { handle: "usstocks_india", name: "US Stocks India", followers: "216K", lastCall: { type: "LONG", symbol: "AAPL", outcome: "-2.3%" }, accuracy: 58 },
  { handle: "tradingwithvik", name: "Vikram Patel", followers: "178K", lastCall: { type: "SHORT", symbol: "AMC", outcome: "+6.8%" }, accuracy: 64 },
  { handle: "finshots_trading", name: "FinShots Trading", followers: "324K", lastCall: { type: "LONG", symbol: "COIN", outcome: null }, accuracy: 66 },
  { handle: "bangalorebulls", name: "Bangalore Bulls", followers: "89K", lastCall: { type: "LONG", symbol: "PLTR", outcome: "+3.4%" }, accuracy: 60 },
  { handle: "hyderabadtrader", name: "Akhil Reddy", followers: "67K", lastCall: { type: "SHORT", symbol: "RIVN", outcome: "+8.2%" }, accuracy: 72 },
  { handle: "mumbaimoney", name: "Mumbai Money", followers: "156K", lastCall: { type: "LONG", symbol: "AMD", outcome: "+5.6%" }, accuracy: 65 },
  { handle: "perps_pandit", name: "Perps Pandit", followers: "124K", lastCall: { type: "SHORT", symbol: "INTC", outcome: "+3.8%" }, accuracy: 69 },
];

export const TRENDING_TOPICS = [
  { topic: "NVDA earnings", weight: 100 },
  { topic: "TSLA short squeeze", weight: 82 },
  { topic: "Fed pivot", weight: 74 },
  { topic: "Dollar strengthening", weight: 68 },
  { topic: "CPI release", weight: 64 },
  { topic: "AI bubble", weight: 58 },
  { topic: "GME revival", weight: 52 },
  { topic: "INTC restructuring", weight: 48 },
  { topic: "Tech earnings week", weight: 72 },
  { topic: "India US markets tax", weight: 44 },
  { topic: "COIN crypto correlation", weight: 40 },
  { topic: "EV sector rotation", weight: 36 },
];

export interface AnalystRating {
  symbol: string;
  bullPct: number;
  holdPct: number;
  bearPct: number;
  targetPrice: number;
  currentPrice: number;
  recentChange: string | null; // "Morgan Stanley upgraded to BUY · 2 days ago"
}

export const ANALYST_RATINGS: AnalystRating[] = [
  { symbol: "TSLA", bullPct: 42, holdPct: 28, bearPct: 30, targetPrice: 220, currentPrice: 181.20, recentChange: "Morgan Stanley upgraded to Overweight · 2 days ago" },
  { symbol: "NVDA", bullPct: 88, holdPct: 10, bearPct: 2, targetPrice: 160, currentPrice: 138.42, recentChange: "Goldman Sachs raised target to $165 · 1 day ago" },
  { symbol: "AAPL", bullPct: 62, holdPct: 30, bearPct: 8, targetPrice: 225, currentPrice: 198.30, recentChange: null },
  { symbol: "MSFT", bullPct: 82, holdPct: 14, bearPct: 4, targetPrice: 500, currentPrice: 442.80, recentChange: "JPMorgan initiated at Overweight · 5 days ago" },
  { symbol: "META", bullPct: 76, holdPct: 18, bearPct: 6, targetPrice: 640, currentPrice: 582.40, recentChange: null },
  { symbol: "AMD", bullPct: 72, holdPct: 22, bearPct: 6, targetPrice: 190, currentPrice: 164.20, recentChange: "Barclays upgraded to Overweight · 3 days ago" },
  { symbol: "GOOGL", bullPct: 78, holdPct: 18, bearPct: 4, targetPrice: 200, currentPrice: 178.90, recentChange: null },
  { symbol: "COIN", bullPct: 58, holdPct: 24, bearPct: 18, targetPrice: 300, currentPrice: 264.80, recentChange: "Oppenheimer initiated at Outperform · 4 days ago" },
  { symbol: "PLTR", bullPct: 48, holdPct: 32, bearPct: 20, targetPrice: 50, currentPrice: 42.80, recentChange: null },
  { symbol: "INTC", bullPct: 18, holdPct: 42, bearPct: 40, targetPrice: 28, currentPrice: 22.40, recentChange: "Citi downgraded to Sell · 1 day ago" },
];
