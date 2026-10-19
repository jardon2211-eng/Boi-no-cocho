import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENTOS = new Set([
  "view_home", "view_comprar", "view_sucesso", "view_erro",
  "click_comprar", "iniciar_pagamento", "video_play",
  "scroll_25", "scroll_50", "scroll_75", "scroll_100",
]);
const BOT = /bot|crawl|spider|preview|facebookexternalhit|vercel|headless|lighthouse|monitor/i;

function cortar(v: unknown, n: number): string | null {
  return typeof v === "string" && v ? v.slice(0, n) : null;
}

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT.test(ua)) return new NextResponse(null, { status: 204 });
    const b = await req.json();
    const evento = cortar(b?.evento, 40);
    const sessao = cortar(b?.sessao, 64);
    if (!evento || !sessao || !EVENTOS.has(evento)) return new NextResponse(null, { status: 204 });

    let dispositivo = "computador";
    if (/Instagram/i.test(ua)) dispositivo = "instagram_app";
    else if (/FBAN|FBAV|FB_IAB/i.test(ua)) dispositivo = "facebook_app";
    else if (/Mobi|Android|iPhone/i.test(ua)) dispositivo = "celular";

    await createAdminClient().from("funil_eventos").insert({
      sessao,
      evento,
      detalhe: cortar(b?.detalhe, 120),
      caminho: cortar(b?.caminho, 120),
      origem: cortar(b?.origem, 80),
      dispositivo,
    });
  } catch {}
  return new NextResponse(null, { status: 204 });
}
