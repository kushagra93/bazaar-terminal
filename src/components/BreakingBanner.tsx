"use client";

import { useState, useEffect } from "react";
import { useTelegram } from "@/lib/data";

export function BreakingBanner() {
  const { telegram } = useTelegram(15_000);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(true);

  const breaking = (telegram?.breaking || []).filter((b: any) => !dismissed.has(b.id));

  if (!visible || breaking.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[var(--secondary)] text-white py-2 px-4 flex items-center gap-3 animate-[fade-up_0.3s_ease]">
      <span className="font-data text-[10px] uppercase tracking-widest font-bold bg-white/20 px-2 py-0.5 rounded">⚡ BREAKING</span>
      <div className="flex-1 overflow-hidden">
        <p className="font-body text-sm font-medium truncate">{breaking[0]?.text}</p>
      </div>
      <span className="font-data text-[9px] opacity-70">@{breaking[0]?.source}</span>
      <button onClick={() => { setDismissed(prev => new Set([...prev, breaking[0]?.id])); if (breaking.length <= 1) setVisible(false); }}
        className="text-white/60 hover:text-white text-lg leading-none">×</button>
    </div>
  );
}
