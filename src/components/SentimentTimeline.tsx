"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { SentimentPoint } from "@/lib/api";

export function SentimentTimeline({ data }: { data: SentimentPoint[] }) {
  if (!data.length) {
    return <div className="text-neutral-500 text-center py-12">No sentiment data yet</div>;
  }

  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="time" stroke="#737373" fontSize={12} />
        <YAxis domain={[-1, 1]} stroke="#737373" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "#141414", border: "1px solid #262626", borderRadius: 8 }}
          labelStyle={{ color: "#a3a3a3" }}
        />
        <ReferenceLine y={0} stroke="#404040" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="avg_sentiment"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#06b6d4" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
