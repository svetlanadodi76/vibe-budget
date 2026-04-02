"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  isSystemCategory: boolean;
}

const ICONS = ["🍔", "🚗", "🏠", "💰", "🎮", "📱", "✈️", "🎵", "💊", "🛍️", "📚", "☕", "🏥", "💻", "🎁", "🐶", "⚽", "🧾", "💵", "📺", "🔄", "💸", "📥", "🍽️"];

const COLORS = [
  { label: "Teal", value: "#0d9488" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Orange", value: "#f97316" },
  { label: "Verde", value: "#16a34a" },
  { label: "Roșu", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
];

export default function CategoriesPage() {
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Formular adăugare
  const [showAddForm, setShowAddForm] = useState<"income" | "expense" | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [newIcon, setNewIcon] = useState("");

  // Formular editare
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      toast.error("Nu s-au putut încărca categoriile.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddForm) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: showAddForm, color: newColor, icon: newIcon || "📁" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCategories((prev) => [...prev, data.category]);
      setNewName("");
      setNewColor("#6366f1");
      setNewIcon("");
      setShowAddForm(null);
      toast.success("Categorie adăugată!");
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
      const res = await fetch(`/api/categories/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor, icon: editIcon }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCategories((prev) => prev.map((c) => (c.id === editId ? data.category : c)));
      setEditId(null);
      toast.success("Categorie actualizată!");
    } catch {
      toast.error("Eroare la editare.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ștergi categoria "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Eroare la ștergere."); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categorie ștearsă!");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditIcon(cat.icon);
    setShowAddForm(null);
  };

  const openAddForm = (type: "income" | "expense") => {
    setShowAddForm(type);
    setEditId(null);
    setNewName("");
    setNewColor("#6366f1");
    setNewIcon("");
  };

  const income = categories.filter((c) => c.type === "income");
  const expenses = categories.filter((c) => c.type === "expense");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    );
  }

  const renderTable = (type: "income" | "expense", title: string, emoji: string, list: Category[]) => (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{emoji} {title}</h2>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-3">
        {categoriesLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Nu ai categorii de {type === "income" ? "venituri" : "cheltuieli"} încă.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Icon</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Nume</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Tip</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((cat) => (
                editId === cat.id ? (
                  <tr key={cat.id}>
                    <td colSpan={4} className="px-4 py-3">
                      <form onSubmit={handleEdit} className="flex flex-wrap gap-2 items-center">
                        <div className="flex flex-wrap gap-1">
                          {ICONS.map((ic) => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setEditIcon(ic)}
                              className={`w-8 h-8 rounded-lg text-base transition-all hover:scale-110 ${editIcon === ic ? "bg-teal-100 ring-2 ring-teal-500" : "hover:bg-gray-100"}`}
                            >
                              {ic}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          className="border border-gray-300 rounded-lg px-3 py-1.5 flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                        <div className="flex gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setEditColor(c.value)}
                              title={c.label}
                              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                              style={{
                                backgroundColor: c.value,
                                borderColor: editColor === c.value ? "#111827" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-3 py-1.5 rounded-lg text-sm disabled:opacity-60"
                        >
                          {saving ? "..." : "Salvează"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm"
                        >
                          Anulează
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xl">{cat.icon}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        cat.isSystemCategory
                          ? "bg-gray-100 text-gray-500"
                          : "bg-teal-50 text-teal-700"
                      }`}>
                        {cat.isSystemCategory ? "sistem" : "personal"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2.5 py-1 rounded-lg hover:bg-teal-50 transition-all"
                        >
                          ✏️ Editează
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all"
                        >
                          🗑️ Șterge
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formular adăugare */}
      {showAddForm === type && (
        <form onSubmit={handleAdd} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorie nouă</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={type === "income" ? "ex: Salariu, Dividende..." : "ex: Mâncare, Transport..."}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Icon</label>
              <div className="flex flex-wrap gap-1">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setNewIcon(ic)}
                    className={`w-9 h-9 rounded-lg text-lg transition-all hover:scale-110 ${newIcon === ic ? "bg-teal-100 ring-2 ring-teal-500" : "hover:bg-gray-100"}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewColor(c.value)}
                  title={c.label}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: newColor === c.value ? "#111827" : "transparent",
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
                onClick={() => setShowAddForm(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all text-sm"
              >
                Anulează
              </button>
            </div>
          </div>
        </form>
      )}

      {showAddForm !== type && (
        <button
          onClick={() => openAddForm(type)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-teal-400 text-gray-500 hover:text-teal-600 font-medium py-2.5 rounded-2xl transition-all text-sm"
        >
          + Adaugă {type === "income" ? "categorie venit" : "categorie cheltuială"}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">🗂️ Categorii</h1>
            <p className="text-sm text-gray-600 mt-0.5">Gestionează categoriile de tranzacții</p>
          </div>
          <a href="/dashboard" className="text-sm text-teal-600 hover:underline">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderTable("income", "Venituri", "📈", income)}
          {renderTable("expense", "Cheltuieli", "📉", expenses)}
        </div>
      </main>
    </div>
  );
}
