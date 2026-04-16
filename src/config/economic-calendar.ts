/**
 * US Economic Calendar — Q2 2026 (April–June)
 *
 * Major scheduled events from:
 * - Federal Reserve (FOMC meetings, minutes, speeches)
 * - Bureau of Labor Statistics (CPI, NFP, PPI, Jobless Claims)
 * - Bureau of Economic Analysis (GDP, PCE)
 * - Census Bureau (Retail Sales, Housing)
 * - ISM (Manufacturing, Services PMI)
 *
 * These dates are published in advance and don't change.
 * Times are in ET. Impact: high/medium/low.
 */

export interface ScheduledEvent {
  date: string; // YYYY-MM-DD
  timeET: string;
  timeIST: string;
  event: string;
  impact: "high" | "medium" | "low";
  category: "fed" | "jobs" | "inflation" | "gdp" | "housing" | "manufacturing" | "consumer";
  detail: string;
}

export const Q2_2026_CALENDAR: ScheduledEvent[] = [
  // ══════ APRIL 2026 ══════
  // Week of Apr 13
  { date: "2026-04-14", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Retail Sales (Mar)", impact: "high", category: "consumer", detail: "Consumer spending gauge — core retail ex-autos watched closely" },
  { date: "2026-04-15", timeET: "9:15 AM", timeIST: "6:45 PM", event: "Industrial Production (Mar)", impact: "medium", category: "manufacturing", detail: "Factory output + capacity utilization" },
  { date: "2026-04-16", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Housing Starts (Mar)", impact: "medium", category: "housing", detail: "New residential construction + building permits" },
  { date: "2026-04-17", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Initial Jobless Claims", impact: "medium", category: "jobs", detail: "Weekly unemployment filings — labor market pulse" },
  { date: "2026-04-17", timeET: "10:00 AM", timeIST: "7:30 PM", event: "Existing Home Sales (Mar)", impact: "medium", category: "housing", detail: "Resale market activity" },

  // Week of Apr 20
  { date: "2026-04-22", timeET: "10:00 AM", timeIST: "7:30 PM", event: "New Home Sales (Mar)", impact: "medium", category: "housing", detail: "New residential sales — leading indicator for housing" },
  { date: "2026-04-23", timeET: "9:45 AM", timeIST: "7:15 PM", event: "S&P Global PMI Flash (Apr)", impact: "high", category: "manufacturing", detail: "Flash manufacturing + services PMI — first look at April activity" },
  { date: "2026-04-24", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Durable Goods Orders (Mar)", impact: "high", category: "manufacturing", detail: "Big-ticket factory orders — capex proxy" },
  { date: "2026-04-24", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Initial Jobless Claims", impact: "medium", category: "jobs", detail: "Weekly unemployment filings" },

  // Week of Apr 27
  { date: "2026-04-28", timeET: "10:00 AM", timeIST: "7:30 PM", event: "Consumer Confidence (Apr)", impact: "high", category: "consumer", detail: "Conference Board index — consumer outlook on economy" },
  { date: "2026-04-29", timeET: "8:30 AM", timeIST: "6:00 PM", event: "GDP Q1 2026 (Advance)", impact: "high", category: "gdp", detail: "First estimate of Q1 GDP growth — market-moving" },
  { date: "2026-04-30", timeET: "8:30 AM", timeIST: "6:00 PM", event: "PCE Price Index (Mar)", impact: "high", category: "inflation", detail: "Fed's preferred inflation gauge — Core PCE is the key number" },
  { date: "2026-04-30", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Personal Income & Spending (Mar)", impact: "medium", category: "consumer", detail: "Income growth + consumer spending" },

  // ══════ MAY 2026 ══════
  // Week of May 1
  { date: "2026-05-01", timeET: "10:00 AM", timeIST: "7:30 PM", event: "ISM Manufacturing PMI (Apr)", impact: "high", category: "manufacturing", detail: "Factory sector health — above 50 = expansion" },
  { date: "2026-05-01", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Initial Jobless Claims", impact: "medium", category: "jobs", detail: "Weekly unemployment filings" },

  // FOMC Meeting
  { date: "2026-05-05", timeET: "2:00 PM", timeIST: "11:30 PM", event: "FOMC Rate Decision", impact: "high", category: "fed", detail: "Federal Reserve interest rate decision + statement — THE event of the month" },
  { date: "2026-05-05", timeET: "2:30 PM", timeIST: "12:00 AM+1", event: "Fed Chair Powell Press Conference", impact: "high", category: "fed", detail: "Powell Q&A — forward guidance, dot plot implications" },
  { date: "2026-05-06", timeET: "10:00 AM", timeIST: "7:30 PM", event: "ISM Services PMI (Apr)", impact: "high", category: "manufacturing", detail: "Services sector — 70% of US economy" },

  // NFP Week
  { date: "2026-05-08", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Non-Farm Payrolls (Apr)", impact: "high", category: "jobs", detail: "THE jobs report — payrolls, unemployment rate, wage growth. Moves every market." },
  { date: "2026-05-08", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Unemployment Rate (Apr)", impact: "high", category: "jobs", detail: "Headline unemployment — currently ~3.8%" },

  // Week of May 11
  { date: "2026-05-13", timeET: "8:30 AM", timeIST: "6:00 PM", event: "CPI (Apr)", impact: "high", category: "inflation", detail: "Consumer Price Index — headline + core. Most watched inflation number." },
  { date: "2026-05-14", timeET: "8:30 AM", timeIST: "6:00 PM", event: "PPI (Apr)", impact: "high", category: "inflation", detail: "Producer Price Index — upstream inflation pressure" },
  { date: "2026-05-15", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Retail Sales (Apr)", impact: "high", category: "consumer", detail: "Consumer spending — core retail ex-autos is the key metric" },
  { date: "2026-05-15", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Initial Jobless Claims", impact: "medium", category: "jobs", detail: "Weekly unemployment filings" },

  // Week of May 18
  { date: "2026-05-20", timeET: "2:00 PM", timeIST: "11:30 PM", event: "FOMC Meeting Minutes (May)", impact: "high", category: "fed", detail: "Detailed discussion from May FOMC — watch for dissent and rate path debate" },
  { date: "2026-05-22", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Initial Jobless Claims", impact: "medium", category: "jobs", detail: "Weekly unemployment filings" },
  { date: "2026-05-22", timeET: "9:45 AM", timeIST: "7:15 PM", event: "S&P Global PMI Flash (May)", impact: "high", category: "manufacturing", detail: "Flash PMI — first look at May economic activity" },

  // Week of May 25 (Memorial Day)
  { date: "2026-05-26", timeET: "—", timeIST: "—", event: "Memorial Day — Markets Closed", impact: "low", category: "consumer", detail: "US markets closed for Memorial Day" },
  { date: "2026-05-27", timeET: "10:00 AM", timeIST: "7:30 PM", event: "Consumer Confidence (May)", impact: "high", category: "consumer", detail: "Conference Board consumer confidence index" },
  { date: "2026-05-28", timeET: "8:30 AM", timeIST: "6:00 PM", event: "GDP Q1 2026 (2nd Estimate)", impact: "high", category: "gdp", detail: "Revised Q1 GDP — corrections from advance estimate" },
  { date: "2026-05-29", timeET: "8:30 AM", timeIST: "6:00 PM", event: "PCE Price Index (Apr)", impact: "high", category: "inflation", detail: "Fed's preferred inflation measure — Core PCE is the magic number" },

  // ══════ JUNE 2026 ══════
  // Week of June 1
  { date: "2026-06-01", timeET: "10:00 AM", timeIST: "7:30 PM", event: "ISM Manufacturing PMI (May)", impact: "high", category: "manufacturing", detail: "Factory sector pulse — above 50 = expansion" },
  { date: "2026-06-03", timeET: "10:00 AM", timeIST: "7:30 PM", event: "ISM Services PMI (May)", impact: "high", category: "manufacturing", detail: "Services sector health — majority of US GDP" },

  // NFP Week
  { date: "2026-06-05", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Non-Farm Payrolls (May)", impact: "high", category: "jobs", detail: "Monthly jobs report — payrolls + unemployment + wages" },

  // Week of June 8
  { date: "2026-06-10", timeET: "8:30 AM", timeIST: "6:00 PM", event: "CPI (May)", impact: "high", category: "inflation", detail: "Consumer Price Index — headline + core inflation" },
  { date: "2026-06-11", timeET: "8:30 AM", timeIST: "6:00 PM", event: "PPI (May)", impact: "high", category: "inflation", detail: "Producer prices — upstream inflation" },

  // FOMC Meeting
  { date: "2026-06-16", timeET: "2:00 PM", timeIST: "11:30 PM", event: "FOMC Rate Decision", impact: "high", category: "fed", detail: "Fed rate decision + updated dot plot + economic projections (SEP)" },
  { date: "2026-06-16", timeET: "2:30 PM", timeIST: "12:00 AM+1", event: "Fed Chair Powell Press Conference", impact: "high", category: "fed", detail: "Powell press conference — dot plot Q&A, rate path forward guidance" },
  { date: "2026-06-17", timeET: "8:30 AM", timeIST: "6:00 PM", event: "Retail Sales (May)", impact: "high", category: "consumer", detail: "Consumer spending data" },

  // Week of June 22
  { date: "2026-06-23", timeET: "9:45 AM", timeIST: "7:15 PM", event: "S&P Global PMI Flash (Jun)", impact: "high", category: "manufacturing", detail: "Flash PMI — first look at June activity" },
  { date: "2026-06-25", timeET: "8:30 AM", timeIST: "6:00 PM", event: "GDP Q1 2026 (Final)", impact: "high", category: "gdp", detail: "Final Q1 GDP reading — usually close to 2nd estimate" },
  { date: "2026-06-26", timeET: "8:30 AM", timeIST: "6:00 PM", event: "PCE Price Index (May)", impact: "high", category: "inflation", detail: "Core PCE — the Fed's North Star for inflation targeting" },
  { date: "2026-06-30", timeET: "10:00 AM", timeIST: "7:30 PM", event: "Consumer Confidence (Jun)", impact: "high", category: "consumer", detail: "End-of-quarter confidence reading" },
];

export function getUpcomingEvents(daysAhead: number = 90): ScheduledEvent[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  return Q2_2026_CALENDAR.filter(e => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
}

export function getEventsForWeek(weekStart: Date): ScheduledEvent[] {
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  return Q2_2026_CALENDAR.filter(e => {
    const d = new Date(e.date);
    return d >= weekStart && d < weekEnd;
  });
}

export const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  fed: { emoji: "🏛️", color: "var(--event-fed)", label: "Federal Reserve" },
  jobs: { emoji: "👷", color: "var(--bull)", label: "Employment" },
  inflation: { emoji: "🔥", color: "var(--bear)", label: "Inflation" },
  gdp: { emoji: "📊", color: "var(--bazaar-gold)", label: "GDP" },
  housing: { emoji: "🏠", color: "var(--sector-ev)", label: "Housing" },
  manufacturing: { emoji: "🏭", color: "var(--sector-tech)", label: "Manufacturing" },
  consumer: { emoji: "🛒", color: "var(--sector-growth)", label: "Consumer" },
};
