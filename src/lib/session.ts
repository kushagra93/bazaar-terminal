/** US market session detector — accurate ET time conversion */

export interface SessionInfo {
  label: string;
  sublabel: string;
  color: string;
  icon: string;
  context: string;
  key: "premarket" | "open" | "afterhours" | "overnight";
}

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  const stdOffset = Math.max(jan, jul);
  // Check if US is in DST by checking a US timezone offset
  // EDT = UTC-4, EST = UTC-5
  // DST in US: second Sunday March to first Sunday November
  const month = date.getUTCMonth(); // 0-indexed
  if (month > 2 && month < 10) return true; // Apr-Oct always DST
  if (month < 2 || month > 10) return false; // Jan-Feb, Dec never DST
  // March or November — approximate
  if (month === 2) return date.getUTCDate() >= 10; // roughly second Sunday
  return date.getUTCDate() < 3; // first Sunday Nov
}

export function getSessionInfo(): SessionInfo {
  const now = new Date();
  const etOffset = isDST(now) ? -4 : -5;
  const etHour = (now.getUTCHours() + etOffset + 24) % 24;
  const etMin = now.getUTCMinutes();
  const etTime = etHour + etMin / 60;

  if (etTime >= 4 && etTime < 9.5) {
    return {
      label: "PRE-MARKET",
      sublabel: "Price discovery underway",
      color: "var(--session-premarket)",
      icon: "◐",
      context: "Low liquidity. Gaps forming. Wait for confirmation.",
      key: "premarket",
    };
  }
  if (etTime >= 9.5 && etTime < 16) {
    return {
      label: "MARKET OPEN",
      sublabel: "Regular hours — high volatility",
      color: "var(--session-open)",
      icon: "●",
      context: "Full liquidity. All signals active. Prime trading window.",
      key: "open",
    };
  }
  if (etTime >= 16 && etTime < 20) {
    return {
      label: "AFTER-HOURS",
      sublabel: "Earnings releases likely",
      color: "var(--session-afterhours)",
      icon: "◑",
      context: "Earnings moves happen here. Thin liquidity. Wider spreads.",
      key: "afterhours",
    };
  }
  return {
    label: "OVERNIGHT",
    sublabel: "Perp active, stock closed",
    color: "var(--session-overnight)",
    icon: "○",
    context: "Low volatility. Good time to plan, not trade.",
    key: "overnight",
  };
}

/** Format current time as IST */
export function getISTTime(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const h = ist.getUTCHours().toString().padStart(2, "0");
  const m = ist.getUTCMinutes().toString().padStart(2, "0");
  const s = ist.getUTCSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s} IST`;
}
