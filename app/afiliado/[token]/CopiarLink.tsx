"use client";

import { useState } from "react";

export default function CopiarLink({ link }: { link: string }) {
  const [ok, setOk] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement("textarea");
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="min-h-[48px] w-full rounded-[10px] px-5 text-base font-extrabold"
      style={{ backgroundColor: "#f2b01e", color: "#1a2419" }}
    >
      {ok ? "Link copiado" : "Copiar meu link"}
    </button>
  );
}
