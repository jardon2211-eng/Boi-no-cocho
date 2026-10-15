"use client";

import { useEffect, useState } from "react";
import { iniciarPagamento } from "./actions";

const HAY = "#f2b01e";
const INK = "#1a2419";
const DARK = "#12281a";
const BORDER = "#cfd6c8";

// Erros de digitação comuns no domínio do e-mail -> domínio provável
const DOMINIOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.com.br": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "icloud.con": "icloud.com",
  "icloud.co": "icloud.com",
};

function sugestao(email: string): string | null {
  const v = email.trim().toLowerCase();
  const i = v.lastIndexOf("@");
  if (i < 1) return null;
  const certo = DOMINIOS[v.slice(i + 1)];
  return certo ? `${v.slice(0, i)}@${certo}` : null;
}

export default function ComprarForm() {
  const [email, setEmail] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [ref, setRef] = useState("");

  // código do afiliado guardado pelo Track (vale 30 dias)
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("ref") || "null");
      if (v?.c && Date.now() - v.t < 30 * 24 * 3600 * 1000) setRef(String(v.c));
    } catch {}
  }, []);

  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    const s = sugestao(email);
    if (s && !confirmado) {
      e.preventDefault();
      setAviso(s);
    }
  }

  return (
    <form action={iniciarPagamento} onSubmit={aoEnviar} className="space-y-3">
      <input type="hidden" name="ref" value={ref} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Seu e-mail
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setAviso(null);
            setConfirmado(false);
          }}
          className="w-full rounded-lg bg-white px-3 py-3 text-base focus:outline-none"
          style={{ border: `2px solid ${BORDER}`, color: INK }}
        />
        <p className="mt-1 text-xs" style={{ color: "#4a5547" }}>
          É para esse e-mail que enviamos o acesso. Confira se está certo.
        </p>
      </div>

      {aviso && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#fff3cf", border: `2px solid ${HAY}`, color: INK }}
        >
          <p>
            Você quis dizer <b>{aviso}</b>?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-[40px] rounded-md px-3 font-bold text-white"
              style={{ backgroundColor: DARK }}
              onClick={() => {
                setEmail(aviso);
                setAviso(null);
              }}
            >
              Sim, usar esse
            </button>
            <button
              type="button"
              className="min-h-[40px] rounded-md bg-white px-3 font-semibold"
              style={{ border: `2px solid ${BORDER}` }}
              onClick={() => {
                setConfirmado(true);
                setAviso(null);
              }}
            >
              Está certo, manter o meu
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="flex min-h-[56px] w-full flex-col items-center justify-center rounded-xl px-4 py-2 text-center"
        style={{ backgroundColor: HAY, color: INK }}
      >
        <span className="text-lg font-extrabold">Ir para o pagamento · R$ 64,90</span>
        <span className="text-xs font-semibold">Pix, cartão ou boleto</span>
      </button>
    </form>
  );
}
