import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxies the local Telegram feed server (port 8000)
 * In production, replace with the deployed Telegram feed URL
 */
const TG_FEED_URL = process.env.TELEGRAM_FEED_URL || "http://localhost:8000";

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 30_000) {
    return NextResponse.json(cache.data);
  }

  try {
    const [feedRes, sentRes, trendRes] = await Promise.all([
      fetch(`${TG_FEED_URL}/api/feed?limit=50`).then(r => r.ok ? r.json() : []),
      fetch(`${TG_FEED_URL}/api/sentiment`).then(r => r.ok ? r.json() : null),
      fetch(`${TG_FEED_URL}/api/trending`).then(r => r.ok ? r.json() : []),
    ]);

    const result = {
      feed: feedRes,
      sentiment: sentRes,
      trending: trendRes,
      source: "telegram",
      fetchedAt: new Date().toISOString(),
    };

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (e) {
    // Telegram feed not running — return empty
    return NextResponse.json({ feed: [], sentiment: null, trending: [], source: "telegram", error: "Feed server not running" });
  }
}
