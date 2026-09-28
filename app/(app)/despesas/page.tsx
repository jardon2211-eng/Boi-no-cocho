import { createClient } from "@/lib/supabase/server";
import { Despesa, Lote } from "@/lib/types";
import { formatBRL } from "@/lib/calculations";
import { NovaDespesaForm, ExcluirDespesaBotao } from "./DespesasClient";

export default async function DespesasPage() {
  const supabase = createClient();
  const [{ data: despesas }, { data: lotes }] = await Promise.all([
    supabase.from("despesas").select("*, lotes(nome, status)").order("data", { ascending: false }),
    supabase.from("lotes").select("*"),
  ]);

  const todasDespesas = (despesas ?? []) as any[];
  const todosLotes = (lotes ?? []) as Lote[];

  const custosFixos = todasDespesas.filter((d) => d.categoria === "Fixa").reduce((s, d) => s + d.valor, 0);
  const custosVariaveis = todasDespesas.filter((d) => d.categoria === "Variável").reduce((s, d) => s + d.valor, 0);
  const total = custosFixos + custosVariaveis;

  const porLote = todosLotes.map((lote) => {
    const doLote = todasDespesas.filter((d) => d.lote_id === lote.id);
    const fixas = doLote.filter((d) => d.categoria === "Fixa").reduce((s, d) => s + d.valor, 0);
    const variaveis = doLote.filter((d) => d.categoria === "Variável").reduce((s, d) => s + d.valor, 0);
    return { lote, count: doLote.length, fixas, variaveis, total: fixas + variaveis };
  }).filter((r) => r.count > 0);

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">💵 Despesas</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de custos fixos e variáveis</p>
        </div>
        <NovaDespesaForm lotes={todosLotes.filter((l) => l.status === "Ativo")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-5 bg-red-500 text-white">
          <p className="text-sm opacity-90">↘ Custos Fixos</p>
          <p className="text-2xl font-bold mt-1">{formatBRL(custosFixos)}</p>
        </div>
        <div className="rounded-xl p-5 bg-orange-500 text-white">
          <p className="text-sm opacity-90">↗ Variáveis</p>
          <p className="text-2xl font-bold mt-1">{formatBRL(custosVariaveis)}</p>
        </div>
        <div className="rounded-xl p-5 bg-gray-800 text-white">
          <p className="text-sm opacity-90">💲 Total</p>
          <p className="text-2xl font-bold mt-1">{formatBRL(total)}</p>
        </div>
      </div>

      {porLote.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Despesas por Lote</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 font-medium">Lote</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Despesas</th>
                <th className="py-2 font-medium">Fixas</th>
                <th className="py-2 font-medium">Variáveis</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {porLote.map(({ lote, count, fixas, variaveis, total }) => (
                <tr key={lote.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium">{lote.nome}</td>
                  <td className="py-2">
                    <span className={lote.status === "Ativo" ? "badge-ativo" : "badge-vendido"}>{lote.status.toUpperCase()}</span>
                  </td>
                  <td className="py-2">{count}</td>
                  <td className="py-2 text-red-500">{formatBRL(fixas)}</td>
                  <td className="py-2 text-orange-500">{formatBRL(variaveis)}</td>
                  <td className="py-2 font-semibold">{formatBRL(total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Histórico de Despesas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Data</th>
              <th className="py-2 font-medium">Descrição</th>
              <th className="py-2 font-medium">Lote</th>
              <th className="py-2 font-medium">Categoria</th>
              <th className="py-2 font-medium">Valor</th>
              <th className="py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {todasDespesas.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400">Nenhuma despesa registrada.</td></tr>
            ) : todasDespesas.map((d) => (
              <tr key={d.id} className="border-b border-gray-50">
                <td className="py-2">{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                <td className="py-2 font-medium">{d.descricao}</td>
                <td className="py-2 text-gray-500">{d.lotes?.nome || "—"}</td>
                <td className="py-2">
                  <span className={d.categoria === "Fixa" ? "badge-vendido" : "badge-baixo"}>{d.categoria.toUpperCase()}</span>
                </td>
                <td className="py-2 font-semibold">{formatBRL(d.valor)}</td>
                <td className="py-2"><ExcluirDespesaBotao id={d.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
