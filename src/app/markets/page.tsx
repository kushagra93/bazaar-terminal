"use client";

import { useState, useMemo } from "react";
import { useCurrency, Price } from "@/lib/currency";
import { useStocks, CONTEXT_SYMBOLS, SECTOR_MAP } from "@/lib/data";
import { StockLogo } from "@/components/StockLogo";

type SortKey = "symbol" | "price" | "change" | "openInterest" | "volume24h" | "fundingRate";

export default function MarketsPage() {
  const { format } = useCurrency();
  const { stocks, loading, lastUpdated } = useStocks(3_000);
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
      const getVal = (s: any) => sortKey === "change" ? (s.stockChange || s.change24h || 0) : sortKey === "price" ? (s.stockPrice || s.price || 0) : (s[sortKey] || 0);
      return sortDir === "desc" ? getVal(b) - getVal(a) : getVal(a) - getVal(b);
    });
    return list;
  }, [allRanked, search, sectorFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* Hero */}
      <div>
        <span className="font-data text-xs text-[var(--primary)] uppercase tracking-[0.3em] font-bold">Market Intelligence</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">MARKETS</h1>
      </div>

      {/* Context cards */}
      <div className="grid grid-cols-2 gap-6">
        {context.map((s: any) => (
          <div key={s.symbol} className="bg-[var(--surface-container)] rounded-xl p-6">
            <p className="font-data text-[10px] text-[var(--on-surface-variant)] tracking-widest mb-1">{s.name}</p>
            <div className="flex items-baseline gap-3">
              <span className="font-data text-3xl font-bold"><Price usd={s.stockPrice || s.price} /></span>
              <span className={`font-data text-sm font-bold ${(s.stockChange || s.change24h || 0) >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                {(s.stockChange || s.change24h || 0) >= 0 ? "+" : ""}{(s.stockChange || s.change24h || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {["all", "tech", "ev", "fintech", "meme", "growth"].map(sec => (
          <button key={sec} onClick={() => setSectorFilter(sec)}
            className={`px-5 py-2 rounded-full font-data text-xs font-bold uppercase tracking-widest transition ${
              sectorFilter === sec
                ? "bg-[var(--primary)] text-[#006532]"
                : "bg-[var(--surface-highest)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            }`}
          >{sec === "all" ? "All Sectors" : sec}</button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
            className="bg-[var(--surface-container)] rounded-full py-2.5 pl-4 pr-4 text-xs font-data tracking-wider focus:ring-1 focus:ring-[var(--primary)]/40 transition-all border-none outline-none w-56 placeholder:text-[var(--outline)]" />
        </div>
        <span className="font-data text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <section className="bg-[var(--surface-low)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--surface-container)]/50">
            <tr>
              {[
                { key: "symbol" as SortKey, label: "Ticker" },
                { key: "price" as SortKey, label: "Price" },
                { key: "change" as SortKey, label: "Change" },
                { key: "volume24h" as SortKey, label: "Volume" },
                { key: "openInterest" as SortKey, label: "OI" },
                { key: "fundingRate" as SortKey, label: "Funding" },
              ].map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)}
                  className="px-6 py-4 font-data text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] font-normal cursor-pointer hover:text-[var(--on-surface)] transition select-none">
                  {col.label} {sortKey === col.key && (sortDir === "desc" ? "↓" : "↑")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-6 py-5"><div className="h-8 shimmer" /></td></tr>
            )) : filtered.map((s: any) => {
              const chg = s.stockChange || s.change24h || 0;
              return (
                <tr key={s.symbol} className="table-row hover:bg-[var(--surface-bright)] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size={32} />
                      <div>
                        <p className="font-display text-sm font-bold">{s.symbol}</p>
                        <p className="text-[10px] text-[var(--on-surface-variant)]">{s.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-data text-sm"><Price usd={s.stockPrice || s.price} /></td>
                  <td className={`px-6 py-5 font-data text-sm font-bold ${chg >= 0 ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                    {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                  </td>
                  <td className="px-6 py-5 font-data text-sm text-[var(--on-surface-variant)]">{s.volume24h > 0 ? format(s.volume24h) : "—"}</td>
                  <td className="px-6 py-5 font-data text-sm text-[var(--on-surface-variant)]">{s.openInterest > 0 ? format(s.openInterest) : "—"}</td>
                  <td className="px-6 py-5 font-data text-sm" style={{ color: (s.fundingRate || 0) > 0 ? "var(--primary)" : (s.fundingRate || 0) < 0 ? "var(--secondary)" : "var(--outline)" }}>
                    {s.fundingRate ? `${(s.fundingRate * 100).toFixed(3)}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
