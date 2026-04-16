"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/lib/currency";
import { useLanguage } from "@/lib/language";
import { getSessionInfo, getISTTime, SessionInfo } from "@/lib/session";
import { useStocks, CONTEXT_SYMBOLS } from "@/lib/data";
import { Lang } from "@/config/i18n";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/markets", label: "Markets" },
  { href: "/events", label: "Events" },
  { href: "/signals", label: "Signals" },
  { href: "/sentiment", label: "Sentiment" },
];

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "हि" },
  { value: "mr", label: "मर" },
  { value: "ta", label: "தமி" },
];

function SessionPill() {
  const [session, setSession] = useState<SessionInfo>(getSessionInfo());
  const [istTime, setIstTime] = useState(getISTTime());
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSession(getSessionInfo());
      setIstTime(getISTTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-data text-xs"
        style={{ borderColor: session.color, color: session.color }}
      >
        <span style={{ animation: session.key === "open" ? "pulse-dot 2s ease infinite" : "none" }}>
          {session.icon}
        </span>
        <span className="font-semibold tracking-wide">{session.label}</span>
        <span className="text-[var(--text-secondary)] font-data">{istTime}</span>
      </div>
      {hovered && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-default)] shadow-xl z-50 animate-[fade-up_0.15s_ease]">
          <div className="text-xs font-body text-[var(--text-primary)]">{session.sublabel}</div>
          <div className="text-[11px] font-body text-[var(--text-secondary)] mt-1">{session.context}</div>
        </div>
      )}
    </div>
  );
}

function CurrencyToggle() {
  const { currency, setCurrency, rate } = useCurrency();
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border-dim)] p-0.5">
      <button
        onClick={() => setCurrency("DUAL")}
        className={`px-2 py-1 rounded text-[10px] font-body font-semibold transition ${
          currency === "DUAL" ? "text-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)]"
        }`}
        title="USD with INR in brackets"
      >$ (₹)</button>
      <button
        onClick={() => setCurrency("INR")}
        className={`px-2 py-1 rounded text-[10px] font-body font-semibold transition ${
          currency === "INR" ? "text-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)]"
        }`}
      >₹</button>
      <button
        onClick={() => setCurrency("USD")}
        className={`px-2 py-1 rounded text-[10px] font-body font-semibold transition ${
          currency === "USD" ? "text-[var(--bull)] bg-[var(--bull-dim)]" : "text-[var(--text-secondary)]"
        }`}
      >$</button>
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border-dim)] p-0.5">
      {LANG_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setLang(opt.value)}
          className={`px-1.5 py-1 rounded text-[10px] font-body font-semibold transition ${
            lang === opt.value ? "text-[var(--bazaar-gold)] bg-[var(--bazaar-gold-dim)]" : "text-[var(--text-secondary)]"
          }`}
        >{opt.label}</button>
      ))}
    </div>
  );
}

function TickerStrip() {
  const { format } = useCurrency();
  const { stocks } = useStocks(30_000);

  const contextStocks = stocks.filter((s: any) => CONTEXT_SYMBOLS.includes(s.symbol));
  const scrollStocks = stocks.filter((s: any) => !CONTEXT_SYMBOLS.includes(s.symbol));

  return (
    <div className="ticker-strip">
      {/* Pinned SPY/QQQ */}
      <div className="flex items-center px-4 border-r border-[var(--border-dim)] flex-shrink-0">
        {contextStocks.map((s, i) => (
          <span key={s.symbol} className="ticker-item">
            <span className="text-[var(--text-secondary)] font-semibold">{s.symbol}</span>
            <span className="text-[var(--text-primary)]">{format(s.price)}</span>
            <span className={s.change24h >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}>
              {s.change24h >= 0 ? "▲" : "▼"}{Math.abs(s.change24h).toFixed(2)}%
            </span>
            {i < contextStocks.length - 1 && <span className="ticker-separator">|</span>}
          </span>
        ))}
      </div>
      {/* Scrolling tickers */}
      <div className="overflow-hidden flex-1">
        <div className="ticker-scroll">
          {[...scrollStocks, ...scrollStocks].map((s, i) => (
            <span key={`${s.symbol}-${i}`} className="ticker-item">
              <span className="text-[var(--text-secondary)]">{s.symbol}</span>
              <span className="text-[var(--text-primary)]">{format(s.price)}</span>
              <span className={s.change24h >= 0 ? "text-[var(--bull)]" : "text-[var(--bear)]"}>
                {s.change24h >= 0 ? "▲" : "▼"}{Math.abs(s.change24h).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NavBar() {
  return (
    <>
      {/* Main nav — 60px */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-dim)] bg-[var(--bg-base)]/90 backdrop-blur-xl px-6" style={{ height: 60 }}>
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
          {/* Left: logo + links */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <span className="text-[var(--bazaar-gold)] text-lg">▣</span>
              <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-[3px]">BAZAAR</span>
            </a>
            <span className="text-[9px] font-body text-[var(--text-secondary)] uppercase tracking-widest -ml-2 mt-0.5 hidden sm:block">
              US STOCK PERPS · INDIAN EDGE
            </span>
            <div className="h-5 w-px bg-[var(--border-dim)] mx-1" />
            <div className="flex gap-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-body font-medium uppercase tracking-[0.8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: session + currency + language + clock */}
          <div className="flex items-center gap-3">
            <SessionPill />
            <CurrencyToggle />
            <LanguageToggle />
          </div>
        </div>
      </nav>

      {/* Ticker strip — 36px */}
      <TickerStrip />
    </>
  );
}
