"use client";

function sentimentColor(score: number | null): string {
  if (score === null) return "text-neutral-500";
  if (score > 0.3) return "text-green-400";
  if (score > 0) return "text-yellow-400";
  if (score > -0.3) return "text-orange-400";
  return "text-red-400";
}

function platformBadge(platform: string) {
  const colors: Record<string, string> = {
    telegram: "bg-blue-500/20 text-blue-400",
    discord: "bg-indigo-500/20 text-indigo-400",
    twitter: "bg-sky-500/20 text-sky-400",
    reddit: "bg-orange-500/20 text-orange-400",
    rss: "bg-neutral-500/20 text-neutral-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[platform] ?? colors.rss}`}>
      {platform}
    </span>
  );
}

export function LiveFeed({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return <div className="text-neutral-500 text-center py-8">Waiting for messages...</div>;
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {messages.map((msg, i) => (
        <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-[#1a1a1a] text-sm">
          <div className={`font-mono w-12 text-right ${sentimentColor(msg.sentiment)}`}>
            {msg.sentiment !== null ? (msg.sentiment >= 0 ? "+" : "") + msg.sentiment.toFixed(2) : "---"}
          </div>
          <div className="flex-shrink-0">{platformBadge(msg.platform)}</div>
          <div className="flex-1 min-w-0">
            <span className="text-neutral-400">@{msg.author}: </span>
            <span className="text-neutral-200">{msg.content}</span>
          </div>
          <div className="text-neutral-600 text-xs flex-shrink-0">
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
