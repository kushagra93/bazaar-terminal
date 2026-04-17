import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "d7gb999r01qqb8rj0s0gd7gb999r01qqb8rj0s10";

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 120_000) {
    return NextResponse.json(cache.data);
  }

  const result: any = { fearGreed: null, analystRatings: [] };

  try {
    // CNN Fear & Greed Index (stock market, not crypto)
    // We compute a stock-specific Fear/Greed from VIX + market data
    // VIX data from Finnhub (free)
    const vixRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=VIX&token=${FINNHUB_KEY}`);
    let vixValue = 18; // fallback
    if (vixRes.ok) {
      const vixData = await vixRes.json();
      if (vixData.c) vixValue = vixData.c;
    }

    // Convert VIX to Fear/Greed score (inverse relationship)
    // VIX < 12 = Extreme Greed (90+), VIX 12-16 = Greed (70-90)
    // VIX 16-20 = Neutral (40-60), VIX 20-30 = Fear (15-40)
    // VIX > 30 = Extreme Fear (0-15)
    let fgScore: number;
    if (vixValue <= 12) fgScore = 90 + Math.min((12 - vixValue) * 2, 10);
    else if (vixValue <= 16) fgScore = 70 + ((16 - vixValue) / 4) * 20;
    else if (vixValue <= 20) fgScore = 40 + ((20 - vixValue) / 4) * 30;
    else if (vixValue <= 30) fgScore = 15 + ((30 - vixValue) / 10) * 25;
    else fgScore = Math.max(0, 15 - (vixValue - 30));

    fgScore = Math.round(Math.max(0, Math.min(100, fgScore)));
    const fgLabel = fgScore >= 80 ? "Extreme Greed" : fgScore >= 60 ? "Greed" : fgScore >= 40 ? "Neutral" : fgScore >= 20 ? "Fear" : "Extreme Fear";

    // Also fetch actual CNN F&G as backup
    let cnnScore = null;
    try {
      const cnnRes = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata");
      if (cnnRes.ok) {
        const cnnData = await cnnRes.json();
        if (cnnData?.fear_and_greed?.score) {
          cnnScore = Math.round(cnnData.fear_and_greed.score);
        }
      }
    } catch {}

    const finalScore = cnnScore ?? fgScore;
    const finalLabel = finalScore >= 80 ? "Extreme Greed" : finalScore >= 60 ? "Greed" : finalScore >= 40 ? "Neutral" : finalScore >= 20 ? "Fear" : "Extreme Fear";

    result.fearGreed = {
      value: finalScore,
      label: finalLabel,
      vix: vixValue,
      source: cnnScore ? "CNN Fear & Greed" : "VIX-derived",
      history: [], // would need historical data
    };
  } catch {}

  // Analyst recommendations for key stocks
  const stocks = ["TSLA", "NVDA", "AAPL", "MSFT", "META", "AMD", "GOOGL", "COIN", "PLTR", "INTC"];
  for (const sym of stocks) {
    try {
      const recRes = await fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${sym}&token=${FINNHUB_KEY}`);
      if (recRes.ok) {
        const recs = await recRes.json();
        if (recs.length > 0) {
          const latest = recs[0];
          const total = (latest.strongBuy || 0) + (latest.buy || 0) + (latest.hold || 0) + (latest.sell || 0) + (latest.strongSell || 0);
          if (total > 0) {
            result.analystRatings.push({
              symbol: sym,
              bullPct: Math.round(((latest.strongBuy + latest.buy) / total) * 100),
              holdPct: Math.round((latest.hold / total) * 100),
              bearPct: Math.round(((latest.sell + latest.strongSell) / total) * 100),
              period: latest.period,
            });
          }
        }
      }
    } catch {}
  }

  // DeFi Llama — Top protocols by TVL
  try {
    const tvlRes = await fetch("https://api.llama.fi/protocols");
    if (tvlRes.ok) {
      const protocols = await tvlRes.json();
      result.defiTVL = protocols
        .sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0))
        .slice(0, 10)
        .map((p: any) => ({
          name: p.name,
          tvl: p.tvl,
          change1d: p.change_1d,
          category: p.category,
          chain: p.chain,
          logo: p.logo,
        }));
    }
  } catch {}

  cache = { data: result, ts: Date.now() };
  return NextResponse.json(result);
}
