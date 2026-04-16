export interface Signal {
  id: number;
  symbol: string;
  type: "LONG" | "SHORT" | "WATCH" | "AVOID";
  confidence: number;
  timeframe: "15m" | "1h" | "4h" | "1d";
  timeframeLabel: string;
  reasons: string[]; // keys into i18n.reasons
  entry: number;
  stopLoss: number;
  target: number;
  riskReward: string;
  createdAt: string; // ISO
  resolvedAt: string | null;
  outcome: string | null; // "+5.1%" or "-1.8%"
  hit: boolean | null;
}

export const SIGNALS: Signal[] = [
  {
    id: 1, symbol: "TSLA", type: "SHORT", confidence: 82,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["funding_pos_extreme", "ls_long_crowded", "earnings_near"],
    entry: 181.20, stopLoss: 188.40, target: 168.00,
    riskReward: "1:1.8", createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 2, symbol: "NVDA", type: "LONG", confidence: 76,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["funding_neg", "oi_rising", "sector_strength", "premarket_gap_up"],
    entry: 138.42, stopLoss: 134.00, target: 146.00,
    riskReward: "1:1.7", createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 3, symbol: "INTC", type: "SHORT", confidence: 68,
    timeframe: "1h", timeframeLabel: "Scalp",
    reasons: ["oi_falling", "sector_weakness"],
    entry: 22.40, stopLoss: 23.10, target: 21.40,
    riskReward: "1:1.4", createdAt: new Date(Date.now() - 85 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 4, symbol: "COIN", type: "LONG", confidence: 74,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["oi_rising", "ls_short_heavy"],
    entry: 264.80, stopLoss: 252.00, target: 284.00,
    riskReward: "1:1.5", createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 5, symbol: "GME", type: "WATCH", confidence: 58,
    timeframe: "1h", timeframeLabel: "Scalp",
    reasons: ["ls_long_crowded", "funding_pos_extreme"],
    entry: 28.40, stopLoss: 26.80, target: 32.00,
    riskReward: "1:2.2", createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 6, symbol: "AMD", type: "LONG", confidence: 71,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["funding_neg", "oi_rising", "sector_strength"],
    entry: 164.20, stopLoss: 158.00, target: 174.00,
    riskReward: "1:1.6", createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 7, symbol: "LCID", type: "SHORT", confidence: 84,
    timeframe: "1d", timeframeLabel: "Position Trade",
    reasons: ["oi_falling", "ls_short_heavy", "sector_weakness"],
    entry: 3.42, stopLoss: 3.72, target: 2.80,
    riskReward: "1:2.1", createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  {
    id: 8, symbol: "PLTR", type: "LONG", confidence: 66,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["oi_rising", "sector_strength"],
    entry: 42.80, stopLoss: 40.60, target: 46.40,
    riskReward: "1:1.6", createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
    resolvedAt: null, outcome: null, hit: null,
  },
  // Resolved signals
  {
    id: 9, symbol: "META", type: "LONG", confidence: 72,
    timeframe: "4h", timeframeLabel: "Swing Trade",
    reasons: ["oi_rising", "premarket_gap_up"],
    entry: 568.00, stopLoss: 552.00, target: 592.00,
    riskReward: "1:1.5", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000).toISOString(), outcome: "+4.2%", hit: true,
  },
  {
    id: 10, symbol: "SNAP", type: "SHORT", confidence: 64,
    timeframe: "1h", timeframeLabel: "Scalp",
    reasons: ["oi_falling", "sector_weakness"],
    entry: 13.20, stopLoss: 13.80, target: 12.20,
    riskReward: "1:1.7", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 2.5 * 86400000).toISOString(), outcome: "-1.8%", hit: false,
  },
  {
    id: 11, symbol: "TSLA", type: "LONG", confidence: 62,
    timeframe: "15m", timeframeLabel: "Quick Scalp",
    reasons: ["ls_short_heavy", "funding_neg"],
    entry: 176.00, stopLoss: 173.50, target: 180.00,
    riskReward: "1:1.6", createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 3.8 * 86400000).toISOString(), outcome: "+2.3%", hit: true,
  },
];

export function getActiveSignals(): Signal[] {
  return SIGNALS.filter(s => !s.resolvedAt);
}

export function getSignalHistory(symbol: string): Signal[] {
  return SIGNALS.filter(s => s.symbol === symbol).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
