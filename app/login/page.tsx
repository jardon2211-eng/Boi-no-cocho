"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos."
        : error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐂</div>
          <h1 className="text-2xl font-bold text-brand-700">Boi no Cocho</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão completa de confinamento</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <GoogleButton />
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px bg-gray-200 flex-1" />
            ou entre com e-mail
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <div>
            <label className="label-field">E-mail</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="label-field">Senha</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <p className="text-center text-sm">
            <Link href="/esqueci-senha" className="text-brand-600 font-semibold hover:underline">
              Esqueci minha senha
            </Link>
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Ainda não tem conta?{" "}
          <Link href="/comprar" className="text-brand-600 font-semibold hover:underline">
            Comprar acesso
          </Link>
        </p>
      </div>
    </div>
  );
}
