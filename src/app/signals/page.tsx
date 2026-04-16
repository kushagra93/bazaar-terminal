"use client";

import { useState, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { useSignals, useSocial } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { t as translate } from "@/config/i18n";

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color = confidence > 70 ? "var(--primary)" : confidence > 50 ? "var(--tertiary)" : "var(--outline)";
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-1.5 bg-[var(--surface-highest)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${confidence}%`, background: color, boxShadow: confidence > 70 ? `0 0 8px ${color}` : "none" }} />
      </div>
      <span className="font-data text-sm font-bold" style={{ color }}>{confidence}%</span>
    </div>
  );
}

export default function SignalsPage() {
  const { signals, loading } = useSignals();
  const { social } = useSocial();
  const { lang, t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return signals;
    return signals.filter((s: any) => s.type === typeFilter);
  }, [signals, typeFilter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const posts = social?.posts?.slice(0, 5) || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary-dim)] rounded-full font-data text-xs tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary-dim)] animate-pulse" /> Live Transmission
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter">{t("signals.title")}</h1>
        <p className="text-[var(--on-surface-variant)] mt-3 max-w-2xl leading-relaxed">
          {t("signals.algo_scanning")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {["all", "LONG", "SHORT", "WATCH"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-6 py-2.5 rounded-full font-data text-xs font-bold uppercase tracking-widest whitespace-nowrap transition ${
              typeFilter === t
                ? "bg-[var(--primary)] text-[#006532]"
                : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            }`}
          >{t === "all" ? "All Intelligence" : t}</button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Featured Signal (large) */}
        {featured && (
          <div className="md:col-span-8 bg-[var(--surface-container)] rounded-[1.5rem] p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <StockLogo symbol={featured.symbol} size={48} />
                <div>
                  <h3 className="font-display text-2xl font-bold">{featured.symbol}</h3>
                  <span className="font-data text-sm text-[var(--outline)]"><Price usd={featured.price} /></span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-data text-xl font-bold ${(featured.change1h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                  {(featured.change1h || 0) >= 0 ? "+" : ""}{(featured.change1h || 0).toFixed(2)}%
                </span>
                <p className="font-data text-[10px] text-[var(--outline)] uppercase tracking-widest">1h Change</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-lg font-data text-[10px] uppercase font-bold tracking-widest ${
                featured.type === "LONG" ? "bg-[var(--primary)]/10 text-[var(--primary-dim)] border border-[var(--primary)]/20"
                : featured.type === "SHORT" ? "bg-[var(--secondary)]/10 text-[var(--secondary)] border border-[var(--secondary)]/20"
                : "bg-[var(--tertiary)]/10 text-[var(--tertiary)] border border-[var(--tertiary)]/20"
              }`}>
                {featured.type === "LONG" ? "Bullish Signal" : featured.type === "SHORT" ? "Bearish Signal" : "Watch Closely"} ({featured.confidence}%)
              </span>
              <span className="px-4 py-1.5 bg-[var(--surface-highest)] rounded-lg font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)]">
                {featured.timeframe} Timeframe
              </span>
            </div>

            <h4 className="font-display text-2xl md:text-3xl font-extrabold leading-tight mb-4">
              {featured.reasons?.[0] || `${featured.type} signal detected on ${featured.symbol}`}
            </h4>
            {featured.reasons?.slice(1).map((r: string, i: number) => (
              <p key={i} className="text-[var(--on-surface-variant)] leading-relaxed mb-1">• {r}</p>
            ))}

            <ConfidenceBar confidence={featured.confidence} />

            <div className="mt-6 flex items-center justify-between">
              <span className="font-data text-xs text-[var(--outline)] uppercase tracking-widest">
                {new Date(featured.generatedAt).toLocaleTimeString()} IST
              </span>
              {featured.type !== "WATCH" && (
                <div className="flex gap-4 font-data text-xs">
                  <span>Entry: <Price usd={featured.entry} /></span>
                  <span className="text-[var(--secondary)]">SL: <Price usd={featured.stopLoss} /></span>
                  <span className="text-[var(--primary)]">TP: <Price usd={featured.target} /></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentiment Gauge (4 cols) */}
        <div className="md:col-span-4 bg-[var(--surface-low)] rounded-[1.5rem] p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-xl mb-2">Global Sentiment</h3>
            <p className="text-[var(--outline)] text-sm mb-8">Aggregate social score across Reddit feeds.</p>
            <div className="relative h-40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-[10px] border-[var(--surface-highest)] relative">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-[var(--primary)] border-r-transparent border-b-transparent rotate-45" />
              </div>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-display font-black text-[var(--primary)]">{social?.trending?.length || "..."}</span>
                <span className="font-data text-[10px] text-[var(--primary)] uppercase font-bold">Tickers</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center text-xs font-data uppercase tracking-widest">
              <span className="text-[var(--outline)]">Reddit Activity</span>
              <span className="text-[var(--primary-dim)]">{social?.totalPosts || 0} posts</span>
            </div>
            <div className="w-full h-1 bg-[var(--surface-highest)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary-dim)] rounded-full" style={{ width: `${Math.min((social?.totalPosts || 0) * 2, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Signal cards */}
        {rest.map((signal: any) => (
          <div key={signal.symbol} className="md:col-span-4 bg-[var(--surface-container)] rounded-[1.5rem] p-6 hover:bg-[var(--surface-bright)] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <StockLogo symbol={signal.symbol} size={32} />
                <h4 className="font-display font-bold">{signal.symbol}</h4>
              </div>
              <span className={`px-2 py-1 rounded-md font-data text-[9px] uppercase font-bold tracking-widest border ${
                signal.type === "LONG" ? "bg-[var(--primary)]/10 text-[var(--primary-dim)] border-[var(--primary)]/20"
                : signal.type === "SHORT" ? "bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20"
                : "bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20"
              }`}>{signal.type}</span>
            </div>
            <p className="font-display font-semibold text-base mb-3 leading-snug">{signal.reasons?.[0] || "Analyzing..."}</p>
            <ConfidenceBar confidence={signal.confidence} />
            <div className="flex items-center justify-between mt-4 text-[var(--outline)] text-[10px] font-data uppercase tracking-widest">
              <span>{signal.timeframe}</span>
              <span><Price usd={signal.price} /></span>
            </div>
          </div>
        ))}

        {/* Social Stream (full width) */}
        {posts.length > 0 && (
          <div className="md:col-span-12 bg-[var(--surface-container)] rounded-[1.5rem] overflow-hidden">
            <div className="bg-[var(--surface-high)] px-8 py-4 flex justify-between items-center">
              <h3 className="font-data text-xs uppercase font-bold tracking-[0.2em] text-[var(--outline)]">Social Sentiment Real-Time Stream</h3>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary)]" />
              </div>
            </div>
            <div className="p-4 space-y-1">
              {posts.map((post: any) => (
                <a key={post.id} href={post.url} target="_blank" rel="noopener"
                  className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--surface-container)] rounded-xl transition-colors">
                  <span className="font-data text-[var(--outline)] text-[10px] w-16 flex-shrink-0">{new Date(post.created * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={`font-bold text-xs font-data w-16 flex-shrink-0 ${post.sentiment === "bullish" ? "text-[var(--primary-dim)]" : post.sentiment === "bearish" ? "text-[var(--secondary)]" : "text-[var(--on-surface-variant)]"}`}>
                    {post.sentiment?.toUpperCase() || "NEUTRAL"}
                  </span>
                  <span className="text-sm flex-1 truncate">{post.title}</span>
                  <span className="font-data text-[10px] text-[var(--outline)] flex-shrink-0">{post.score > 999 ? `${(post.score/1000).toFixed(1)}k` : post.score}↑</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && <div className="grid grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 shimmer rounded-[1.5rem]" />)}</div>}
    </div>
  );
}
