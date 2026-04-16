import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Signal Engine — computes signals from real OHLCV candle data
 * using the same indicators as the top TradingView PineScripts:
 *
 * 1. RSI (14) — Oversold/Overbought
 * 2. MACD (12, 26, 9) — Momentum crossover
 * 3. EMA Cross (9/21) — Trend direction
 * 4. Bollinger Bands (20, 2) — Volatility breakout/squeeze
 * 5. Supertrend (10, 3) — Trend following
 * 6. Volume Spike — Unusual activity
 */

const STOCK_PERPS = [
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "HOOD", "MSTR", "GLD",
];

const NAMES: Record<string, string> = {
  TSLA: "Tesla Inc.", NVDA: "NVIDIA Corp.", AAPL: "Apple Inc.", MSFT: "Microsoft Corp.",
  AMZN: "Amazon.com", META: "Meta Platforms", GOOGL: "Alphabet Inc.", HOOD: "Robinhood",
  MSTR: "MicroStrategy", GLD: "SPDR Gold",
};

const SECTORS: Record<string, string> = {
  TSLA: "ev", NVDA: "tech", AAPL: "tech", MSFT: "tech", AMZN: "growth",
  META: "tech", GOOGL: "tech", HOOD: "fintech", MSTR: "fintech", GLD: "commodity",
};

interface Candle { t: number; o: number; h: number; l: number; c: number; v: number; }

// ── Fetch real candles from Coinbase International ──
async function fetchCandles(symbol: string, count: number = 100): Promise<Candle[]> {
  const end = new Date();
  const start = new Date(end.getTime() - count * 3600000); // 1h candles
  try {
    const res = await fetch(
      `https://api.international.coinbase.com/api/v1/instruments/${symbol}-PERP/candles?granularity=ONE_HOUR&start=${start.toISOString()}&end=${end.toISOString()}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.aggregations || [])
      .map((c: any) => ({
        t: new Date(c.start).getTime(),
        o: parseFloat(c.open),
        h: parseFloat(c.high),
        l: parseFloat(c.low),
        c: parseFloat(c.close),
        v: parseFloat(c.volume),
      }))
      .reverse(); // oldest first
  } catch { return []; }
}

// ── Indicator calculations (same math as PineScript) ──

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(NaN); continue; }
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

function rsi(closes: number[], period: number = 14): number[] {
  const gains: number[] = [0];
  const losses: number[] = [0];
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  const avgGain = ema(gains, period);
  const avgLoss = ema(losses, period);
  return avgGain.map((g, i) => {
    if (avgLoss[i] === 0) return 100;
    const rs = g / avgLoss[i];
    return 100 - 100 / (1 + rs);
  });
}

function macd(closes: number[]): { line: number[]; signal: number[]; hist: number[] } {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const line = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(line, 9);
  const hist = line.map((v, i) => v - signal[i]);
  return { line, signal, hist };
}

function bollingerBands(closes: number[], period: number = 20, mult: number = 2) {
  const mid = sma(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { upper.push(NaN); lower.push(NaN); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - mid[i]) ** 2, 0) / period);
    upper.push(mid[i] + mult * std);
    lower.push(mid[i] - mult * std);
  }
  return { upper, mid, lower };
}

function supertrend(candles: Candle[], period: number = 10, mult: number = 3) {
  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);

  // ATR
  const tr: number[] = [highs[0] - lows[0]];
  for (let i = 1; i < candles.length; i++) {
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  const atr = sma(tr, period);

  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  const direction: number[] = []; // 1 = up (bullish), -1 = down (bearish)

  for (let i = 0; i < candles.length; i++) {
    const hl2 = (highs[i] + lows[i]) / 2;
    const ub = hl2 + mult * (atr[i] || 0);
    const lb = hl2 - mult * (atr[i] || 0);

    if (i === 0) {
      upperBand.push(ub);
      lowerBand.push(lb);
      direction.push(1);
    } else {
      upperBand.push(ub < upperBand[i - 1] || closes[i - 1] > upperBand[i - 1] ? ub : upperBand[i - 1]);
      lowerBand.push(lb > lowerBand[i - 1] || closes[i - 1] < lowerBand[i - 1] ? lb : lowerBand[i - 1]);

      if (direction[i - 1] === -1 && closes[i] > upperBand[i]) {
        direction.push(1);
      } else if (direction[i - 1] === 1 && closes[i] < lowerBand[i]) {
        direction.push(-1);
      } else {
        direction.push(direction[i - 1]);
      }
    }
  }
  return direction;
}

// ── Signal Generator ──

interface Signal {
  symbol: string;
  name: string;
  sector: string;
  type: "LONG" | "SHORT" | "WATCH";
  confidence: number;
  price: number;
  change1h: number;
  indicators: {
    name: string;
    value: string;
    signal: "bullish" | "bearish" | "neutral";
  }[];
  entry: number;
  stopLoss: number;
  target: number;
  riskReward: string;
  reasons: string[];
  timeframe: string;
  generatedAt: string;
}

function generateSignal(symbol: string, candles: Candle[]): Signal | null {
  if (candles.length < 30) return null;

  const closes = candles.map(c => c.c);
  const volumes = candles.map(c => c.v);
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];

  // Compute all indicators
  const rsiValues = rsi(closes);
  const rsiNow = rsiValues[rsiValues.length - 1];
  const rsiPrev = rsiValues[rsiValues.length - 2];

  const macdData = macd(closes);
  const macdHist = macdData.hist[macdData.hist.length - 1];
  const macdHistPrev = macdData.hist[macdData.hist.length - 2];

  const ema9 = ema(closes, 9);
  const ema21 = ema(closes, 21);
  const ema9Now = ema9[ema9.length - 1];
  const ema21Now = ema21[ema21.length - 1];
  const ema9Prev = ema9[ema9.length - 2];
  const ema21Prev = ema21[ema21.length - 2];

  const bb = bollingerBands(closes);
  const bbUpper = bb.upper[bb.upper.length - 1];
  const bbLower = bb.lower[bb.lower.length - 1];
  const bbMid = bb.mid[bb.mid.length - 1];
  const bbWidth = bbUpper && bbLower && bbMid ? (bbUpper - bbLower) / bbMid : 0;

  const stDir = supertrend(candles);
  const supertrendNow = stDir[stDir.length - 1];
  const supertrendPrev = stDir[stDir.length - 2];

  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volNow = volumes[volumes.length - 1];
  const volSpike = avgVol > 0 ? volNow / avgVol : 1;

  const change1h = prev ? ((last - prev) / prev) * 100 : 0;

  // Score each indicator
  let score = 0;
  const indicators: Signal["indicators"] = [];
  const reasons: string[] = [];

  // 1. RSI (14)
  const rsiSignal = rsiNow < 30 ? "bullish" : rsiNow > 70 ? "bearish" : "neutral";
  indicators.push({ name: "RSI (14)", value: rsiNow.toFixed(1), signal: rsiSignal });
  if (rsiNow < 30) { score += 2; reasons.push("RSI oversold — bounce likely"); }
  else if (rsiNow < 40) { score += 0.5; }
  else if (rsiNow > 70) { score -= 2; reasons.push("RSI overbought — pullback risk"); }
  else if (rsiNow > 60) { score -= 0.5; }

  // 2. MACD Crossover
  const macdCross = macdHist > 0 && macdHistPrev <= 0 ? "bullish" : macdHist < 0 && macdHistPrev >= 0 ? "bearish" : "neutral";
  indicators.push({ name: "MACD (12,26,9)", value: macdHist.toFixed(4), signal: macdCross });
  if (macdCross === "bullish") { score += 2; reasons.push("MACD bullish crossover — momentum shifting up"); }
  else if (macdCross === "bearish") { score -= 2; reasons.push("MACD bearish crossover — momentum fading"); }
  else if (macdHist > 0) { score += 0.5; }
  else { score -= 0.5; }

  // 3. EMA Cross (9/21)
  const emaCross = ema9Now > ema21Now && ema9Prev <= ema21Prev ? "bullish" : ema9Now < ema21Now && ema9Prev >= ema21Prev ? "bearish" : ema9Now > ema21Now ? "bullish" : "bearish";
  indicators.push({ name: "EMA Cross (9/21)", value: `${ema9Now.toFixed(2)} / ${ema21Now.toFixed(2)}`, signal: emaCross });
  if (ema9Now > ema21Now && ema9Prev <= ema21Prev) { score += 2; reasons.push("EMA 9 crossed above 21 — golden cross"); }
  else if (ema9Now < ema21Now && ema9Prev >= ema21Prev) { score -= 2; reasons.push("EMA 9 crossed below 21 — death cross"); }
  else if (ema9Now > ema21Now) { score += 0.5; }
  else { score -= 0.5; }

  // 4. Bollinger Bands
  const bbSignal = last > bbUpper ? "bearish" : last < bbLower ? "bullish" : "neutral";
  indicators.push({ name: "Bollinger (20,2)", value: `Width: ${(bbWidth * 100).toFixed(2)}%`, signal: bbSignal });
  if (last < bbLower) { score += 1.5; reasons.push("Price below lower Bollinger Band — mean reversion setup"); }
  else if (last > bbUpper) { score -= 1.5; reasons.push("Price above upper Bollinger Band — extended, reversal risk"); }
  if (bbWidth < 0.03) { reasons.push("Bollinger squeeze — breakout imminent"); }

  // 5. Supertrend
  const stSignal = supertrendNow === 1 ? "bullish" : "bearish";
  indicators.push({ name: "Supertrend (10,3)", value: supertrendNow === 1 ? "Bullish" : "Bearish", signal: stSignal });
  if (supertrendNow === 1 && supertrendPrev === -1) { score += 2; reasons.push("Supertrend flipped bullish — trend reversal"); }
  else if (supertrendNow === -1 && supertrendPrev === 1) { score -= 2; reasons.push("Supertrend flipped bearish — downtrend starting"); }
  else if (supertrendNow === 1) { score += 0.5; }
  else { score -= 0.5; }

  // 6. Volume
  const volSignal = volSpike > 2 ? (change1h > 0 ? "bullish" : "bearish") : "neutral";
  indicators.push({ name: "Volume Spike", value: `${volSpike.toFixed(1)}x avg`, signal: volSignal });
  if (volSpike > 2) {
    if (change1h > 0) { score += 1; reasons.push(`Volume ${volSpike.toFixed(1)}x above average — smart money buying`); }
    else { score -= 1; reasons.push(`Volume ${volSpike.toFixed(1)}x above average — heavy selling pressure`); }
  }

  // Determine signal type
  const confidence = Math.min(95, Math.abs(score) * 10 + 35);
  const type: Signal["type"] = score > 2 ? "LONG" : score < -2 ? "SHORT" : "WATCH";

  // Calculate entry/SL/target
  const atrVal = Math.abs(candles[candles.length - 1].h - candles[candles.length - 1].l);
  const entry = last;
  const stopLoss = type === "LONG" ? last - 2 * atrVal : type === "SHORT" ? last + 2 * atrVal : last;
  const target = type === "LONG" ? last + 3 * atrVal : type === "SHORT" ? last - 3 * atrVal : last;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  const rr = risk > 0 ? `1:${(reward / risk).toFixed(1)}` : "1:1";

  if (reasons.length === 0) reasons.push("No strong directional signals — hold or reduce size");

  return {
    symbol,
    name: NAMES[symbol] || symbol,
    sector: SECTORS[symbol] || "growth",
    type,
    confidence: Math.round(confidence),
    price: last,
    change1h,
    indicators,
    entry,
    stopLoss,
    target,
    riskReward: rr,
    reasons,
    timeframe: "1H",
    generatedAt: new Date().toISOString(),
  };
}

let cache: { data: Signal[]; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 60_000) {
    return NextResponse.json(cache.data);
  }

  // Fetch candles for all stock perps in parallel
  const candlePromises = STOCK_PERPS.map(async (sym) => {
    const candles = await fetchCandles(sym, 80);
    return { sym, candles };
  });

  const results = await Promise.allSettled(candlePromises);
  const signals: Signal[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.candles.length >= 30) {
      const signal = generateSignal(result.value.sym, result.value.candles);
      if (signal) signals.push(signal);
    }
  }

  // Sort: strongest signals first
  signals.sort((a, b) => b.confidence - a.confidence);

  cache = { data: signals, ts: Date.now() };
  return NextResponse.json(signals);
}
