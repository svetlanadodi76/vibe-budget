"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, supabase } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error("Nu s-au putut încărca datele financiare.");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Rezumat financiar</h2>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleString("ro-RO", { month: "long", year: "numeric" })}
          </p>
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
                {formatAmount(stats?.totalBalance ?? 0)} {stats?.currency ?? "RON"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Toate tranzacțiile</p>
          </div>

          {/* Card 2: Venituri luna asta */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📈</span>
              <p className="text-sm font-medium text-gray-600">Venituri luna asta</p>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                <span style={{ color: "#16a34a" }}>+{formatAmount(stats?.incomeThisMonth ?? 0)}</span>{" "}
                {stats?.currency ?? "RON"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Intrări de bani</p>
          </div>

          {/* Card 3: Cheltuieli luna asta */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📉</span>
              <p className="text-sm font-medium text-gray-600">Cheltuieli luna asta</p>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                <span style={{ color: "#dc2626" }}>-{formatAmount(stats?.expensesThisMonth ?? 0)}</span>{" "}
                {stats?.currency ?? "RON"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Ieșiri de bani</p>
          </div>
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
