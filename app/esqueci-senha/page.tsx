"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    setLoading(false);
    if (error) {
      setErro(
        error.message.toLowerCase().includes("rate")
          ? "Muitas tentativas. Aguarde alguns minutos e tente de novo."
          : "Não foi possível enviar agora. Tente de novo em instantes."
      );
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐂</div>
          <h1 className="text-2xl font-bold text-brand-700">Redefinir senha</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enviamos um link para você escolher uma nova senha
          </p>
        </div>

        {enviado ? (
          <div className="card space-y-3 text-center">
            <p className="text-sm text-gray-700">
              Se existir uma conta com <strong>{email}</strong>, o link chega em
              alguns minutos. Confira também o spam e a aba Promoções.
            </p>
            <p className="text-xs text-gray-500">
              Abra o link no mesmo aparelho e navegador em que pediu.
            </p>
            <Link href="/login" className="btn-primary w-full block">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="label-field">E-mail da compra</label>
              <input
                type="email"
                required
                autoFocus
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        {!enviado && (
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Voltar para o login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
