import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import CopiarLink from "./CopiarLink";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Painel do parceiro · Boi no Cocho",
  robots: { index: false, follow: false },
};

const DARK = "#12281a";
const PAPER = "#f6f7f1";
const INK = "#1a2419";
const MUTED = "#4a5547";
const BORDER = "#cfd6c8";

const GARANTIA_DIAS = 7;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function mascarar(email: string) {
  const [u, d] = email.split("@");
  if (!d) return "•••";
  return `${u.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(u.length - 2, 5)))}@${d}`;
}

function dataBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

export default async function PainelAfiliado({ params }: { params: { token: string } }) {
  const token = params.token;
  if (!/^[a-f0-9]{20,64}$/.test(token)) notFound();

  const admin = createAdminClient();
  const { data: af } = await admin
    .from("afiliados")
    .select("nome, codigo, comissao_pct, ativo")
    .eq("token", token)
    .maybeSingle();
  if (!af || !af.ativo) notFound();

  const origem = `ref:${af.codigo}`;
  const [{ data: eventos }, { data: vendas }] = await Promise.all([
    admin
      .from("funil_eventos")
      .select("sessao, evento")
      .eq("origem", origem)
      .in("evento", ["view_home", "view_comprar", "iniciar_pagamento"])
      .limit(20000),
    admin
      .from("vendas")
      .select("email, valor, comissao, status, aprovado_em")
      .eq("afiliado_codigo", af.codigo)
      .order("aprovado_em", { ascending: false })
      .limit(200),
  ]);

  const contar = (ev: string) =>
    new Set((eventos ?? []).filter((e) => e.evento === ev).map((e) => e.sessao)).size;
  const visitas = contar("view_home");
  const noPagamento = contar("view_comprar");

  const agora = Date.now();
  const lista = (vendas ?? []).map((v) => {
    const libera = new Date(v.aprovado_em).getTime() + GARANTIA_DIAS * 24 * 3600 * 1000;
    const situacao =
      v.status !== "approved" ? "cancelada" : agora >= libera ? "liberada" : "garantia";
    return { ...v, libera, situacao };
  });
  const validas = lista.filter((v) => v.situacao !== "cancelada");
  const aLiberar = validas.filter((v) => v.situacao === "garantia").reduce((s, v) => s + Number(v.comissao), 0);
  const liberada = validas.filter((v) => v.situacao === "liberada").reduce((s, v) => s + Number(v.comissao), 0);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://boinococho.com";
  const link = `${site}/?ref=${af.codigo}`;

  return (
    <div className="light-only min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
      <header className="px-4 py-4" style={{ backgroundColor: DARK }}>
        <div className="mx-auto max-w-2xl text-white">
          <p className="text-sm text-white/70">Painel do parceiro</p>
          <h1 className="text-xl font-extrabold">Olá, {af.nome}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <section className="rounded-xl bg-white p-4" style={{ border: `2px solid ${BORDER}` }}>
          <h2 className="font-bold">Seu link de divulgação</h2>
          <p className="mt-2 break-all rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#eef2e8" }}>
            {link}
          </p>
          <div className="mt-3">
            <CopiarLink link={link} />
          </div>
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            Use esse link nos seus posts, stories e bio. Toda compra feita por ele fica registrada para você,
            mesmo que a pessoa compre depois, em até 30 dias.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Cartao titulo="Visitas pelo seu link" valor={String(visitas)} />
          <Cartao titulo="Chegaram ao pagamento" valor={String(noPagamento)} />
          <Cartao titulo="Vendas" valor={String(validas.length)} />
          <Cartao titulo={`Sua comissão (${Number(af.comissao_pct)}%)`} valor={brl(aLiberar + liberada)} />
        </section>

        <section className="rounded-xl bg-white p-4" style={{ border: `2px solid ${BORDER}` }}>
          <h2 className="font-bold">Comissão</h2>
          <div className="mt-2 flex justify-between text-base">
            <span>Liberada para pagamento</span>
            <b>{brl(liberada)}</b>
          </div>
          <div className="mt-1 flex justify-between text-base">
            <span>Em garantia</span>
            <b>{brl(aLiberar)}</b>
          </div>
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            A comissão é liberada {GARANTIA_DIAS} dias depois da compra, prazo em que o cliente pode pedir o
            dinheiro de volta. Compras devolvidas não geram comissão.
          </p>
        </section>

        <section className="rounded-xl bg-white p-4" style={{ border: `2px solid ${BORDER}` }}>
          <h2 className="font-bold">Suas vendas</h2>
          {lista.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Ainda não há vendas pelo seu link. Assim que a primeira acontecer, ela aparece aqui.
            </p>
          ) : (
            <ul className="mt-2 divide-y" style={{ borderColor: BORDER }}>
              {lista.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{mascarar(v.email)}</p>
                    <p style={{ color: MUTED }}>
                      {dataBR(v.aprovado_em)} ·{" "}
                      {v.situacao === "cancelada"
                        ? "Devolvida"
                        : v.situacao === "liberada"
                        ? "Liberada"
                        : `Libera em ${dataBR(new Date(v.libera).toISOString())}`}
                    </p>
                  </div>
                  <b className={v.situacao === "cancelada" ? "line-through" : ""}>{brl(Number(v.comissao))}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="pb-6 text-center text-xs" style={{ color: MUTED }}>
          Guarde este endereço: ele é só seu e mostra apenas os seus números.
        </p>
      </main>
    </div>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white p-4" style={{ border: `2px solid ${BORDER}` }}>
      <p className="text-sm" style={{ color: MUTED }}>{titulo}</p>
      <p className="mt-1 text-2xl font-extrabold">{valor}</p>
    </div>
  );
}
