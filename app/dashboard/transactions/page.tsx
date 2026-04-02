"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  bankId: string | null;
  categoryId: string | null;
  bankName: string | null;
  bankColor: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
}

interface Bank {
  id: string;
  name: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  // Filtre
  const [search, setSearch] = useState("");
  const [filterBank, setFilterBank] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Formular adăugare
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCurrency, setNewCurrency] = useState("MDL");
  const [newBankId, setNewBankId] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchBanks(), fetchCategories()]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchTransactions();
  }, [user, search, filterBank, filterCategory, filterFrom, filterTo]);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterBank) params.set("bankId", filterBank);
      if (filterCategory) params.set("categoryId", filterCategory);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
    } catch {
      toast.error("Nu s-au putut încărca tranzacțiile.");
    } finally {
      setTxLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      const data = await res.json();
      setBanks(data.banks ?? []);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          description: newDescription,
          amount: parseFloat(newAmount),
          currency: newCurrency,
          bankId: newBankId || null,
          categoryId: newCategoryId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Tranzacție adăugată!");
      setShowForm(false);
      setNewDate(new Date().toISOString().slice(0, 10));
      setNewDescription("");
      setNewAmount("");
      setNewCurrency("MDL");
      setNewBankId("");
      setNewCategoryId("");
      fetchTransactions();
    } catch {
      toast.error("Eroare la adăugare.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ștergi această tranzacție?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Eroare la ștergere."); return; }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tranzacție ștearsă!");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterBank("");
    setFilterCategory("");
    setFilterFrom("");
    setFilterTo("");
  };

  const hasFilters = search || filterBank || filterCategory || filterFrom || filterTo;

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
            <h1 className="text-2xl font-bold text-teal-700">💳 Tranzacții</h1>
            <p className="text-sm text-gray-600 mt-0.5">Toate tranzacțiile tale</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-teal-600 hover:underline">
              ← Dashboard
            </a>
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm"
            >
              + Adaugă tranzacție
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Formular adăugare */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tranzacție nouă</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dată</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="ex: Salary, Mega Image, Netflix..."
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumă <span className="text-gray-400 font-normal">(negativ = cheltuială)</span>
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="ex: 5000 sau -45.50"
                  step="0.01"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valută</label>
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                  placeholder="MDL"
                  maxLength={5}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bancă</label>
                <select
                  value={newBankId}
                  onChange={(e) => setNewBankId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">— Fără bancă —</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">— Fără categorie —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-5 py-2 rounded-lg transition-all disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition-all"
              >
                Anulează
              </button>
            </div>
          </form>
        )}

        {/* Filtre */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Caută descriere..."
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="">Toate băncile</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="">Toate categoriile</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                ✕ Resetează
              </button>
            )}
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          {txLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3">💳</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {hasFilters ? "Niciun rezultat" : "Nu ai tranzacții încă"}
              </h3>
              <p className="text-gray-600 text-sm">
                {hasFilters ? "Încearcă să modifici filtrele." : "Adaugă prima tranzacție sau importă un extras bancar."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Dată</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Descriere</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sumă</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Bancă</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Categorie</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-right whitespace-nowrap">
                      <span style={{ color: tx.amount >= 0 ? "#16a34a" : "#dc2626" }}>
                        {tx.amount >= 0 ? "+" : "-"}{formatAmount(tx.amount)}
                      </span>{" "}
                      <span className="text-gray-500 font-normal text-xs">{tx.currency}</span>
                    </td>
                    <td className="px-5 py-3">
                      {tx.bankName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tx.bankColor ?? "#6366f1" }} />
                          <span className="text-sm text-gray-700">{tx.bankName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {tx.categoryName ? (
                        <span className="text-sm text-gray-700">{tx.categoryIcon} {tx.categoryName}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-all"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer cu numărul de rezultate */}
          {!txLoading && transactions.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
              {transactions.length} tranzacți{transactions.length === 1 ? "e" : "i"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
