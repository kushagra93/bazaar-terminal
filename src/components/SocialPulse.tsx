"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  MessageSquare, TrendingUp, TrendingDown, Users, Flame,
  Twitter, Hash, Radio, Rss, Globe,
} from "lucide-react";

interface SocialMessage {
  id: number;
  platform: string;
  community: string;
  author: string;
  content: string;
  timestamp: string;
  sentiment: number | null;
}

const PLATFORM_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  twitter: { icon: Twitter, color: "text-sky-400", bg: "bg-sky-400/10" },
  reddit: { icon: Hash, color: "text-orange-400", bg: "bg-orange-400/10" },
  telegram: { icon: Radio, color: "text-blue-400", bg: "bg-blue-400/10" },
  discord: { icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  rss: { icon: Rss, color: "text-amber-400", bg: "bg-amber-400/10" },
};

function SentimentDot({ sentiment }: { sentiment: number | null }) {
  if (sentiment === null) return null;
  const color = sentiment > 0.3 ? "bg-green-400" : sentiment > 0 ? "bg-yellow-400" : sentiment > -0.3 ? "bg-orange-400" : "bg-red-400";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function MessageRow({ msg }: { msg: SocialMessage }) {
  const platform = PLATFORM_CONFIG[msg.platform] || PLATFORM_CONFIG.rss;
  const Icon = platform.icon;

  return (
    <div className="flex gap-2.5 py-2.5 border-b border-[var(--border)] last:border-0 group">
      {/* Platform icon */}
      <div className={`w-7 h-7 rounded-md ${platform.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={13} className={platform.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-[var(--text)] truncate max-w-[100px]">{msg.author || "anon"}</span>
          <span className="text-[var(--muted)]">in {msg.community || msg.platform}</span>
          <SentimentDot sentiment={msg.sentiment} />
          <span className="text-[var(--muted)] ml-auto flex-shrink-0">{timeAgo(msg.timestamp)}</span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2 group-hover:text-[var(--text)] transition">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

interface TickerBuzz {
  ticker: string;
  mentions: number;
  avgSentiment: number;
  messages: SocialMessage[];
}

function TickerBuzzCard({ buzz }: { buzz: TickerBuzz }) {
  const sentColor = buzz.avgSentiment > 0.2 ? "text-green-400" : buzz.avgSentiment < -0.2 ? "text-red-400" : "text-yellow-400";
  const SentIcon = buzz.avgSentiment > 0.2 ? TrendingUp : buzz.avgSentiment < -0.2 ? TrendingDown : Flame;

  return (
    <div className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{buzz.ticker}</span>
          <span className="chip border border-[var(--border)] text-[var(--muted)]">
            <Users size={9} className="inline mr-0.5" />
            {buzz.mentions}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${sentColor}`}>
          <SentIcon size={12} />
          <span>{buzz.avgSentiment >= 0 ? "+" : ""}{buzz.avgSentiment.toFixed(2)}</span>
        </div>
      </div>
      {buzz.messages.slice(0, 2).map(m => (
        <MessageRow key={m.id} msg={m} />
      ))}
    </div>
  );
}

export function SocialPulse() {
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"feed" | "tickers">("feed");

  useEffect(() => {
    const load = async () => {
      try {
        const msgs = await api.recentMessages(100);
        setMessages(msgs);
      } catch {
        // backend offline
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  // Group by ticker mentions
  const TRACKED = ["NVDA", "TSLA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "AMD", "TSM", "JPM", "GS", "SPY", "QQQ"];
  const tickerBuzz: TickerBuzz[] = TRACKED.map(ticker => {
    const related = messages.filter(m =>
      m.content?.toUpperCase().includes(ticker) ||
      m.content?.includes(`$${ticker}`)
    );
    const sentiments = related.filter(m => m.sentiment !== null).map(m => m.sentiment!);
    return {
      ticker,
      mentions: related.length,
      avgSentiment: sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0,
      messages: related,
    };
  }).filter(b => b.mentions > 0).sort((a, b) => b.mentions - a.mentions);

  // Platform stats
  const platformCounts: Record<string, number> = {};
  messages.forEach(m => {
    platformCounts[m.platform] = (platformCounts[m.platform] || 0) + 1;
  });

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Globe size={14} className="text-cyan-400" />
            Social Pulse
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setView("feed")}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${
                view === "feed" ? "bg-[var(--bg)] text-white" : "text-[var(--muted)] hover:text-white"
              }`}
            >Feed</button>
            <button
              onClick={() => setView("tickers")}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${
                view === "tickers" ? "bg-[var(--bg)] text-white" : "text-[var(--muted)] hover:text-white"
              }`}
            >By Ticker</button>
          </div>
        </div>

        {/* Platform badges */}
        <div className="flex gap-2 mt-2">
          {Object.entries(platformCounts).map(([platform, count]) => {
            const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.rss;
            const Icon = config.icon;
            return (
              <span key={platform} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${config.bg} ${config.color}`}>
                <Icon size={10} />
                {count}
              </span>
            );
          })}
          {Object.keys(platformCounts).length === 0 && (
            <span className="text-[10px] text-[var(--muted)]">
              Waiting for social collectors...
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded shimmer" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)]">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No social data yet</p>
            <p className="text-[10px] mt-1">Start SentinelQ collectors to see Reddit,<br/>Twitter, Telegram, Discord chatter</p>
          </div>
        ) : view === "feed" ? (
          <div className="px-4">
            {messages.slice(0, 30).map(msg => (
              <MessageRow key={msg.id} msg={msg} />
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {tickerBuzz.length > 0 ? (
              tickerBuzz.map(buzz => <TickerBuzzCard key={buzz.ticker} buzz={buzz} />)
            ) : (
              <p className="text-xs text-[var(--muted)] text-center py-4">
                No ticker mentions detected in recent messages
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
