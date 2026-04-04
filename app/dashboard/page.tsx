"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalBalance: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  currency: string;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toMonthValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTHS = (() => {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      value: toMonthValue(d),
      label: d.toLocaleString("ro-RO", { month: "long", year: "numeric" }),
    });
  }
  return result;
})();

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, supabase } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(new Date()));

  useEffect(() => {
    if (!user?.id) return;
    setStatsLoading(true);
    const controller = new AbortController();
    fetch(`/api/dashboard/stats?month=${selectedMonth}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatsLoading(false);
      });
    return () => controller.abort();
  }, [user?.id, selectedMonth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const currentIndex = MONTHS.findIndex((m) => m.value === selectedMonth);

  const goToPrev = () => {
    if (currentIndex < MONTHS.length - 1) setSelectedMonth(MONTHS[currentIndex + 1].value);
  };
  const goToNext = () => {
    if (currentIndex > 0) setSelectedMonth(MONTHS[currentIndex - 1].value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-teal-700">💰 Vibe Budget</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Bună, <strong>{user?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              Ieși din cont
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Rezumat financiar</h2>
          {/* Selector lună */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              disabled={currentIndex >= MONTHS.length - 1}
              className="w-8 h-8 rounded-lg bg-white/80 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-gray-600"
            >
              ‹
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white/80 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={goToNext}
              disabled={currentIndex <= 0}
              className="w-8 h-8 rounded-lg bg-white/80 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-gray-600"
            >
              ›
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Sold total */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <p className="text-sm font-medium text-gray-600">Sold total</p>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className={`text-3xl font-bold ${stats && stats.totalBalance >= 0 ? "text-teal-600" : "text-red-600"}`}>
                {formatAmount(stats?.totalBalance ?? 0)} {stats?.currency ?? "MDL"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Toate tranzacțiile</p>
          </div>

          {/* Card 2: Venituri */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📈</span>
              <p className="text-sm font-medium text-gray-600">Venituri</p>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                <span style={{ color: "#16a34a" }}>+{formatAmount(stats?.incomeThisMonth ?? 0)}</span>{" "}
                {stats?.currency ?? "MDL"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Intrări de bani</p>
          </div>

          {/* Card 3: Cheltuieli */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📉</span>
              <p className="text-sm font-medium text-gray-600">Cheltuieli</p>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                <span style={{ color: "#dc2626" }}>-{formatAmount(stats?.expensesThisMonth ?? 0)}</span>{" "}
                {stats?.currency ?? "MDL"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Ieșiri de bani</p>
          </div>
        </div>

        {/* Navigație rapidă */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <a href="/dashboard/banks" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <span className="text-3xl">🏦</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Bănci</p>
              <p className="text-sm text-gray-500">Gestionează conturile</p>
            </div>
          </a>
          <a href="/dashboard/categories" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <span className="text-3xl">🗂️</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Categorii</p>
              <p className="text-sm text-gray-500">Venituri și cheltuieli</p>
            </div>
          </a>
          <a href="/dashboard/currencies" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <span className="text-3xl">💱</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Valute</p>
              <p className="text-sm text-gray-500">Gestionează valutele</p>
            </div>
          </a>
          <a href="/dashboard/transactions" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Tranzacții</p>
              <p className="text-sm text-gray-500">Vezi toate tranzacțiile</p>
            </div>
          </a>
          <a href="/dashboard/upload" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <span className="text-3xl">📂</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Import</p>
              <p className="text-sm text-gray-500">CSV / Excel</p>
            </div>
          </a>
        </div>

        {/* Empty state */}
        {!statsLoading && stats?.totalBalance === 0 && stats?.incomeThisMonth === 0 && (
          <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <p className="text-4xl mb-4">📁</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nu ai tranzacții încă
            </h3>
            <p className="text-gray-600">
              Importă un extras bancar CSV sau Excel pentru a vedea statisticile.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
