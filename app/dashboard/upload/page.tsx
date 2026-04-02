"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Bank {
  id: string;
  name: string;
  color: string;
}

export default function UploadPage() {
  const { user, loading } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/banks")
      .then((r) => r.json())
      .then((d) => setBanks(d.banks ?? []));
  }, [user]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      alert("Doar fișiere CSV sau Excel (.xlsx, .xls) sunt acceptate.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">📂 Import extras bancar</h1>
            <p className="text-sm text-gray-600 mt-0.5">Importă tranzacții din fișiere CSV sau Excel</p>
          </div>
          <a href="/dashboard" className="text-sm text-teal-600 hover:underline">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Upload card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Selectează fișierul</h2>

          {/* Drag & drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-teal-400 bg-teal-50"
                : selectedFile
                ? "border-teal-300 bg-teal-50/50"
                : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <div>
                <p className="text-4xl mb-3">📄</p>
                <p className="font-semibold text-teal-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="mt-3 text-xs text-red-400 hover:text-red-600"
                >
                  ✕ Elimină fișierul
                </button>
              </div>
            ) : (
              <div>
                <p className="text-5xl mb-4">📁</p>
                <p className="text-gray-700 font-medium">Trage fișierul aici sau click pentru a selecta</p>
                <p className="text-sm text-gray-500 mt-2">Formate acceptate: CSV, Excel (.xlsx, .xls)</p>
              </div>
            )}
          </div>

          {/* Selectare bancă + buton upload */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bancă sursă</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">— Selectează banca —</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                disabled={!selectedFile || !selectedBank}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-8 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                📤 Upload și procesează
              </button>
            </div>
          </div>

          {!selectedFile && (
            <p className="text-xs text-gray-400 mt-3">Selectează un fișier și o bancă pentru a continua.</p>
          )}
        </div>

        {/* Preview table — gol deocamdată */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Preview tranzacții</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">0 rânduri</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Dată</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Descriere</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sumă</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Valută</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Categorie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-gray-400 text-sm">
                  Încarcă un fișier pentru a vedea preview-ul tranzacțiilor.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
