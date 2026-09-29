import { createClient } from "@/lib/supabase/server";
import { Lote, Formulacao } from "@/lib/types";
import { numeroAnimaisAtual } from "@/lib/calculations";
import ConsumoChart from "./ConsumoChart";

export default async function ConsumoPage() {
  const supabase = createClient();
  const [{ data: formulacoes }, { data: lotes }] = await Promise.all([
    supabase.from("formulacoes").select("*, produtos(*)").eq("status", "Aprovado").order("data"),
    supabase.from("lotes").select("*"),
  ]);

  const todasFormulacoes = (formulacoes ?? []) as Formulacao[];
  const todosLotes = (lotes ?? []) as Lote[];
  const loteById = new Map(todosLotes.map((l) => [l.id, l]));

  // agrega kg consumidos por mês x produto
  const produtosSet = new Set<string>();
  const porMes: Record<string, Record<string, number>> = {};
  const historico: { data: string; lote: string; produto: string; kg: number }[] = [];

  for (const f of todasFormulacoes) {
    if (!f.lote_id) continue; // formulação "Independente" (sem lote) não entra no consumo por lote
    const lote = loteById.get(f.lote_id);
    if (!lote) continue;
    const animais = numeroAnimaisAtual(lote);
    const kgConsumidoDia = f.kg_animal_dia * animais;
    const nomeProduto = f.produtos?.nome ?? "—";
    const mesKey = new Date(f.data).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    produtosSet.add(nomeProduto);
    porMes[mesKey] = porMes[mesKey] || {};
    porMes[mesKey][nomeProduto] = (porMes[mesKey][nomeProduto] || 0) + kgConsumidoDia;

    historico.push({ data: f.data, lote: lote.nome, produto: nomeProduto, kg: kgConsumidoDia });
  }

  const produtosList = Array.from(produtosSet);
  const chartData = Object.entries(porMes).map(([mes, valores]) => ({ mes, ...valores }));
  historico.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">📊 Relatório de Consumo</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Histórico de consumo de ração por lote ao longo do confinamento (baseado nas dietas Aprovadas).
      </p>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Consumo por Ingrediente ao Longo do Tempo (kg/dia)</h2>
        <ConsumoChart data={chartData} produtos={produtosList} />
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Histórico Detalhado por Atualização</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Data</th>
              <th className="py-2 font-medium">Lote</th>
              <th className="py-2 font-medium">Produto</th>
              <th className="py-2 font-medium">Kg Consumido/Dia</th>
            </tr>
          </thead>
          <tbody>
            {historico.length === 0 ? (
              <tr><td colSpan={4} className="py-6 text-center text-gray-400">Nenhum histórico encontrado.</td></tr>
            ) : historico.map((h, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2">{new Date(h.data).toLocaleDateString("pt-BR")}</td>
                <td className="py-2">{h.lote}</td>
                <td className="py-2">{h.produto}</td>
                <td className="py-2">{h.kg.toFixed(1)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
