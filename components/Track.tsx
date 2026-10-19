"use client";

import { useEffect } from "react";

function sessao(): string {
  try {
    let s = localStorage.getItem("sid");
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("sid", s);
    }
    return s;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

function origem(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    // link de afiliado (?ref=codigo): guarda por 30 dias e marca a origem
    const r = (p.get("ref") || "").toLowerCase();
    if (/^[a-z0-9_-]{2,30}$/.test(r)) {
      try { localStorage.setItem("ref", JSON.stringify({ c: r, t: Date.now() })); } catch {}
      sessionStorage.setItem("origem", "ref:" + r);
      return "ref:" + r;
    }
    let o = sessionStorage.getItem("origem");
    if (o) return o;
    o = p.get("utm_source") || p.get("src") || "";
    if (!o && document.referrer) {
      try { o = new URL(document.referrer).hostname; } catch {}
    }
    o = o || "direto";
    sessionStorage.setItem("origem", o);
    return o;
  } catch {
    return "direto";
  }
}

function enviar(evento: string, detalhe?: string) {
  const corpo = JSON.stringify({
    evento, detalhe, sessao: sessao(), origem: origem(), caminho: window.location.pathname,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([corpo], { type: "application/json" }));
      return;
    }
  } catch {}
  fetch("/api/track", { method: "POST", body: corpo, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

export default function Track({ pagina }: { pagina: "home" | "comprar" | "sucesso" | "erro" }) {
  useEffect(() => {
    origem();
    enviar("view_" + pagina);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="/comprar"]') as HTMLAnchorElement | null;
      if (a) enviar("click_comprar", (a.textContent || "").trim().slice(0, 80));
    };
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement;
      if (f?.querySelector?.('input[name="email"]')) enviar("iniciar_pagamento");
    };
    // evento "play" não borbulha: escuta na captura. Conta uma vez por visita.
    let tocou = false;
    const onPlay = (e: Event) => {
      if (!tocou && (e.target as HTMLElement | null)?.tagName === "VIDEO") {
        tocou = true;
        enviar("video_play");
      }
    };
    document.addEventListener("play", onPlay, true);
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit, true);

    const marcos = [25, 50, 75, 100];
    const feitos = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = (window.scrollY / h) * 100;
      for (const m of marcos) {
        if (pct >= m - 1 && !feitos.has(m)) {
          feitos.add(m);
          enviar("scroll_" + m);
        }
      }
    };
    if (pagina === "home") window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pagina]);
  return null;
}
