"use client";

import { Signal } from "@/lib/api";
import {
  TrendingUp, TrendingDown, Minus, Clock, Zap, Shield,
  BarChart3, Newspaper, Brain, LineChart, Calendar, MessageSquare,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  options_flow: { icon: Zap, label: "OPTIONS", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  expert_call: { icon: Brain, label: "ANALYST", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  technical: { icon: LineChart, label: "TECHNICAL", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  earnings: { icon: Calendar, label: "EARNINGS", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  news_macro: { icon: Newspaper, label: "NEWS", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  sentiment: { icon: MessageSquare, label: "SENTIMENT", color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
};

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#eab308" : score >= 55 ? "#f97316" : "#64748b";

  return (
    <div className="relative w-[68px] h-[68px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

function DirectionBadge({ direction }: { direction: string }) {
  if (direction === "LONG") {
    return (
      <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--long-bg)] border border-[var(--long-border)]">
        <TrendingUp size={14} className="text-green-400" />
        <span className="text-xs font-bold text-green-400">LONG</span>
      </div>
    );
  }
  if (direction === "SHORT") {
    return (
      <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--short-bg)] border border-[var(--short-border)]">
        <TrendingDown size={14} className="text-red-400" />
        <span className="text-xs font-bold text-red-400">SHORT</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--neutral-bg)] border border-yellow-500/20">
      <Minus size={14} className="text-yellow-400" />
      <span className="text-xs font-bold text-yellow-400">NEUTRAL</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SignalCard({ signal }: { signal: Signal }) {
  const config = TYPE_CONFIG[signal.signal_type] || TYPE_CONFIG.news_macro;
  const Icon = config.icon;
  const glowClass = signal.direction === "LONG" ? "glow-long" : signal.direction === "SHORT" ? "glow-short" : "";

  return (
    <div className={`signal-card rounded-xl bg-[var(--card)] p-4 ${signal.composite_score >= 75 ? glowClass : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ScoreRing score={signal.composite_score || 0} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-wide">{signal.ticker}</span>
              <DirectionBadge direction={signal.direction} />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`chip border ${config.color}`}>
                <Icon size={10} className="inline mr-1" />
                {config.label}
              </span>
              {signal.cross_source_count > 1 && (
                <span className="chip border text-cyan-300 bg-cyan-400/10 border-cyan-400/20">
                  <Shield size={10} className="inline mr-1" />
                  {signal.cross_source_count}/6
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock size={11} />
            {signal.created_at ? timeAgo(signal.created_at) : "—"}
          </div>
          {signal.time_sensitivity >= 80 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
              <Zap size={11} />
              <span>Time-sensitive</span>
            </div>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-3">
        <div className="h-1 rounded-full bg-[#1e293b] overflow-hidden">
          <div
            className="score-bar h-full rounded-full"
            style={{ width: `${signal.composite_score || 0}%` }}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1">
          <BarChart3 size={11} />
          <span>Reliability {Math.round(signal.source_reliability || 0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield size={11} />
          <span>{signal.cross_source_count || 0} sources</span>
        </div>
      </div>
    </div>
  );
}

export function SignalCardSkeleton() {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-4">
      <div className="flex items-start gap-3">
        <div className="w-[68px] h-[68px] rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 rounded shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
      </div>
      <div className="h-1 mt-3 rounded shimmer" />
    </div>
  );
}
