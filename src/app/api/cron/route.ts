import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron Job — pings the Telegram feed on Render every 5 minutes
 * to keep it alive (free tier sleeps after 15 min) and trigger a fresh scrape.
 *
 * Configure in vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "*/5 * * * *" }] }
 */

const TG_FEED_URL = process.env.TELEGRAM_FEED_URL || "https://bazaar-tg-feed.onrender.com";

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth in dev
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const res = await fetch(`${TG_FEED_URL}/api/ping`, { next: { revalidate: 0 } });
    const data = res.ok ? await res.json() : { error: `HTTP ${res.status}` };

    const healthRes = await fetch(`${TG_FEED_URL}/api/health`);
    const health = healthRes.ok ? await healthRes.json() : {};

    return NextResponse.json({
      status: "ok",
      telegram: data,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "error",
      error: e.message,
      timestamp: new Date().toISOString(),
    });
  }
}
