"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Currency = "INR" | "USD" | "DUAL";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number;
  rateUpdatedAt: Date | null;
  /** Primary formatted value based on mode */
  format: (usdValue: number) => string;
  /** Dual display: primary + secondary in parens. For table cells / prices. */
  formatDual: (usdValue: number) => { primary: string; secondary: string | null };
  formatRaw: (usdValue: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "DUAL",
  setCurrency: () => {},
  rate: 83.5,
  rateUpdatedAt: null,
  format: () => "",
  formatDual: () => ({ primary: "", secondary: null }),
  formatRaw: (v) => v,
  symbol: "$",
});

const FALLBACK_RATE = 83.5;
const RATE_URL = "https://api.exchangerate-api.com/v4/latest/USD";

/** Indian number system: Lakh / Crore */
function formatINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_00_00_00_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_00_00_000).toLocaleString("en-IN", { maximumFractionDigits: 0 })} L Cr`;
  }
  if (abs >= 1_00_00_00_000) {
    return `${sign}₹${Math.round(abs / 1_00_00_000).toLocaleString("en-IN")} Cr`;
  }
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  }
  if (abs < 1) {
    const decimals = abs < 0.001 ? 6 : abs < 0.1 ? 4 : 2;
    return `${sign}₹${abs.toFixed(decimals)}`;
  }
  return `${sign}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatUSD(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) return `${sign}$${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  if (abs < 1) {
    const decimals = abs < 0.001 ? 6 : abs < 0.1 ? 4 : 2;
    return `${sign}$${abs.toFixed(decimals)}`;
  }
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("DUAL");
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bz_currency") as Currency;
    if (saved && ["INR", "USD", "DUAL"].includes(saved)) setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("bz_currency", c);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchRate = async () => {
      try {
        const res = await fetch(RATE_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.rates?.INR) {
          setRate(data.rates.INR);
          setRateUpdatedAt(new Date());
        }
      } catch {}
    };
    fetchRate();
    const interval = setInterval(fetchRate, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const format = useCallback((usdValue: number): string => {
    if (currency === "INR") return formatINR(usdValue * rate);
    if (currency === "USD") return formatUSD(usdValue);
    // DUAL: show USD primary
    return formatUSD(usdValue);
  }, [currency, rate]);

  const formatDual = useCallback((usdValue: number): { primary: string; secondary: string | null } => {
    if (currency === "INR") return { primary: formatINR(usdValue * rate), secondary: null };
    if (currency === "USD") return { primary: formatUSD(usdValue), secondary: null };
    // DUAL: USD primary, INR in parens
    return { primary: formatUSD(usdValue), secondary: formatINR(usdValue * rate) };
  }, [currency, rate]);

  const formatRaw = useCallback((usdValue: number): number => {
    return currency === "INR" ? usdValue * rate : usdValue;
  }, [currency, rate]);

  const symbol = currency === "INR" ? "₹" : "$";

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, rateUpdatedAt, format, formatDual, formatRaw, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function useINR(usdValue: number): string {
  const { format } = useCurrency();
  return format(usdValue);
}

/** Reusable price display component — shows dual pricing when DUAL mode active */
export function Price({ usd, className = "" }: { usd: number; className?: string }) {
  const { formatDual } = useCurrency();
  const { primary, secondary } = formatDual(usd);

  return (
    <span className={`font-data ${className}`}>
      {primary}
      {secondary && (
        <span className="text-[var(--text-secondary)] ml-1 text-[0.85em]">({secondary})</span>
      )}
    </span>
  );
}
