"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nativeCurrency, setNativeCurrency] = useState("RON");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pasul 1: Creează contul în Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error("Nu s-a putut crea contul. Încearcă din nou.");
        return;
      }

      // Pasul 2: Creează profilul în tabela public.users
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.user.id, email, name, nativeCurrency }),
      });

      if (!res.ok) {
        toast.error("Contul a fost creat, dar profilul nu. Contactează suportul.");
        return;
      }

      toast.success("Cont creat cu succes!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">💰 Vibe Budget</h1>
            <p className="text-gray-600 mt-2">Creează contul tău gratuit</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tău"
                required
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@exemplu.com"
                required
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                required
                minLength={6}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuta principală
              </label>
              <select
                value={nativeCurrency}
                onChange={(e) => setNativeCurrency(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="RON">RON — Leu românesc</option>
                <option value="MDL">MDL — Leu moldovenesc</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60"
            >
              {loading ? "Se creează contul..." : "Creează cont"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Ai deja cont?{" "}
            <Link href="/login" className="text-teal-600 hover:underline font-medium">
              Intră în cont
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
