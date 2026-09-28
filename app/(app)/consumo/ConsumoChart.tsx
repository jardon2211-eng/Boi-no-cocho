"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ConsumoChart({ data, produtos }: { data: any[]; produtos: string[] }) {
  const cores = ["#4c7a3e", "#6e9a5e", "#c98a2c", "#3a6ea5", "#a5473a", "#8a4ca5"];

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm text-center px-6">
        Nenhum histórico encontrado. Aprove uma dieta em Formulação para registrar o consumo.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {produtos.map((p, i) => (
          <Line key={p} type="monotone" dataKey={p} stroke={cores[i % cores.length]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
