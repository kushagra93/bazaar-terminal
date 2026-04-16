"use client";

import { useState, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { StockLogo } from "@/components/StockLogo";
import { useLanguage } from "@/lib/language";
import { useSignals } from "@/lib/data";
import { ArrowUp, ArrowDown, RefreshCw, Activity } from "lucide-react";

const INDICATOR_ICONS: Record<string, string> = {
  bullish: "🟢", bearish: "🔴", neutral: "⚪",
};

const SECTOR_COLORS: Record<string, string> = {
  tech: "var(--sector-tech)", ev: "var(--sector-ev)", fintech: "var(--sector-fintech)",
  meme: "var(--sector-meme)", growth: "var(--sector-growth)", commodity: "var(--bazaar-amber)",
};

function ConfidenceBar({ confidence }: { confidence: number }) {
  const filled = Math.round(confidence / 5);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-[6px] h-3 rounded-sm" style={{
            background: i < filled ? (filled > 14 ? "var(--bull)" : filled > 10 ? "var(--bazaar-gold)" : "var(--neutral)") : "var(--border-dim)",
          }} />
        ))}
      </div>
      <span className="font-data text-sm font-bold">{confidence}%</span>
    </div>
  );
}

function IndicatorRow({ ind }: { ind: { name: string; value: string; signal: string } }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-dim)] last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-xs">{INDICATOR_ICONS[ind.signal] || "⚪"}</span>
        <span className="font-body text-xs text-[var(--text-secondary)]">{ind.name}</span>
      </div>
      <span className="font-data text-xs text-[var(--text-primary)]">{ind.value}</span>
    </div>
  );
}

function SignalCard({ signal }: { signal: any }) {
  const [showIndicators, setShowIndicators] = useState(false);
  const cardBorder = signal.type === "LONG" ? "card--bull" : signal.type === "SHORT" ? "card--bear" : "card--squeeze";
  const dirColor = signal.type === "LONG" ? "var(--bull)" : signal.type === "SHORT" ? "var(--bear)" : "var(--squeeze)";
  const dirArrow = signal.type === "LONG" ? "↑" : signal.type === "SHORT" ? "↓" : "◆";
  const label = signal.type === "LONG" ? "Bullish Signal" : signal.type === "SHORT" ? "Bearish Signal" : "Watch Closely";
  const sectorColor = SECTOR_COLORS[signal.sector] || "var(--neutral)";

  return (
    <div className={`card ${cardBorder} p-5 animate-[fade-up_0.3s_ease]`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <StockLogo symbol={signal.symbol} size={32} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-body text-lg font-bold">{signal.symbol}</span>
              <span className="text-[8px] font-body font-semibold uppercase px-1.5 py-0.5 rounded" style={{ color: sectorColor, background: `${sectorColor}15` }}>{signal.sector}</span>
            </div>
            <span className="text-[10px] font-body text-[var(--text-secondary)]">{signal.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-data text-sm"><Price usd={signal.price} /></div>
          <span className={`font-data text-[10px] font-medium ${signal.change1h >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}`}>
            {signal.change1h >= 0 ? "+" : ""}{signal.change1h.toFixed(2)}% 1h
          </span>
        </div>
      </div>

      {/* Signal type */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-2xl" style={{ color: dirColor }}>{dirArrow}</span>
        <span className="font-display text-lg font-bold uppercase" style={{ color: dirColor }}>{label}</span>
        <span className="ml-auto text-[10px] font-data text-[var(--text-dim)]">{signal.timeframe}</span>
      </div>

      {/* Confidence */}
      <div className="mt-2"><ConfidenceBar confidence={signal.confidence} /></div>

      {/* Reasons */}
      <div className="mt-3 space-y-1.5">
        {signal.reasons.map((r: string, i: number) => (
          <div key={i} className="text-xs font-body text-[var(--text-secondary)] flex items-start gap-2">
            <span className="text-[var(--bazaar-gold)] mt-0.5">•</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* Entry / SL / Target — only show for directional signals */}
      {signal.type !== "WATCH" ? (
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center">
            <div className="font-body text-[var(--text-dim)] text-[9px]">Entry</div>
            <div className="font-data text-[var(--text-primary)] mt-0.5"><Price usd={signal.entry} /></div>
          </div>
          <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center">
            <div className="font-body text-[var(--text-dim)] text-[9px]">Stop Loss</div>
            <div className="font-data text-[var(--bear)] mt-0.5"><Price usd={signal.stopLoss} /></div>
          </div>
          <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center">
            <div className="font-body text-[var(--text-dim)] text-[9px]">Target</div>
            <div className="font-data text-[var(--bull)] mt-0.5"><Price usd={signal.target} /></div>
          </div>
          <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center">
            <div className="font-body text-[var(--text-dim)] text-[9px]">R:R</div>
            <div className="font-data text-[var(--bazaar-gold)] mt-0.5">{signal.riskReward}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-[var(--bg-base)] rounded-lg p-3 text-center">
          <div className="text-xs font-body text-[var(--text-dim)]">No entry levels — wait for directional confirmation</div>
          <div className="font-data text-xs text-[var(--text-secondary)] mt-1">Current: <Price usd={signal.price} /></div>
        </div>
      )}

      {/* Indicator details toggle */}
      <button onClick={() => setShowIndicators(!showIndicators)}
        className="mt-3 w-full text-[10px] font-body text-[var(--text-secondary)] hover:text-[var(--bazaar-gold)] transition py-1 border-t border-[var(--border-dim)]">
        {showIndicators ? "Hide" : "Show"} 6 indicator details ▾
      </button>

      {showIndicators && (
        <div className="mt-1 bg-[var(--bg-base)] rounded-lg p-3">
          {signal.indicators.map((ind: any, i: number) => <IndicatorRow key={i} ind={ind} />)}
        </div>
      )}
    </div>
  );
}

export default function SignalsPage() {
  const { signals, loading } = useSignals();
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return signals;
    return signals.filter((s: any) => s.type === typeFilter);
  }, [signals, typeFilter]);

  const bullCount = signals.filter((s: any) => s.type === "LONG").length;
  const bearCount = signals.filter((s: any) => s.type === "SHORT").length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Signals</h1>
          <p className="text-xs font-body text-[var(--text-secondary)] mt-0.5">
            Computed from RSI, MACD, EMA Cross, Bollinger Bands, Supertrend, Volume — live 1H candles from Coinbase International
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-xs text-[var(--bull)]">{bullCount} Bullish</span>
          <span className="font-data text-xs text-[var(--bear)]">{bearCount} Bearish</span>
          <span className="font-data text-xs text-[var(--text-secondary)]">{signals.length - bullCount - bearCount} Watch</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "LONG", "SHORT", "WATCH"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-xs font-body font-medium uppercase tracking-wider border transition ${
              typeFilter === t ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)] border-[var(--border-dim)]"
            }`}
          >{t === "all" ? "All Signals" : t}</button>
        ))}
      </div>

      {/* Signal grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Activity size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-body text-[var(--text-secondary)]">No {typeFilter !== "all" ? typeFilter : ""} signals — waiting for candle data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s: any) => <SignalCard key={s.symbol} signal={s} />)}
        </div>
      )}

      {/* Methodology */}
      <div className="card p-4">
        <div className="text-[10px] font-body text-[var(--text-secondary)] uppercase tracking-wider mb-2">Signal Methodology — Based on Top TradingView PineScripts</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-[10px] font-body text-[var(--text-dim)]">
          <div><span className="text-[var(--text-primary)] font-medium">RSI (14)</span><br/>Oversold &lt;30 = Bullish<br/>Overbought &gt;70 = Bearish</div>
          <div><span className="text-[var(--text-primary)] font-medium">MACD (12,26,9)</span><br/>Histogram crossover<br/>Momentum direction</div>
          <div><span className="text-[var(--text-primary)] font-medium">EMA Cross (9/21)</span><br/>Golden cross = Bullish<br/>Death cross = Bearish</div>
          <div><span className="text-[var(--text-primary)] font-medium">Bollinger (20,2)</span><br/>Below lower = Buy<br/>Above upper = Sell</div>
          <div><span className="text-[var(--text-primary)] font-medium">Supertrend (10,3)</span><br/>Direction flip = Entry<br/>Trend following</div>
          <div><span className="text-[var(--text-primary)] font-medium">Volume Spike</span><br/>&gt;2x avg = Confirm<br/>Smart money signal</div>
        </div>
      </div>
    </div>
  );
}
