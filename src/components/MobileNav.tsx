"use client";

import { BarChart3, TrendingUp, Calendar, Zap, MessageSquare } from "lucide-react";

const TABS = [
  { href: "/", icon: BarChart3, label: "Overview" },
  { href: "/markets", icon: TrendingUp, label: "Markets" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/signals", icon: Zap, label: "Signals" },
  { href: "/sentiment", icon: MessageSquare, label: "Sentiment" },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)] backdrop-blur-xl" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--bazaar-gold)] transition"
            >
              <Icon size={18} />
              <span className="text-[9px] font-body font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
