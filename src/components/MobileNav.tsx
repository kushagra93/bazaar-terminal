"use client";

import { BarChart3, TrendingUp, Calendar, Zap, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { t as translate } from "@/config/i18n";

const TABS = [
  { href: "/", icon: BarChart3, key: "nav.overview" },
  { href: "/markets", icon: TrendingUp, key: "nav.markets" },
  { href: "/events", icon: Calendar, key: "nav.events" },
  { href: "/signals", icon: Zap, key: "nav.signals" },
  { href: "/sentiment", icon: MessageSquare, key: "nav.sentiment" },
];

export function MobileNav() {
  const { lang } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <a key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition">
              <Icon size={18} />
              <span className="text-[9px] font-body font-medium">{translate(tab.key, lang)}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
