import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#2563eb", "#22d3ee"];

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/statistics/")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div>Caricamento statistiche...</div>;

  // Pie chart data
  const pieData = [
    { name: "Utente", value: stats.user_messages },
    { name: "Bot", value: stats.bot_messages },
  ];

  // Cards style
  const card = (label: string, value: React.ReactNode) => (
    <div className="bg-white dark:bg-zinc-900 shadow rounded p-4 flex-1 min-w-[160px] text-center">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Statistiche Chatbot</h3>
      {/* Cards */}
      <div className="flex flex-wrap gap-4 mb-8">
        {card("Conversazioni totali", stats.total_conversations)}
        {card("Messaggi totali", stats.total_messages)}
        {card("Media msg/conversazione", stats.avg_messages_per_conversation.toFixed(2))}
        {card("Ultima attività", stats.last_activity ? new Date(stats.last_activity).toLocaleString() : "-")}
        {card("Conversazione più lunga", stats.longest_conversation ? `${stats.longest_conversation.messages} msg (ID ${stats.longest_conversation.id})` : "-")}
      </div>
      {/* Grafici */}
      <div className="flex flex-wrap gap-8">
        {/* Line chart: Messaggi per giorno */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded p-4 flex-1 min-w-[320px]">
          <div className="font-semibold mb-2">Messaggi per giorno (ultimi 14 giorni)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.messages_per_day} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Line chart: Conversazioni per giorno */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded p-4 flex-1 min-w-[320px]">
          <div className="font-semibold mb-2">Conversazioni per giorno (ultimi 14 giorni)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.conversations_per_day} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="conversations" stroke="#22d3ee" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Pie chart: User vs Bot */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded p-4 flex-1 min-w-[220px] flex flex-col items-center justify-center">
          <div className="font-semibold mb-2">Messaggi: Utente vs Bot</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
