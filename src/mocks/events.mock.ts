export interface MarketEvent {
  id: number;
  type: "earnings" | "fed" | "data";
  symbol: string | null; // null for macro events
  title: string;
  dateET: string; // ISO string in ET
  dateIST: string;
  time: string; // "After Close", "Before Open", "2:30 PM ET"
  impact: "high" | "medium" | "low";
  detail: string;
  optionsMove?: number; // expected % move from options pricing
  lastReactions?: number[]; // last 4 earnings reactions in %
  analystConsensus?: "beat" | "miss" | "inline";
  affectedSectors?: string[];
}

const now = new Date();
const tomorrow = new Date(now.getTime() + 86400000);
const dayAfter = new Date(now.getTime() + 2 * 86400000);
const nextWeek = new Date(now.getTime() + 5 * 86400000);

export const EVENTS: MarketEvent[] = [
  {
    id: 1, type: "earnings", symbol: "TSLA", title: "Tesla Q3 FY2025 Earnings",
    dateET: tomorrow.toISOString(), dateIST: tomorrow.toISOString(),
    time: "After Close", impact: "high",
    detail: "Key metrics: Deliveries, margins, FSD revenue recognition",
    optionsMove: 8.4, lastReactions: [9.8, -12.1, 5.4, -8.2], analystConsensus: "beat",
  },
  {
    id: 2, type: "earnings", symbol: "NVDA", title: "NVIDIA Q3 FY2025 Earnings",
    dateET: dayAfter.toISOString(), dateIST: dayAfter.toISOString(),
    time: "After Close", impact: "high",
    detail: "AI demand trajectory, data center revenue, China export impact",
    optionsMove: 7.2, lastReactions: [16.4, -6.8, 24.4, -4.2], analystConsensus: "beat",
  },
  {
    id: 3, type: "earnings", symbol: "INTC", title: "Intel Q3 FY2025 Earnings",
    dateET: dayAfter.toISOString(), dateIST: dayAfter.toISOString(),
    time: "After Close", impact: "high",
    detail: "Foundry update, AI PC momentum, cost restructuring progress",
    optionsMove: 9.8, lastReactions: [-8.2, -12.4, 2.1, -6.8], analystConsensus: "miss",
  },
  {
    id: 4, type: "fed", symbol: null, title: "Fed Chair Powell Speech",
    dateET: tomorrow.toISOString(), dateIST: tomorrow.toISOString(),
    time: "2:30 PM ET", impact: "high",
    detail: "Rate outlook and inflation commentary — expect 1-2% swings across market",
    affectedSectors: ["tech", "fintech", "growth"],
  },
  {
    id: 5, type: "data", symbol: null, title: "CPI Release — Consumer Price Index",
    dateET: dayAfter.toISOString(), dateIST: dayAfter.toISOString(),
    time: "8:30 AM ET", impact: "high",
    detail: "Core CPI expected 3.2% YoY. Higher = hawkish Fed, tech selloff likely",
    affectedSectors: ["tech", "growth"],
  },
  {
    id: 6, type: "data", symbol: null, title: "Initial Jobless Claims",
    dateET: dayAfter.toISOString(), dateIST: dayAfter.toISOString(),
    time: "8:30 AM ET", impact: "medium",
    detail: "Expected 225K. Higher = dovish signal, bullish for growth",
    affectedSectors: ["growth"],
  },
  {
    id: 7, type: "earnings", symbol: "MSFT", title: "Microsoft Q1 FY2026 Earnings",
    dateET: nextWeek.toISOString(), dateIST: nextWeek.toISOString(),
    time: "After Close", impact: "high",
    detail: "Azure growth, AI revenue contribution, Office 365 pricing power",
    optionsMove: 5.4, lastReactions: [4.2, -2.1, 6.8, 1.2], analystConsensus: "beat",
  },
  {
    id: 8, type: "earnings", symbol: "GOOGL", title: "Alphabet Q3 FY2025 Earnings",
    dateET: nextWeek.toISOString(), dateIST: nextWeek.toISOString(),
    time: "After Close", impact: "high",
    detail: "Search revenue, YouTube ads, Cloud growth, AI integration",
    optionsMove: 6.1, lastReactions: [5.2, -8.4, 3.8, 10.2], analystConsensus: "beat",
  },
  {
    id: 9, type: "fed", symbol: null, title: "FOMC Meeting Minutes",
    dateET: nextWeek.toISOString(), dateIST: nextWeek.toISOString(),
    time: "2:00 PM ET", impact: "medium",
    detail: "Details on rate decision discussion — watch for dissent signals",
    affectedSectors: ["tech", "fintech", "growth", "ev"],
  },
  {
    id: 10, type: "earnings", symbol: "META", title: "Meta Q3 FY2025 Earnings",
    dateET: new Date(now.getTime() + 8 * 86400000).toISOString(),
    dateIST: new Date(now.getTime() + 8 * 86400000).toISOString(),
    time: "After Close", impact: "high",
    detail: "Reality Labs losses, ad revenue, Threads growth, AI investments",
    optionsMove: 8.2, lastReactions: [14.2, -4.1, 20.3, -3.8], analystConsensus: "beat",
  },
];

export function getEventsTonight(): MarketEvent[] {
  const tonight = new Date();
  tonight.setHours(tonight.getHours() + 24);
  return EVENTS.filter(e => new Date(e.dateET).getTime() <= tonight.getTime());
}

export function getEarningsEvents(): MarketEvent[] {
  return EVENTS.filter(e => e.type === "earnings");
}

export function getMacroEvents(): MarketEvent[] {
  return EVENTS.filter(e => e.type === "fed" || e.type === "data");
}
