"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

interface PieEntry {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BarEntry {
  month: string;
  Venituri: number;
  Cheltuieli: number;
}

const PERIODS = [
  { value: "current-month", label: "Luna curentă" },
  { value: "prev-month", label: "Luna precedentă" },
  { value: "3-months", label: "Ultimele 3 luni" },
  { value: "6-months", label: "Ultimele 6 luni" },
  { value: "all", label: "Tot" },
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const [period, setPeriod] = useState("current-month");
  const [pieData, setPieData] = useState<PieEntry[]>([]);
  const [barData, setBarData] = useState<BarEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setPieData(d.pieData ?? []);
        setBarData(d.barData ?? []);
      })
      .finally(() => setDataLoading(false));
  }, [user, period]);

  const totalExpenses = pieData.reduce((sum, d) => sum + d.value, 0);
  const totalIncome = barData.reduce((sum, d) => sum + d.Venituri, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">📊 Rapoarte</h1>
            <p className="text-sm text-gray-600 mt-0.5">Analiza cheltuielilor și veniturilor tale</p>
          </div>
          <a href="/dashboard" className="text-sm text-teal-600 hover:underline">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Filtru perioadă */}
        <div className="flex items-center gap-2 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.value
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white/80 text-gray-600 hover:bg-white border border-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="text-sm text-gray-400 ml-2">
            {period === "current-month" && (() => {
              const now = new Date();
              return now.toLocaleString("ro-RO", { month: "long", year: "numeric" });
            })()}
            {period === "prev-month" && (() => {
              const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
              return prev.toLocaleString("ro-RO", { month: "long", year: "numeric" });
            })()}
            {period === "3-months" && (() => {
              const from = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
              const to = new Date();
              return `${from.toLocaleString("ro-RO", { month: "short" })} – ${to.toLocaleString("ro-RO", { month: "short", year: "numeric" })}`;
            })()}
            {period === "6-months" && (() => {
              const from = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
              const to = new Date();
              return `${from.toLocaleString("ro-RO", { month: "short" })} – ${to.toLocaleString("ro-RO", { month: "short", year: "numeric" })}`;
            })()}
          </span>
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-2xl shadow-sm h-80 animate-pulse" />
            <div className="bg-white/80 rounded-2xl shadow-sm h-80 animate-pulse" />
          </div>
        ) : pieData.length === 0 && barData.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-semibold text-gray-800">Nicio tranzacție în perioada selectată</p>
            <p className="text-sm text-gray-500 mt-1">Încearcă o altă perioadă sau importă tranzacții.</p>
          </div>
        ) : (
          <>
            {/* Sumar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">📉 Total cheltuieli</p>
                <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>
                  -{formatAmount(totalExpenses)} MDL
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">📈 Total venituri</p>
                <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
                  +{formatAmount(totalIncome)} MDL
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">💰 Balanță</p>
                <p className="text-2xl font-bold" style={{ color: totalIncome - totalExpenses >= 0 ? "#16a34a" : "#dc2626" }}>
                  {totalIncome - totalExpenses >= 0 ? "+" : "-"}{formatAmount(Math.abs(totalIncome - totalExpenses))} MDL
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Pie chart */}
              {pieData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Cheltuieli pe categorii</h2>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        dataKey="value"
                        label={({ percent }) =>
                          percent ? `${(percent * 100).toFixed(0)}%` : ""
                        }
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${formatAmount(value)} MDL`, ""]}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "#374151", fontSize: "12px" }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar chart */}
              {barData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Venituri vs Cheltuieli pe luni</h2>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip
                        formatter={(value: number) => [`${formatAmount(value)} MDL`, ""]}
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "#374151", fontSize: "12px" }}>{value}</span>
                        )}
                      />
                      <Bar dataKey="Venituri" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Cheltuieli" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Tabel detaliat categorii */}
            {pieData.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Detaliu pe categorii</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Categorie</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Total</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((entry, i) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-gray-700">{entry.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-right" style={{ color: "#dc2626" }}>
                          -{formatAmount(entry.value)} MDL
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500 text-right">
                          {totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
