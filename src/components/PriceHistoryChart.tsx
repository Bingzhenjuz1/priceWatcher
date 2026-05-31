"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PriceHistoryChart({
  data
}: {
  data: { collectedAt: string | Date; price: number }[];
}) {
  const chartData = data.map((item) => ({
    time: new Date(item.collectedAt).toLocaleString("zh-CN"),
    price: item.price / 100
  }));

  return (
    <div className="h-72 rounded-md border border-line bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="time" hide />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#157f72" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
