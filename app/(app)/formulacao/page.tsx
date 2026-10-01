import { createClient } from "@/lib/supabase/server";
import { Produto, Lote } from "@/lib/types";
import { formatBRL } from "@/lib/calculations";
import {
  NovoProdutoForm, ProdutosTable, NovaDietaForm, AprovarDietaBotao, ExcluirDietaBotao,
} from "./FormulacaoClient";

export default async function FormulacaoPage() {
  const supabase = createClient();
  const [{ data: produtos }, { data: lotes }, { data: formulacoes }] = await Promise.all([
    supabase.from("produtos").select("*").order("nome"),
    supabase.from("lotes").select("*").eq("status", "Ativo").order("nome"),
    supabase.from("formulacoes").select("*, produtos(*), lotes(nome)").order("data", { ascending: false }),
  ]);

  const todosProdutos = (produtos ?? []) as Produto[];
  const lotesAtivos = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as any[];

  // agrupa as linhas (uma por ingrediente) em "dietas" — mesma lote_id + mesma data
  const grupos = new Map<string, { lote_id: string | null; loteNome: string; data: string; kg_dia_total: number; custo_volumoso_kg: number; status: string; itens: any[] }>();
  for (const f of todasFormulacoes) {
    const chave = `${f.lote_id ?? "sem-lote"}__${f.data}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, {
        lote_id: f.lote_id, loteNome: f.lotes?.nome ?? "Sem Lote (Independente)",
        data: f.data, kg_dia_total: f.kg_dia_total, custo_volumoso_kg: f.custo_volumoso_kg ?? 0, status: f.status, itens: [],
      });
    }
    const g = grupos.get(chave)!;
    g.itens.push(f);
    if (f.status !== "Aprovado") g.status = "Pendente"; // se algum item não aprovado, dieta toda fica pendente
  }
  const dietas = Array.from(grupos.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">🧪 Formulação de Ração</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Cadastre os produtos por saco e monte a dieta por % de cada ingrediente.</p>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-700">📦 Produtos Cadastrados</h2>
          <NovoProdutoForm />
        </div>
        <ProdutosTable produtos={todosProdutos} />
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Nova Dieta</h2>
        <NovaDietaForm lotes={lotesAtivos} produtos={todosProdutos} />
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Dietas Cadastradas</h2>
        {dietas.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Nenhuma dieta cadastrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {dietas.map((d, idx) => {
              const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
              const custoKg = d.itens.reduce((s, i) => s + (num(i.percentual) / 100) * num(i.produtos?.preco_kg), 0);
              const custoDia = custoKg * num(d.kg_dia_total);
              return (
                <div key={idx} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{d.loteNome}</span>
                      <span className="text-gray-400 text-xs ml-2">{new Date(d.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.status === "Aprovado" ? (
                        <span className="badge-ativo">APROVADO</span>
                      ) : (
                        <>
                          <span className="badge-baixo">PENDENTE</span>
                          <AprovarDietaBotao loteId={d.lote_id} data={d.data} />
                        </>
                      )}
                      <ExcluirDietaBotao loteId={d.lote_id} data={d.data} />
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="py-1 font-medium">Produto</th>
                        <th className="py-1 font-medium">%</th>
                        <th className="py-1 font-medium">Kg/Dia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.itens.map((i: any) => (
                        <tr key={i.id}>
                          <td className="py-1">{i.produtos?.nome}</td>
                          <td className="py-1">{i.percentual}%</td>
                          <td className="py-1">{i.kg_animal_dia?.toFixed?.(2) ?? ((i.percentual/100)*d.kg_dia_total).toFixed(2)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between text-sm mt-3 pt-2 border-t border-gray-50 text-gray-600 flex-wrap gap-2">
                    <span>Kg/dia ração: <strong>{d.kg_dia_total} kg</strong></span>
                    <span>Custo/kg ração: <strong>{formatBRL(custoKg)}</strong></span>
                    <span>Volumoso: <strong>{formatBRL(d.custo_volumoso_kg)}/kg</strong></span>
                    <span>Custo ração/animal/dia: <strong className="text-green-700">{formatBRL(custoDia)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
