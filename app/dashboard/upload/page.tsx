"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { parseCSV, parseExcel, ParsedTransaction } from "@/lib/utils/file-parser";

interface Bank {
  id: string;
  name: string;
  color: string;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function UploadPage() {
  const { user, loading } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; categorized: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/banks")
      .then((r) => r.json())
      .then((d) => setBanks(d.banks ?? []));
  }, [user]);

  const processFile = async (file: File) => {
    setParsing(true);
    setParseError(null);
    setTransactions([]);

    const ext = file.name.split(".").pop()?.toLowerCase();

    let result;
    if (ext === "csv") {
      result = await parseCSV(file);
    } else if (ext === "xlsx" || ext === "xls") {
      result = await parseExcel(file);
    } else {
      setParsing(false);
      setParseError("Format neacceptat. Folosește CSV sau Excel (.xlsx, .xls).");
      return;
    }

    setParsing(false);

    if (!result.success || result.transactions.length === 0) {
      setParseError(result.error ?? "Nu s-au găsit tranzacții în fișier.");
      return;
    }

    setTransactions(result.transactions);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      setParseError("Doar fișiere CSV sau Excel (.xlsx, .xls) sunt acceptate.");
      return;
    }
    setSelectedFile(file);
    setParseError(null);
    setTransactions([]);
    await processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setTransactions([]);
    setParseError(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (transactions.length === 0 || !selectedBank) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, bankId: selectedBank }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? "Eroare la import.");
      } else {
        setImportResult({ imported: data.imported, categorized: data.categorized });
        setTransactions([]);
        setSelectedFile(null);
        setSelectedBank("");
      }
    } catch {
      setParseError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setImporting(false);
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
            {parsing ? (
              <div>
                <p className="text-4xl mb-3 animate-pulse">⏳</p>
                <p className="font-semibold text-teal-700">Se procesează fișierul...</p>
                <p className="text-sm text-gray-500 mt-1">Te rugăm să aștepți</p>
              </div>
            ) : selectedFile ? (
              <div>
                <p className="text-4xl mb-3">📄</p>
                <p className="font-semibold text-teal-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
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

          {/* Eroare */}
          {parseError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">⚠️ {parseError}</p>
            </div>
          )}

          {/* Succes parsare */}
          {transactions.length > 0 && (
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <p className="text-sm font-medium" style={{ color: "#0f766e" }}>
                ✅ {transactions.length} tranzacții detectate. Selectează banca și apasă Import.
              </p>
            </div>
          )}

          {/* Succes import */}
          {importResult && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-sm font-medium" style={{ color: "#15803d" }}>
                🎉 Import reușit! {importResult.imported} tranzacții salvate
                {importResult.categorized > 0 && `, ${importResult.categorized} categorizate automat`}.
              </p>
              <a href="/dashboard/transactions" className="text-sm underline mt-1 block" style={{ color: "#15803d" }}>
                Vezi tranzacțiile →
              </a>
            </div>
          )}

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
                onClick={handleImport}
                disabled={transactions.length === 0 || !selectedBank || parsing || importing}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-8 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importing ? "⏳ Se importă..." : `📤 ${transactions.length > 0 ? `Importă ${transactions.length} tranzacții` : "Importă tranzacții"}`}
              </button>
            </div>
          </div>

          {!selectedFile && !parsing && (
            <p className="text-xs text-gray-400 mt-3">Selectează un fișier și o bancă pentru a continua.</p>
          )}
        </div>

        {/* Preview table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Preview tranzacții</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {transactions.length} rânduri
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Dată</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Descriere</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Sumă</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Valută</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-gray-400 text-sm">
                    {parsing ? "Se procesează..." : "Încarcă un fișier pentru a vedea preview-ul tranzacțiilor."}
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 10).map((t, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-700">{t.date}</td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{t.description}</td>
                    <td className={`px-5 py-3 text-sm font-medium text-right`}>
                      <span style={{ color: t.amount >= 0 ? "#16a34a" : "#dc2626" }}>
                        {t.amount >= 0 ? "+" : ""}{formatAmount(t.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{t.currency ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Footer tabel */}
          {transactions.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">{transactions.length} tranzacții</span> găsite în fișier
                {transactions.length > 10 && (
                  <span className="text-gray-400"> · ...și încă {transactions.length - 10} tranzacții</span>
                )}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
