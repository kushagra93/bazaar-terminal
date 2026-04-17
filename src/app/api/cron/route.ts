import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Pings Telegram feed on Render to keep it alive and trigger scrape
const TG_FEED_URL = process.env.TELEGRAM_FEED_URL || "https://bazaar-tg-feed.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${TG_FEED_URL}/api/ping`);
    const data = res.ok ? await res.json() : { error: `HTTP ${res.status}` };
    return NextResponse.json({ status: "ok", telegram: data, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e.message });
  }
}
