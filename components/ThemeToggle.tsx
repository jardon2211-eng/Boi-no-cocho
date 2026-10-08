"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "sol" | "dark";

const ORDEM: Tema[] = ["light", "sol", "dark"];
const INFO: Record<Tema, { icone: string; nome: string }> = {
  light: { icone: "☀️", nome: "Modo claro" },
  sol: { icone: "🔆", nome: "Modo sol (alto contraste)" },
  dark: { icone: "🌙", nome: "Modo escuro" },
};

function aplicar(t: Tema) {
  const c = document.documentElement.classList;
  c.remove("dark", "sol");
  if (t !== "light") c.add(t);
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("theme");
      if (salvo === "light" || salvo === "sol" || salvo === "dark") {
        setTema(salvo);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTema("dark");
      }
    } catch {
      /* sem acesso ao armazenamento: segue o tema padrão */
    }
  }, []);

  function trocar() {
    const proximo = ORDEM[(ORDEM.indexOf(tema) + 1) % ORDEM.length];
    setTema(proximo);
    aplicar(proximo);
    try {
      localStorage.setItem("theme", proximo);
    } catch {
      /* ignora */
    }
  }

  const atual = INFO[tema];
  const proximoNome = INFO[ORDEM[(ORDEM.indexOf(tema) + 1) % ORDEM.length]].nome;

  if (compact) {
    return (
      <button
        type="button"
        onClick={trocar}
        aria-label={`${atual.nome}. Tocar para trocar para ${proximoNome}`}
        title={`${atual.nome} (toque para trocar)`}
        className="text-xl leading-none px-2 py-1"
      >
        {atual.icone}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={trocar}
      title={`Trocar para ${proximoNome}`}
      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
    >
      {atual.icone} {atual.nome}
    </button>
  );
}
