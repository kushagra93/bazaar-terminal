"use client";

import { useState, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useStocks, CONTEXT_SYMBOLS, SECTOR_MAP } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

type SortKey = "symbol" | "price" | "change24h" | "openInterest" | "volume24h" | "fundingRate";

const SECTOR_COLORS: Record<string, string> = {
  tech: "var(--sector-tech)", ev: "var(--sector-ev)", fintech: "var(--sector-fintech)",
  meme: "var(--sector-meme)", growth: "var(--sector-growth)", index: "var(--bazaar-gold)", commodity: "var(--bazaar-amber)",
};

function FundingCell({ rate, extreme }: { rate: number; extreme?: boolean }) {
  if (!rate) return <span className="text-[var(--text-secondary)] font-data text-xs">—</span>;
  const pct = rate * 100;
  const color = pct > 0 ? "var(--bull)" : "var(--bear)";
  return (
    <div className="text-right">
      <div className="font-data text-xs flex items-center gap-1 justify-end" style={{ color }}>
        {extreme && <span className="text-[var(--squeeze)]" title={`Extreme: ${(Math.abs(pct) * 3 * 365).toFixed(0)}% annualized`}>⚠</span>}
        {pct > 0 ? "+" : ""}{pct.toFixed(4)}%
      </div>
      <div className="mt-1 h-1 w-12 bg-[var(--bg-base)] rounded-full overflow-hidden ml-auto">
        <div className={`h-full rounded-full ${extreme ? "animate-[squeeze-pulse_2s_ease_infinite]" : ""}`}
          style={{ width: `${Math.min(Math.abs(pct) * 100, 100)}%`, background: extreme ? "var(--squeeze)" : color }} />
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const { format } = useCurrency();
  const { stocks, loading, lastUpdated } = useStocks(10_000);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume24h");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const context = useMemo(() => stocks.filter((s: any) => CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);
  const allRanked = useMemo(() => stocks.filter((s: any) => !CONTEXT_SYMBOLS.includes(s.symbol)), [stocks]);

  const filtered = useMemo(() => {
    let list = [...allRanked];
    if (sectorFilter !== "all") {
      const syms = SECTOR_MAP[sectorFilter] || [];
      list = list.filter((s: any) => syms.includes(s.symbol));
    }
    if (search) {
      const q = search.toUpperCase();
      list = list.filter((s: any) => s.symbol.includes(q) || (s.name || "").toUpperCase().includes(q));
    }
    list.sort((a: any, b: any) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [allRanked, search, sectorFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === "desc" ? <ArrowDown size={10} className="gold" /> : <ArrowUp size={10} className="gold" />) : <ArrowUpDown size={10} style={{ opacity: 0.3 }} />;

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <h1 className="font-display text-2xl font-bold">Markets</h1>

      {/* Context — SPY/QQQ */}
      <div className="flex gap-3">
        {context.map((s: any) => (
          <div key={s.symbol} className="card p-4 flex-1">
            <div className="text-[10px] font-body text-[var(--text-secondary)] uppercase tracking-wider">{s.name}</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-display text-xl font-bold"><Price usd={s.price} /></span>
              <span className={`font-data text-sm font-medium px-2 py-0.5 rounded-full ${s.change24h >= 0 ? "text-[var(--bull)] bg-[var(--bull-dim)]" : "text-[var(--bear)] bg-[var(--bear-dim)]"}`}>
                {s.change24h >= 0 ? "+" : ""}{s.change24h?.toFixed(2)}%
              </span>
            </div>
            {s.sources && <div className="text-[9px] font-data text-[var(--text-dim)] mt-1">{s.sources.join(" + ")}</div>}
          </div>
        ))}
        {context.length === 0 && !loading && <div className="text-sm text-[var(--text-secondary)]">SPY/QQQ not available on current exchanges</div>}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {["all", "tech", "ev", "fintech", "meme", "growth"].map(sec => (
          <button key={sec} onClick={() => setSectorFilter(sec)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium uppercase tracking-wider transition border ${
              sectorFilter === sec ? "text-[var(--bazaar-gold)] border-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)] border-[var(--border-dim)]"
            }`}>{sec === "all" ? "All Sectors" : sec}</button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-dim)] text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--border-active)] w-48" />
        </div>
        <span className="text-xs font-data text-[var(--text-secondary)]">
          {filtered.length} stocks
          {lastUpdated && <span className="text-[var(--text-dim)] ml-2">· {Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago</span>}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-dim)]" style={{ background: "var(--bg-overlay)" }}>
                <th className="px-4 py-3 text-left text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider w-10">#</th>
                <th onClick={() => handleSort("symbol")} className="px-4 py-3 text-left text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none w-44"><span className="inline-flex items-center gap-1">Stock <SortIcon col="symbol" /></span></th>
                <th onClick={() => handleSort("price")} className="px-4 py-3 text-right text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none"><span className="inline-flex items-center gap-1">Price <SortIcon col="price" /></span></th>
                <th onClick={() => handleSort("change24h")} className="px-4 py-3 text-right text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none"><span className="inline-flex items-center gap-1">24H % <SortIcon col="change24h" /></span></th>
                <th onClick={() => handleSort("openInterest")} className="px-4 py-3 text-right text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none"><span className="inline-flex items-center gap-1">OI <SortIcon col="openInterest" /></span></th>
                <th onClick={() => handleSort("volume24h")} className="px-4 py-3 text-right text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none"><span className="inline-flex items-center gap-1">Vol 24H <SortIcon col="volume24h" /></span></th>
                <th onClick={() => handleSort("fundingRate")} className="px-4 py-3 text-right text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none"><span className="inline-flex items-center gap-1">Funding <SortIcon col="fundingRate" /></span></th>
                <th className="px-4 py-3 text-center text-[10px] font-body font-medium text-[var(--text-secondary)] uppercase tracking-wider">Sources</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-dim)]"><td colSpan={8} className="px-4 py-3"><div className="h-5 rounded shimmer" /></td></tr>
              )) : filtered.map((s: any, i: number) => {
                const sectorColor = SECTOR_COLORS[s.sector] || "var(--neutral)";
                return (
                  <tr key={s.symbol} className="table-row border-b border-[var(--border-dim)] hover:bg-[var(--bg-elevated)] hover:border-l-[3px] hover:border-l-[var(--bazaar-gold)] transition cursor-pointer" style={{ height: 56 }}>
                    <td className="px-4 font-data text-xs text-[var(--text-dim)]">{i + 1}</td>
                    <td className="px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={s.symbol} size={28} />
                        <div>
                          <div className="font-body text-sm font-semibold text-[var(--text-primary)]">{s.symbol}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-body text-[var(--text-secondary)]">{s.name}</span>
                            <span className="text-[8px] font-body font-semibold uppercase px-1 py-0.5 rounded" style={{ color: sectorColor, background: `${sectorColor}15` }}>{s.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-right">
                      <div className="text-sm text-[var(--text-data)]"><Price usd={s.price} /></div>
                      {s.stockPrice > 0 && s.price !== s.stockPrice && (
                        <div className="text-[9px] font-data text-[var(--text-dim)]">
                          Stock: <Price usd={s.stockPrice} />
                          {s.spread !== 0 && <span className={s.spread > 0 ? "text-[var(--bull)] ml-1" : "text-[var(--bear)] ml-1"}>
                            {s.spread > 0 ? "+" : ""}{s.spread.toFixed(2)}%
                          </span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-data text-xs font-medium ${(s.stockChange || s.change24h || 0) >= 0 ? "text-[var(--bull)] bg-[var(--bull-dim)]" : "text-[var(--bear)] bg-[var(--bear-dim)]"}`}>
                        {(s.stockChange || s.change24h || 0) >= 0 ? "+" : ""}{(s.stockChange || s.change24h || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 text-right text-xs text-[var(--text-data)]">{s.openInterest ? <Price usd={s.openInterest} /> : <span className="text-[var(--text-dim)]">—</span>}</td>
                    <td className="px-4 text-right text-xs text-[var(--text-data)]">{s.volume24h ? <Price usd={s.volume24h} /> : <span className="text-[var(--text-dim)]">—</span>}</td>
                    <td className="px-4"><FundingCell rate={s.fundingRate} extreme={s.fundingExtreme} /></td>
                    <td className="px-4 text-center">
                      <div className="flex gap-1 justify-center">
                        {(s.sources || []).map((src: string) => (
                          <span key={src} className="text-[8px] font-data px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{src}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
