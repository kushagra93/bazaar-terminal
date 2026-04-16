import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Live social data from Reddit — r/wallstreetbets, r/stocks, r/options
 * No auth needed — uses Reddit's public JSON API
 */

const SUBREDDITS = ["wallstreetbets", "stocks", "options"];
const TRACKED = new Set([
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "NFLX",
  "AMD", "INTC", "PLTR", "COIN", "HOOD", "SOFI", "RIVN", "LCID",
  "GME", "AMC", "PYPL", "SQ", "SHOP", "UBER", "SNAP", "SPOT",
  "RBLX", "ROKU", "ABNB", "BABA", "NIO", "LYFT", "MSTR", "SPY", "QQQ",
]);

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  author: string;
  score: number;
  numComments: number;
  url: string;
  created: number;
  flair: string;
  tickers: string[];
  sentiment: "bullish" | "bearish" | "neutral";
}

const COMPANY_TO_TICKER: Record<string, string> = {
  "tesla": "TSLA", "nvidia": "NVDA", "apple": "AAPL", "microsoft": "MSFT",
  "amazon": "AMZN", "meta": "META", "google": "GOOGL", "alphabet": "GOOGL",
  "netflix": "NFLX", "amd": "AMD", "intel": "INTC", "alibaba": "BABA",
  "nio": "NIO", "palantir": "PLTR", "coinbase": "COIN", "robinhood": "HOOD",
  "sofi": "SOFI", "rivian": "RIVN", "lucid": "LCID", "gamestop": "GME",
  "paypal": "PYPL", "shopify": "SHOP", "uber": "UBER", "lyft": "LYFT",
  "snap": "SNAP", "snapchat": "SNAP", "spotify": "SPOT", "roblox": "RBLX",
  "roku": "ROKU", "airbnb": "ABNB", "microstrategy": "MSTR",
};

function extractTickers(text: string): string[] {
  const found = new Set<string>();
  // Match $TICKER
  const dollarMatches = text.match(/\$([A-Z]{2,5})\b/g);
  if (dollarMatches) {
    for (const m of dollarMatches) {
      const t = m.replace("$", "");
      if (TRACKED.has(t)) found.add(t);
    }
  }
  // Match plain uppercase ticker mentions (with word boundaries)
  for (const ticker of TRACKED) {
    const re = new RegExp(`\\b${ticker}\\b`);
    if (re.test(text)) found.add(ticker);
  }
  // Match company names → tickers
  const lower = text.toLowerCase();
  for (const [name, ticker] of Object.entries(COMPANY_TO_TICKER)) {
    if (lower.includes(name)) found.add(ticker);
  }
  return Array.from(found);
}

function guessSentiment(title: string, flair: string): "bullish" | "bearish" | "neutral" {
  const lower = (title + " " + (flair || "")).toLowerCase();

  // Flair-based (WSB flairs are strong signals)
  const bullishFlairs = ["gain", "yolo", "tendies", "dd"];
  const bearishFlairs = ["loss", "loss porn", "bagholding"];
  for (const f of bullishFlairs) if (flair?.toLowerCase().includes(f)) return "bullish";
  for (const f of bearishFlairs) if (flair?.toLowerCase().includes(f)) return "bearish";

  // Expanded keyword lists
  const bullish = [
    "calls", "long", "bull", "moon", "buy", "yolo", "gain", "rocket", "squeeze",
    "breakout", "all in", "all-time high", "ath", "new high", "rally", "rip",
    "to the moon", "going up", "undervalued", "dip buy", "buying the dip",
    "btfd", "loaded up", "accumulating", "upgrade", "beat", "blowout",
    "record revenue", "strong earnings", "outperform", "overweight",
  ];
  const bearish = [
    "puts", "short", "bear", "crash", "sell", "loss", "dump", "inverse",
    "rug", "overvalued", "bubble", "dead cat", "bagholding", "recession",
    "downgrade", "miss", "layoffs", "bankrupt", "fraud", "sec investigation",
    "plunge", "tank", "collapse", "missed earnings", "warning", "fear",
    "capitulation", "blood", "drill", "falling knife", "underweight",
  ];
  const negators = ["sold", "selling", "closed", "exited", "took profit"];

  let score = 0;
  for (const w of bullish) if (lower.includes(w)) score++;
  for (const w of bearish) if (lower.includes(w)) score--;

  // Handle negated context: "sold calls" = bearish, "sold puts" = bullish
  for (const neg of negators) {
    if (lower.includes(`${neg} calls`) || lower.includes(`${neg} my calls`)) score -= 2;
    if (lower.includes(`${neg} puts`) || lower.includes(`${neg} my puts`)) score += 2;
  }

  // Context: "all time high" + question = neutral skepticism, not bullish
  if (lower.includes("?") && score > 0) score = Math.max(0, score - 1);

  return score > 0 ? "bullish" : score < 0 ? "bearish" : "neutral";
}

async function fetchSubreddit(name: string): Promise<RedditPost[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/${name}/hot.json?limit=25`, {
      headers: { "User-Agent": "BAZAAR-StockPerps/1.0" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts: RedditPost[] = [];

    for (const child of data?.data?.children || []) {
      const p = child.data;
      if (!p || p.stickied) continue;

      const tickers = extractTickers(p.title + " " + (p.selftext || "").slice(0, 500));
      // Only include posts that mention tracked stocks or are from stock subreddits
      const isRelevant = tickers.length > 0 || name === "stocks" || name === "options";

      if (isRelevant) {
        posts.push({
          id: p.id,
          subreddit: name,
          title: p.title,
          author: p.author,
          score: p.score,
          numComments: p.num_comments,
          url: `https://reddit.com${p.permalink}`,
          created: p.created_utc,
          flair: p.link_flair_text || "",
          tickers,
          sentiment: guessSentiment(p.title, p.link_flair_text || ""),
        });
      }
    }
    return posts;
  } catch {
    return [];
  }
}

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 120_000) {
    return NextResponse.json(cache.data);
  }

  const allPosts = await Promise.all(SUBREDDITS.map(fetchSubreddit));
  const posts = allPosts.flat().sort((a, b) => b.score - a.score);

  // Compute ticker mention counts + sentiment
  const tickerStats: Record<string, { mentions: number; totalScore: number; bullish: number; bearish: number; neutral: number }> = {};
  for (const post of posts) {
    for (const t of post.tickers) {
      if (!tickerStats[t]) tickerStats[t] = { mentions: 0, totalScore: 0, bullish: 0, bearish: 0, neutral: 0 };
      tickerStats[t].mentions++;
      tickerStats[t].totalScore += post.score;
      tickerStats[t][post.sentiment]++;
    }
  }

  // Sort by mentions
  const trending = Object.entries(tickerStats)
    .map(([symbol, stats]) => ({
      symbol,
      ...stats,
      sentimentRatio: stats.mentions > 0 ? (stats.bullish - stats.bearish) / stats.mentions : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);

  const result = {
    posts: posts.slice(0, 50),
    trending,
    totalPosts: posts.length,
    subreddits: SUBREDDITS,
    fetchedAt: new Date().toISOString(),
  };

  cache = { data: result, ts: Date.now() };
  return NextResponse.json(result);
}
