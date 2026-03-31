"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Bank {
  id: string;
  name: string;
  color: string;
}

const COLORS = [
  { label: "Teal", value: "#0d9488" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Orange", value: "#f97316" },
  { label: "Verde", value: "#16a34a" },
  { label: "Roșu", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
];

export default function BanksPage() {
  const { user, loading } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);

  // Formular adăugare
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");

  // Formular editare
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchBanks();
  }, [user]);

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      const data = await res.json();
      setBanks(data.banks ?? []);
    } catch {
      toast.error("Nu s-au putut încărca băncile.");
    } finally {
      setBanksLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, color: newColor }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setBanks((prev) => [...prev, data.bank]);
      setNewName("");
      setNewColor("#6366f1");
      setShowAddForm(false);
      toast.success("Bancă adăugată!");
    } catch {
      toast.error("Eroare la adăugare.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/banks/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setBanks((prev) => prev.map((b) => (b.id === editId ? data.bank : b)));
      setEditId(null);
      toast.success("Bancă actualizată!");
    } catch {
      toast.error("Eroare la editare.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ștergi banca "${name}"?`)) return;
    try {
      const res = await fetch(`/api/banks/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Eroare la ștergere."); return; }
      setBanks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bancă ștearsă!");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

  const startEdit = (bank: Bank) => {
    setEditId(bank.id);
    setEditName(bank.name);
    setEditColor(bank.color);
    setShowAddForm(false);
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">🏦 Băncile mele</h1>
            <p className="text-sm text-gray-600 mt-0.5">Gestionează conturile bancare</p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-teal-600 hover:underline"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Buton adaugă */}
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditId(null); }}
            className="mb-6 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-lg transition-all"
          >
            + Adaugă bancă
          </button>
        )}

        {/* Formular adăugare */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bancă nouă</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numele băncii</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Maib, Revolut, Victoriabank..."
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Culoare</label>
                <div className="flex gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      title={c.label}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.value,
                        borderColor: newColor === c.value ? "#111827" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-5 py-2 rounded-lg transition-all disabled:opacity-60"
                >
                  {saving ? "Se salvează..." : "Salvează"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewName(""); setNewColor("#6366f1"); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition-all"
                >
                  Anulează
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Lista bănci */}
        {banksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : banks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-10 text-center">
            <p className="text-4xl mb-3">🏦</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nu ai bănci adăugate</h3>
            <p className="text-gray-600 text-sm">Adaugă prima ta bancă pentru a începe.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map((bank) => (
              <div key={bank.id}>
                {/* Card bancă */}
                {editId !== bank.id && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: bank.color }}
                      />
                      <span className="font-medium text-gray-900">{bank.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(bank)}
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all"
                      >
                        ✏️ Editează
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id, bank.name)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        🗑️ Șterge
                      </button>
                    </div>
                  </div>
                )}

                {/* Formular editare inline */}
                {editId === bank.id && (
                  <form onSubmit={handleEdit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Editează banca</h2>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex gap-3">
                        {COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setEditColor(c.value)}
                            title={c.label}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                              backgroundColor: c.value,
                              borderColor: editColor === c.value ? "#111827" : "transparent",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-60 text-sm"
                        >
                          {saving ? "Se salvează..." : "Salvează"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all text-sm"
                        >
                          Anulează
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
