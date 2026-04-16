"use client";

import { useState } from "react";

/**
 * Stock logo component with multiple fallback sources:
 * 1. Financialmodelingprep.com (most reliable for US stocks)
 * 2. Logo.dev (good coverage)
 * 3. Styled initials fallback (always works)
 */

const SECTOR_COLORS: Record<string, { bg: string; text: string }> = {
  tech: { bg: "#6366f115", text: "#6366f1" },
  ev: { bg: "#10b98115", text: "#10b981" },
  fintech: { bg: "#14b8a615", text: "#14b8a6" },
  meme: { bg: "#f43f5e15", text: "#f43f5e" },
  growth: { bg: "#8b5cf615", text: "#8b5cf6" },
  index: { bg: "#e8a04515", text: "#e8a045" },
  commodity: { bg: "#d4750a15", text: "#d4750a" },
};

const SECTOR_MAP: Record<string, string> = {
  AAPL: "tech", MSFT: "tech", NVDA: "tech", AMD: "tech", INTC: "tech", GOOGL: "tech", META: "tech",
  TSLA: "ev", RIVN: "ev", LCID: "ev", NIO: "ev",
  COIN: "fintech", HOOD: "fintech", SOFI: "fintech", PYPL: "fintech", SQ: "fintech", MSTR: "fintech",
  GME: "meme", AMC: "meme",
  SPY: "index", QQQ: "index",
  GLD: "commodity",
};

// FMP provides reliable stock logos
function getFMPUrl(symbol: string): string {
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
}

// Logo.dev as backup
function getLogoDevUrl(domain: string): string {
  return `https://img.logo.dev/${domain}?token=pk_anonymous&size=64`;
}

const DOMAINS: Record<string, string> = {
  TSLA: "tesla.com", NVDA: "nvidia.com", AAPL: "apple.com", MSFT: "microsoft.com",
  AMZN: "amazon.com", META: "meta.com", GOOGL: "google.com", NFLX: "netflix.com",
  AMD: "amd.com", INTC: "intel.com", BABA: "alibaba.com", NIO: "nio.com",
  PLTR: "palantir.com", COIN: "coinbase.com", HOOD: "robinhood.com", SOFI: "sofi.com",
  RIVN: "rivian.com", LCID: "lucidmotors.com", GME: "gamestop.com", AMC: "amctheatres.com",
  PYPL: "paypal.com", SQ: "squareup.com", SHOP: "shopify.com", UBER: "uber.com",
  LYFT: "lyft.com", SNAP: "snapchat.com", SPOT: "spotify.com", RBLX: "roblox.com",
  ROKU: "roku.com", ABNB: "airbnb.com", MSTR: "microstrategy.com",
  SPY: "ssga.com", QQQ: "invesco.com", GLD: "spdrgoldshares.com",
};

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function StockLogo({ symbol, size = 28, className = "" }: StockLogoProps) {
  const [imgState, setImgState] = useState<"fmp" | "logodev" | "fallback">("fmp");

  const sector = SECTOR_MAP[symbol] || "growth";
  const colors = SECTOR_COLORS[sector] || SECTOR_COLORS.growth;
  const domain = DOMAINS[symbol];

  if (imgState === "fallback" || !domain) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-data font-bold ${className}`}
        style={{
          width: size,
          height: size,
          background: colors.bg,
          color: colors.text,
          fontSize: size * 0.32,
          letterSpacing: "0.5px",
        }}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  const src = imgState === "fmp" ? getFMPUrl(symbol) : getLogoDevUrl(domain);

  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-lg object-contain bg-[var(--bg-elevated)] ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        if (imgState === "fmp") setImgState("logodev");
        else setImgState("fallback");
      }}
    />
  );
}
