"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

const PRESETS = [
  { code: "MDL", name: "Leu moldovenesc", symbol: "lei" },
  { code: "RON", name: "Leu românesc", symbol: "RON" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

export default function CurrenciesPage() {
  const { user, loading } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCurrencies();
  }, [user]);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch("/api/currencies");
      const data = await res.json();
      setCurrencies(data.currencies ?? []);
    } catch {
      toast.error("Nu s-au putut încărca valutele.");
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, name: newName, symbol: newSymbol }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCurrencies((prev) => [...prev, data.currency]);
      setNewCode("");
      setNewName("");
      setNewSymbol("");
      setShowAddForm(false);
      toast.success("Valută adăugată!");
    } catch {
      toast.error("Eroare la adăugare.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreset = async (preset: typeof PRESETS[number]) => {
    if (currencies.some((c) => c.code === preset.code)) {
      toast.info(`${preset.code} există deja.`);
      return;
    }
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCurrencies((prev) => [...prev, data.currency]);
      toast.success(`${preset.code} adăugat!`);
    } catch {
      toast.error("Eroare la adăugare.");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Ștergi valuta "${code}"?`)) return;
    try {
      const res = await fetch(`/api/currencies/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Eroare la ștergere."); return; }
      setCurrencies((prev) => prev.filter((c) => c.id !== id));
      toast.success("Valută ștearsă!");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">💱 Valutele mele</h1>
            <p className="text-sm text-gray-600 mt-0.5">Gestionează valutele folosite în tranzacții</p>
          </div>
          <a href="/dashboard" className="text-sm text-teal-600 hover:underline">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Preset-uri */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Adaugă rapid:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const exists = currencies.some((c) => c.code === preset.code);
              return (
                <button
                  key={preset.code}
                  onClick={() => handlePreset(preset)}
                  disabled={exists}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    exists
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-default"
                      : "border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 active:scale-95"
                  }`}
                >
                  {preset.code} {exists ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabel valute */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-4">
          {currenciesLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : currencies.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-4xl mb-3">💱</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Nu ai valute adăugate</h3>
              <p className="text-gray-600 text-sm">Adaugă prima valută pentru a o folosi în tranzacții.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Cod</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Nume</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Simbol</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency) => (
                  <tr key={currency.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-bold text-gray-900 text-sm">{currency.code}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-700 text-sm">{currency.name}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-700 text-sm">{currency.symbol}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(currency.id, currency.code)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all"
                      >
                        🗑️ Șterge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formular adăugare */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Valută nouă</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cod</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="EUR"
                  required
                  maxLength={5}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Euro"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Simbol</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="€"
                  maxLength={5}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-5 py-2 rounded-lg transition-all disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewCode(""); setNewName(""); setNewSymbol(""); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition-all"
              >
                Anulează
              </button>
            </div>
          </form>
        )}

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-gray-300 hover:border-teal-400 text-gray-500 hover:text-teal-600 font-medium py-3 rounded-2xl transition-all"
          >
            + Adaugă valută
          </button>
        )}
      </main>
    </div>
  );
}
