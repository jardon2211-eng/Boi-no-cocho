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
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo && sessao) setPronto(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) setPronto(true);
    });
    // se em alguns segundos não houver sessão, o link não valeu
    const t = setTimeout(() => {
      if (ativo) setPronto((atual) => (atual === true ? true : false));
    }, 4000);
    return () => {
      ativo = false;
      clearTimeout(t);
      sub.subscription.unsubscribe();
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
