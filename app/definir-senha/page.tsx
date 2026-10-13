"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // null = validando o link, true = sessão ok, false = link inválido/expirado
  const [pronto, setPronto] = useState<boolean | null>(null);

  useEffect(() => {
    let ativo = true;

    async function iniciar() {
      // 1) Link do e-mail (convite ou "esqueci a senha"): os dados vêm depois do "#" na URL.
      //    Lemos na mão porque o cliente do navegador está no modo PKCE e recusa esse formato.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (ativo) setPronto(!error);
        if (!error) window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      // 2) Link no formato com ?code= (PKCE)
      const code = query.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (ativo) setPronto(!error);
        if (!error) window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      // 3) Link com erro (expirado/já usado), ou quem abriu a página já logado
      if (hash.get("error") || query.get("error")) {
        if (ativo) setPronto(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (ativo) setPronto(!!data.session);
    }

    iniciar();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (error) {
      setErro(
        error.message.toLowerCase().includes("session")
          ? "Esse link expirou ou já foi usado. Volte no e-mail e peça um novo, ou fale com o suporte."
          : error.message
      );
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
          <h1 className="text-2xl font-bold text-brand-700">Defina sua senha</h1>
          <p className="text-gray-500 text-sm mt-1">Último passo pra acessar o Boi no Cocho</p>
        </div>

        {pronto === false && (
          <div className="card space-y-3 text-center mb-4">
            <p className="text-sm text-red-600">
              Esse link expirou ou já foi usado. Peça um novo link abaixo e use só o mais recente.
            </p>
            <Link href="/esqueci-senha" className="btn-primary w-full block">
              Pedir novo link
            </Link>
          </div>
        )}
        {pronto === null && (
          <p className="text-center text-sm text-gray-500 mb-4">Validando seu link...</p>
        )}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label-field">Nova senha</label>
            <input
              type="password" required autoFocus className="input-field"
              value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="label-field">Confirmar senha</label>
            <input
              type="password" required className="input-field"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button type="submit" disabled={loading || pronto !== true} className="btn-primary w-full">
            {loading ? "Salvando..." : "Entrar no sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}
