import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const COLORS = {
  error: "#ff4d4d",
  warn: "#ffa500",
  info: "#007bff",
  debug: "#28a745"
};

export default function LogAnalytics({ logs }) {
  // Aggregate log counts by level
  const counts = logs.reduce((acc, log) => {
    const lvl = log.level.toLowerCase();
    acc[lvl] = (acc[lvl] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for the chart
  const data = Object.keys(counts).map(key => ({
    name: key.toUpperCase(),
    value: counts[key],
    color: COLORS[key] || "#8884d8"
  }));

  return (
    <div className="h-[250px] w-full bg-black/20 border border-white/10 rounded-xl p-4 backdrop-blur-md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
          <YAxis stroke="#666" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#111", border: "1px solid #333", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}