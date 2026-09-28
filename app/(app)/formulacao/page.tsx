import { createClient } from "@/lib/supabase/server";
import { Produto, Lote, Formulacao } from "@/lib/types";
import {
  NovoProdutoForm, ProdutosTable, NovaFormulacaoForm, AprovarBotao, ExcluirFormulacaoBotao,
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">🧪 Formulação de Ração</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Cadastre os produtos e monte a dieta de cada lote.</p>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-700">📦 Produtos Cadastrados</h2>
          <NovoProdutoForm />
        </div>
        <ProdutosTable produtos={todosProdutos} />
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Nova Entrada de Dieta</h2>
        <NovaFormulacaoForm lotes={lotesAtivos} produtos={todosProdutos} />
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Dietas por Lote</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Data</th>
              <th className="py-2 font-medium">Lote</th>
              <th className="py-2 font-medium">Produto</th>
              <th className="py-2 font-medium">Kg/Animal/Dia</th>
              <th className="py-2 font-medium">Custo/Animal/Dia</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {todasFormulacoes.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center text-gray-400">Nenhuma dieta cadastrada ainda.</td></tr>
            ) : todasFormulacoes.map((f) => (
              <tr key={f.id} className="border-b border-gray-50">
                <td className="py-2">{new Date(f.data).toLocaleDateString("pt-BR")}</td>
                <td className="py-2">{f.lotes?.nome}</td>
                <td className="py-2">{f.produtos?.nome}</td>
                <td className="py-2">{f.kg_animal_dia}</td>
                <td className="py-2">R$ {(f.kg_animal_dia * (f.produtos?.preco_kg ?? 0)).toFixed(2)}</td>
                <td className="py-2">
                  {f.status === "Aprovado" ? (
                    <span className="badge-ativo">APROVADO</span>
                  ) : (
                    <span className="badge-baixo">PENDENTE</span>
                  )}
                </td>
                <td className="py-2 flex gap-2 items-center">
                  {f.status !== "Aprovado" && <AprovarBotao id={f.id} />}
                  <ExcluirFormulacaoBotao id={f.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
