import { createClient } from "@/lib/supabase/server";
import { Produto, EstoqueMovimento, Lote } from "@/lib/types";
import { NovoMovimentoForm, ExcluirMovimentoBotao } from "./EstoqueClient";

export default async function EstoquePage() {
  const supabase = createClient();
  const [{ data: produtos }, { data: movimentos }, { data: lotes }] = await Promise.all([
    supabase.from("produtos").select("*").order("nome"),
    supabase.from("estoque_movimentos").select("*, produtos(*)").order("data", { ascending: false }),
    supabase.from("lotes").select("*"),
  ]);

  const todosProdutos = (produtos ?? []) as Produto[];
  const todosMovimentos = (movimentos ?? []) as EstoqueMovimento[];
  const todosLotes = (lotes ?? []) as Lote[];

  const saldoPorProduto = todosProdutos.map((p) => {
    const entradas = todosMovimentos.filter((m) => m.produto_id === p.id && m.tipo === "Entrada").reduce((s, m) => s + m.quantidade_kg, 0);
    const saidas = todosMovimentos.filter((m) => m.produto_id === p.id && m.tipo === "Saída").reduce((s, m) => s + m.quantidade_kg, 0);
    const saldo = entradas - saidas;
    return { produto: p, entradas, saidas, saldo, baixo: saldo < p.estoque_minimo_kg };
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">📦 Estoque de Ração</h1>
          <p className="text-gray-500 text-sm mt-1">Entradas, saídas e saldo atual por produto</p>
        </div>
        <NovoMovimentoForm produtos={todosProdutos} lotes={todosLotes.filter((l) => l.status === "Ativo")} />
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Saldo por Produto</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Produto</th>
              <th className="py-2 font-medium">Entradas</th>
              <th className="py-2 font-medium">Saídas</th>
              <th className="py-2 font-medium">Saldo (kg)</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {saldoPorProduto.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">Cadastre produtos na aba Formulação.</td></tr>
            ) : saldoPorProduto.map(({ produto, entradas, saidas, saldo, baixo }) => (
              <tr key={produto.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{produto.nome}</td>
                <td className="py-2 text-green-600">{entradas.toLocaleString("pt-BR")} kg</td>
                <td className="py-2 text-red-500">{saidas.toLocaleString("pt-BR")} kg</td>
                <td className="py-2 font-semibold">{saldo.toLocaleString("pt-BR")} kg</td>
                <td className="py-2">
                  {baixo ? <span className="badge-baixo">⚠ BAIXO</span> : <span className="badge-ativo">OK</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Movimentações</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Data</th>
              <th className="py-2 font-medium">Produto</th>
              <th className="py-2 font-medium">Tipo</th>
              <th className="py-2 font-medium">Quantidade</th>
              <th className="py-2 font-medium">Observação</th>
              <th className="py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {todosMovimentos.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400">Nenhuma movimentação registrada.</td></tr>
            ) : todosMovimentos.map((m) => (
              <tr key={m.id} className="border-b border-gray-50">
                <td className="py-2">{new Date(m.data).toLocaleDateString("pt-BR")}</td>
                <td className="py-2">{m.produtos?.nome}</td>
                <td className="py-2">
                  <span className={m.tipo === "Entrada" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{m.tipo}</span>
                </td>
                <td className="py-2">{m.quantidade_kg.toLocaleString("pt-BR")} kg</td>
                <td className="py-2 text-gray-500">{m.observacao || "—"}</td>
                <td className="py-2"><ExcluirMovimentoBotao id={m.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
