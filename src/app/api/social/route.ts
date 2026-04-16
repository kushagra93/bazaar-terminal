import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Social Intelligence API — aggregates from multiple live sources:
 *
 * 1. Reddit (r/wallstreetbets, r/stocks, r/options) — hot posts
 * 2. Finnhub Company News — real-time news per tracked stock
 * 3. Finnhub Social Sentiment — aggregated Twitter/Reddit scores per ticker
 * 4. Google News RSS — financial headlines as backup
 *
 * All free, no auth needed except Finnhub (60 req/min).
 */

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "d7gb999r01qqb8rj0s0gd7gb999r01qqb8rj0s10";
const SUBREDDITS = ["wallstreetbets", "stocks", "options", "stockmarket"];
const TRACKED = new Set([
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "NFLX",
  "AMD", "INTC", "PLTR", "COIN", "HOOD", "SOFI", "RIVN", "LCID",
  "GME", "AMC", "PYPL", "SQ", "SHOP", "UBER", "SNAP", "SPOT",
  "RBLX", "ROKU", "ABNB", "BABA", "NIO", "LYFT", "MSTR", "SPY", "QQQ",
]);

const COMPANY_TO_TICKER: Record<string, string> = {
  "tesla": "TSLA", "nvidia": "NVDA", "apple": "AAPL", "microsoft": "MSFT",
  "amazon": "AMZN", "meta": "META", "google": "GOOGL", "alphabet": "GOOGL",
  "netflix": "NFLX", "amd": "AMD", "intel": "INTC", "alibaba": "BABA",
  "palantir": "PLTR", "coinbase": "COIN", "robinhood": "HOOD",
  "gamestop": "GME", "paypal": "PYPL", "shopify": "SHOP", "uber": "UBER",
  "airbnb": "ABNB", "microstrategy": "MSTR", "spotify": "SPOT", "roblox": "RBLX",
};

interface SocialPost {
  id: string;
  source: "reddit" | "finnhub_news" | "google_news";
  subreddit?: string;
  title: string;
  author: string;
  score: number;
  numComments?: number;
  url: string;
  created: number;
  flair?: string;
  tickers: string[];
  sentiment: "bullish" | "bearish" | "neutral";
  newsSource?: string;
}

function extractTickers(text: string): string[] {
  const found = new Set<string>();
  const dollarMatches = text.match(/\$([A-Z]{2,5})\b/g);
  if (dollarMatches) {
    for (const m of dollarMatches) {
      const t = m.replace("$", "");
      if (TRACKED.has(t)) found.add(t);
    }
  }
  for (const ticker of TRACKED) {
    const re = new RegExp(`\\b${ticker}\\b`);
    if (re.test(text)) found.add(ticker);
  }
  const lower = text.toLowerCase();
  for (const [name, ticker] of Object.entries(COMPANY_TO_TICKER)) {
    if (lower.includes(name)) found.add(ticker);
  }
  return Array.from(found);
}

function guessSentiment(title: string, flair: string = ""): "bullish" | "bearish" | "neutral" {
  const lower = (title + " " + flair).toLowerCase();
  const bullishFlairs = ["gain", "yolo", "tendies", "dd"];
  const bearishFlairs = ["loss", "loss porn", "bagholding"];
  for (const f of bullishFlairs) if (flair?.toLowerCase().includes(f)) return "bullish";
  for (const f of bearishFlairs) if (flair?.toLowerCase().includes(f)) return "bearish";

  const bullish = ["calls", "long", "bull", "moon", "buy", "yolo", "gain", "rocket", "squeeze",
    "breakout", "all in", "all-time high", "ath", "new high", "rally", "rip up",
    "to the moon", "undervalued", "dip buy", "buying the dip", "btfd", "loaded up",
    "upgrade", "beat", "blowout", "record revenue", "strong earnings", "outperform"];
  const bearish = ["puts", "short", "bear", "crash", "sell", "loss", "dump", "inverse",
    "rug", "overvalued", "bubble", "dead cat", "recession", "downgrade", "miss",
    "layoffs", "bankrupt", "fraud", "plunge", "tank", "collapse", "warning", "fear",
    "capitulation", "drill", "falling knife", "underweight"];

  let score = 0;
  for (const w of bullish) if (lower.includes(w)) score++;
  for (const w of bearish) if (lower.includes(w)) score--;
  if (lower.includes("?") && score > 0) score = Math.max(0, score - 1);
  return score > 0 ? "bullish" : score < 0 ? "bearish" : "neutral";
}

// ── Source 1: Reddit ──
async function fetchReddit(): Promise<SocialPost[]> {
  const posts: SocialPost[] = [];
  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
        headers: { "User-Agent": "BAZAAR-StockPerps/2.0 (by /u/bazaar_terminal)" },
      });
      if (!res.ok) {
        // Fallback to old.reddit if new reddit blocks
        const fallback = await fetch(`https://old.reddit.com/r/${sub}/hot.json?limit=25`, {
          headers: { "User-Agent": "BAZAAR-StockPerps/2.0" },
        });
        if (!fallback.ok) continue;
        const data = await fallback.json();
        for (const child of data?.data?.children || []) {
          const p = child.data;
          if (!p || p.stickied) continue;
          const tickers = extractTickers(p.title + " " + (p.selftext || "").slice(0, 500));
          posts.push({
            id: p.id, source: "reddit", subreddit: sub,
            title: p.title, author: p.author, score: p.score,
            numComments: p.num_comments,
            url: `https://reddit.com${p.permalink}`,
            created: p.created_utc, flair: p.link_flair_text || "",
            tickers, sentiment: guessSentiment(p.title, p.link_flair_text || ""),
          });
        }
        continue;
      }
      const data = await res.json();
      for (const child of data?.data?.children || []) {
        const p = child.data;
        if (!p || p.stickied) continue;
        const tickers = extractTickers(p.title + " " + (p.selftext || "").slice(0, 500));
        posts.push({
          id: p.id, source: "reddit", subreddit: sub,
          title: p.title, author: p.author, score: p.score,
          numComments: p.num_comments,
          url: `https://reddit.com${p.permalink}`,
          created: p.created_utc, flair: p.link_flair_text || "",
          tickers, sentiment: guessSentiment(p.title, p.link_flair_text || ""),
        });
      }
    } catch (e) {
      console.error(`Reddit fetch error for r/${sub}:`, e);
    }
  }
  return posts;
}

// ── Source 2: Finnhub Company News ──
async function fetchFinnhubNews(): Promise<SocialPost[]> {
  const posts: SocialPost[] = [];
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const topStocks = ["TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "AMD"];

  for (const sym of topStocks) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${yesterday}&to=${today}&token=${FINNHUB_KEY}`
      );
      if (!res.ok) continue;
      const articles = await res.json();
      for (const a of articles.slice(0, 3)) {
        const tickers = extractTickers(a.headline + " " + sym);
        if (!tickers.includes(sym)) tickers.push(sym);
        posts.push({
          id: `fn_${a.id || a.url}`, source: "finnhub_news",
          title: a.headline, author: a.source || "News",
          score: 0, url: a.url || "",
          created: a.datetime || Math.floor(Date.now() / 1000),
          tickers, sentiment: guessSentiment(a.headline, ""),
          newsSource: a.source,
        });
      }
    } catch {}
  }
  return posts;
}

// ── Source 3: Google News RSS (financial) ──
async function fetchGoogleNews(): Promise<SocialPost[]> {
  const posts: SocialPost[] = [];
  const queries = ["US+stock+market", "TSLA+NVDA+stock", "Wall+Street+earnings"];

  for (const q of queries) {
    try {
      const res = await fetch(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`);
      if (!res.ok) continue;
      const text = await res.text();
      // Parse RSS XML manually (no library needed)
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const item of items.slice(0, 5)) {
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const sourceMatch = item.match(/<source.*?>(.*?)<\/source>/);
        if (!titleMatch) continue;

        const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        const tickers = extractTickers(title);
        posts.push({
          id: `gn_${linkMatch?.[1] || Math.random()}`, source: "google_news",
          title, author: sourceMatch?.[1] || "Google News",
          score: 0, url: linkMatch?.[1] || "",
          created: dateMatch ? Math.floor(new Date(dateMatch[1]).getTime() / 1000) : Math.floor(Date.now() / 1000),
          tickers, sentiment: guessSentiment(title, ""),
          newsSource: sourceMatch?.[1],
        });
      }
    } catch {}
  }
  return posts;
}

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 90_000) {
    return NextResponse.json(cache.data);
  }

  // Fetch all sources in parallel
  const [redditPosts, finnhubNews, googleNews] = await Promise.all([
    fetchReddit().catch(() => []),
    fetchFinnhubNews().catch(() => []),
    fetchGoogleNews().catch(() => []),
  ]);

  const allPosts = [...redditPosts, ...finnhubNews, ...googleNews]
    .sort((a, b) => b.score - a.score || b.created - a.created);

  // Compute ticker stats
  const tickerStats: Record<string, { mentions: number; totalScore: number; bullish: number; bearish: number; neutral: number; sources: Set<string> }> = {};
  for (const post of allPosts) {
    for (const t of post.tickers) {
      if (!tickerStats[t]) tickerStats[t] = { mentions: 0, totalScore: 0, bullish: 0, bearish: 0, neutral: 0, sources: new Set() };
      tickerStats[t].mentions++;
      tickerStats[t].totalScore += post.score;
      tickerStats[t][post.sentiment]++;
      tickerStats[t].sources.add(post.source);
    }
  }

  const trending = Object.entries(tickerStats)
    .map(([symbol, stats]) => ({
      symbol, ...stats,
      sources: Array.from(stats.sources),
      sentimentRatio: stats.mentions > 0 ? (stats.bullish - stats.bearish) / stats.mentions : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);

  const result = {
    posts: allPosts.slice(0, 80),
    trending,
    totalPosts: allPosts.length,
    sourceBreakdown: {
      reddit: redditPosts.length,
      finnhub_news: finnhubNews.length,
      google_news: googleNews.length,
    },
    subreddits: SUBREDDITS,
    fetchedAt: new Date().toISOString(),
  };

  cache = { data: result, ts: Date.now() };
  return NextResponse.json(result);
}
