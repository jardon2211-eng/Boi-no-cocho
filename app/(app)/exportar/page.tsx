import { createClient } from "@/lib/supabase/server";
import { Lote, Formulacao, Despesa } from "@/lib/types";
import {
  numeroAnimaisAtual, diasConfinamento, gmdReal, pesoFinalProjetado,
  custoTotalLote, receitaVenda, lucroLote, formatBRL,
} from "@/lib/calculations";
import { ExportCard } from "./ExportarClient";

export default async function ExportarPage() {
  const supabase = createClient();
  const [{ data: lotes }, { data: formulacoes }, { data: despesas }] = await Promise.all([
    supabase.from("lotes").select("*").order("created_at", { ascending: false }),
    supabase.from("formulacoes").select("*, produtos(*), lotes(nome)").order("data", { ascending: false }),
    supabase.from("despesas").select("*"),
  ]);

  const todosLotes = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as any[];
  const todasDespesas = (despesas ?? []) as Despesa[];

  // ----- Formulação de Ração -----
  const linhasFormulacao: (string | number)[][] = [
    ["Data", "Lote", "Produto", "Kg/Animal/Dia", "Preço/kg", "Custo/Animal/Dia", "Status"],
    ...todasFormulacoes.map((f) => [
      new Date(f.data).toLocaleDateString("pt-BR"),
      f.lotes?.nome ?? "",
      f.produtos?.nome ?? "",
      f.kg_animal_dia,
      formatBRL(f.produtos?.preco_kg ?? 0),
      formatBRL(f.kg_animal_dia * (f.produtos?.preco_kg ?? 0)),
      f.status,
    ]),
  ];

  // ----- Dados dos Lotes -----
  const linhasLotes: (string | number)[][] = [
    ["Lote", "Status", "Animais", "Peso Entrada", "Peso Atual", "Peso Final Esp.", "GMD", "Dias Conf.", "Receita", "Lucro"],
    ...todosLotes.map((l) => {
      const lucro = lucroLote(l, todasFormulacoes as Formulacao[], todasDespesas);
      const gmd = gmdReal(l);
      return [
        l.nome,
        l.status,
        numeroAnimaisAtual(l),
        `${l.peso_entrada} kg`,
        l.peso_atual ? `${l.peso_atual} kg` : "—",
        `${pesoFinalProjetado(l).toFixed(1)} kg`,
        gmd !== null ? `${gmd.toFixed(2)} kg/dia` : "—",
        diasConfinamento(l),
        formatBRL(receitaVenda(l)),
        lucro !== null ? formatBRL(lucro) : "Em andamento",
      ];
    }),
  ];

  // ----- Relatório Geral (financeiro) -----
  const despesasTotais = todasDespesas.reduce((s, d) => s + d.valor, 0);
  const linhasGeral: (string | number)[][] = [
    ["Lote", "Status", "Faturamento", "Custo Total", "Despesas do Lote", "Lucro"],
    ...todosLotes.map((l) => {
      const lucro = lucroLote(l, todasFormulacoes as Formulacao[], todasDespesas);
      const despesasDoLote = todasDespesas.filter((d) => d.lote_id === l.id).reduce((s, d) => s + d.valor, 0);
      return [
        l.nome,
        l.status,
        formatBRL(receitaVenda(l)),
        formatBRL(custoTotalLote(l, todasFormulacoes as Formulacao[], todasDespesas)),
        formatBRL(despesasDoLote),
        lucro !== null ? formatBRL(lucro) : "Em andamento",
      ];
    }),
    ["", "", "", "", "Despesas Totais Gerais:", formatBRL(despesasTotais)],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">📤 Exportar Dados</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Baixe seus dados em PDF ou Excel para salvar no celular ou computador.</p>

      <div className="space-y-4 max-w-2xl">
        <ExportCard
          icon="🧪"
          titulo="Formulação de Ração"
          descricao="Ingredientes, kg/animal/dia e custos por lote"
          corFundo="bg-green-50"
          linhas={linhasFormulacao}
          nomeArquivo="formulacao_racao"
        />
        <ExportCard
          icon="📈"
          titulo="Dados dos Lotes"
          descricao="Animais, pesos, GMD, vendas e receita"
          corFundo="bg-blue-50"
          linhas={linhasLotes}
          nomeArquivo="dados_lotes"
        />
        <ExportCard
          icon="▦"
          titulo="Relatório Geral"
          descricao="Resumo financeiro: faturamento, custos, lucro e despesas"
          corFundo="bg-amber-50"
          linhas={linhasGeral}
          nomeArquivo="relatorio_geral"
        />
      </div>
    </div>
  );
}
