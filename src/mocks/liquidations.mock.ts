export interface LiquidationEvent {
  id: number;
  symbol: string;
  side: "LONG" | "SHORT";
  amount: number; // USD
  exchange: string;
  timestamp: string; // ISO
}

const EXCHANGES = ["Binance", "Bybit", "Hyperliquid", "OKX"];
const SYMBOLS = ["TSLA", "NVDA", "AAPL", "MSFT", "AMD", "GOOGL", "META", "COIN", "GME", "AMC", "INTC", "PLTR", "RIVN", "LCID", "NIO", "SNAP", "HOOD"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLiquidations(count: number): LiquidationEvent[] {
  const events: LiquidationEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const symbol = randomItem(SYMBOLS);
    // Weight toward bigger liquidations for popular stocks
    const isPopular = ["TSLA", "NVDA", "GME", "AMC", "COIN"].includes(symbol);
    const baseAmount = isPopular ? 50_000 : 10_000;
    const multiplier = Math.random() < 0.05 ? 200 : Math.random() < 0.15 ? 50 : Math.random() < 0.4 ? 10 : 1;
    const amount = baseAmount * multiplier * (0.5 + Math.random());

    events.push({
      id: i + 1,
      symbol,
      side: Math.random() > 0.45 ? "LONG" : "SHORT",
      amount: Math.round(amount),
      exchange: randomItem(EXCHANGES),
      timestamp: new Date(now - i * 42_000 - Math.random() * 30_000).toISOString(), // ~42s apart
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const LIQUIDATIONS = generateLiquidations(100);

export function getLiquidationStats() {
  const now = Date.now();
  const h1 = LIQUIDATIONS.filter(l => now - new Date(l.timestamp).getTime() < 3600_000);
  const h4 = LIQUIDATIONS.filter(l => now - new Date(l.timestamp).getTime() < 4 * 3600_000);
  const h24 = LIQUIDATIONS;

  const sum = (arr: LiquidationEvent[]) => arr.reduce((s, l) => s + l.amount, 0);
  const largest = [...h24].sort((a, b) => b.amount - a.amount)[0];

  return {
    h1Total: sum(h1),
    h4Total: sum(h4),
    h24Total: sum(h24),
    largest,
    h1Count: h1.length,
  };
}
