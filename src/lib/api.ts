const API_BASE = "http://localhost:8500/api";

export async function fetchJSON<T>(path: string, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export interface CommunityStats {
  community_id: number;
  total_messages: number;
  avg_sentiment: number | null;
  live_sentiment: number | null;
}

export interface SentimentPoint {
  timestamp: string;
  avg_sentiment: number;
  message_count: number;
}

export interface Topic {
  name: string;
  description: string;
  avg_sentiment: number;
  trend: string;
}

export interface Demand {
  name: string;
  description: string;
  urgency: number;
  frequency: number;
  category: string;
  quotes: string[];
}

export interface Frustration {
  name: string;
  category: string;
  severity: number;
  affected_segment: string;
  description: string;
  quotes: string[];
}

export interface PipelineStats {
  bus: {
    total_received: number;
    total_consumed: number;
    queue_size: number;
    by_platform: Record<string, number>;
  };
  ai_usage: {
    total_calls: number;
    total_input_tokens: number;
    total_output_tokens: number;
    estimated_cost_usd: number;
  };
}

const defaultStats: PipelineStats = {
  bus: { total_received: 0, total_consumed: 0, queue_size: 0, by_platform: {} },
  ai_usage: { total_calls: 0, total_input_tokens: 0, total_output_tokens: 0, estimated_cost_usd: 0 },
};

// Signal Engine Types
export interface Signal {
  id: number;
  ticker: string;
  direction: "LONG" | "SHORT" | "NEUTRAL";
  signal_type: string;
  composite_score: number;
  cross_source_count: number;
  source_reliability: number;
  time_sensitivity: number;
  created_at: string;
  expires_at: string;
  raw_data?: Record<string, any>;
}

export interface SignalWithOutcome {
  signal: {
    id: number;
    direction: string;
    signal_type: string;
    composite_score: number;
    created_at: string;
  };
  outcome: {
    direction_was_correct: boolean;
    pnl_percent: number;
    entry_price: number;
    exit_price: number;
    recorded_at: string;
  } | null;
}

export interface TraderProfile {
  id: number;
  user_id: string;
  tier: "beginner" | "active" | "power";
  preferred_language: string;
  capital_range: string;
  total_actions: number;
  avg_action_time_seconds: number;
  tier_score: number;
  signal_click_history: Record<string, number>;
  profitable_signal_types: Record<string, any>;
  watched_tickers: string[];
  auto_promoted_at: string | null;
  created_at: string;
}

export interface PersonalizedFeed {
  user_id: string;
  tier: string;
  signal_count: number;
  signals: any[];
}

export interface SourceLeaderboard {
  name: string;
  category: string;
  api_provider: string;
  hit_rate: number;
  total_signals: number;
  correct_signals: number;
  reliability_score: number;
}

export interface EarningsCard {
  ticker: string;
  direction: string;
  score: number;
  earnings_date: string;
  consensus_eps: number;
  whisper_eps: number;
  options_implied_move: number;
  historical_avg_move: number;
  peer_signals: any[];
  setup_summary: string;
}

export const api = {
  // Existing
  stats: () => fetchJSON<PipelineStats>("/stats", defaultStats),
  communities: () => fetchJSON<any[]>("/communities", []),
  communityStats: (id: number) => fetchJSON<CommunityStats>(`/communities/${id}/stats`),
  sentimentCurrent: () => fetchJSON<{ avg_sentiment: number }>("/sentiment/current", { avg_sentiment: 0 }),
  sentimentHistory: (hours = 24) => fetchJSON<SentimentPoint[]>(`/sentiment/history?hours=${hours}`, []),
  topics: () => fetchJSON<Topic[]>("/topics", []),
  topicsTrending: () => fetchJSON<{ topic: string; score: number }[]>("/topics/trending", []),
  demands: () => fetchJSON<Demand[]>("/demands", []),
  frustrations: () => fetchJSON<Frustration[]>("/frustrations", []),
  generateReport: () => fetchJSON<{ report: string }>("/reports/generate"),
  recentMessages: (limit = 50) => fetchJSON<any[]>(`/messages/recent?limit=${limit}`, []),

  // Signal Engine
  signals: (params?: { ticker?: string; signal_type?: string; min_score?: number; user_id?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.ticker) q.set("ticker", params.ticker);
    if (params?.signal_type) q.set("signal_type", params.signal_type);
    if (params?.min_score) q.set("min_score", String(params.min_score));
    if (params?.user_id) q.set("user_id", params.user_id);
    if (params?.limit) q.set("limit", String(params.limit));
    return fetchJSON<Signal[]>(`/signals?${q.toString()}`, []);
  },
  signalsByTicker: (ticker: string, hours = 72) => fetchJSON<Signal[]>(`/signals/${ticker}?hours=${hours}`, []),
  signalHistory: (ticker: string) => fetchJSON<SignalWithOutcome[]>(`/signals/${ticker}/history`, []),
  profile: (userId: string) => fetchJSON<TraderProfile>(`/profile/${userId}`),
  personalizedFeed: (userId: string) => fetchJSON<PersonalizedFeed>(`/profile/${userId}/feed`),
  sourceLeaderboard: () => fetchJSON<SourceLeaderboard[]>("/leaderboard/sources", []),
  earningsCalendar: (days = 14) => fetchJSON<EarningsCard[]>(`/earnings/calendar?days_ahead=${days}`, []),
};
