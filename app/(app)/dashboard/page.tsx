import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import {
  numeroAnimaisAtual,
  custoDiarioNoCocho,
  custoRacaoAcumulado,
  receitaVenda,
  lucroLote,
  gmdReal,
  formatBRL,
} from "@/lib/calculations";
import { Lote, Formulacao, Despesa } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: lotes }, { data: formulacoes }, { data: despesas }] = await Promise.all([
    supabase.from("lotes").select("*").order("created_at", { ascending: false }),
    supabase.from("formulacoes").select("*, produtos(*)"),
    supabase.from("despesas").select("*"),
  ]);

  const todosLotes = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as Formulacao[];
  const todasDespesas = (despesas ?? []) as Despesa[];

  const lotesAtivos = todosLotes.filter((l) => l.status === "Ativo");
  const lotesVendidos = todosLotes.filter((l) => l.status === "Vendido");

  const boisAtivos = lotesAtivos.reduce((s, l) => s + numeroAnimaisAtual(l), 0);

  const pesosAtuais = lotesAtivos.map((l) => l.peso_atual).filter((p): p is number => !!p);
  const pesoMedio = pesosAtuais.length
    ? pesosAtuais.reduce((a, b) => a + b, 0) / pesosAtuais.length
    : 0;

  const gmds = lotesAtivos.map((l) => gmdReal(l)).filter((g): g is number => g !== null);
  const gmdMedio = gmds.length ? gmds.reduce((a, b) => a + b, 0) / gmds.length : 0;

  const faturamentoTotal = todosLotes.reduce((s, l) => s + receitaVenda(l), 0);

  const lucrosRealizados = lotesVendidos
    .map((l) => lucroLote(l, todasFormulacoes, todasDespesas))
    .filter((v): v is number => v !== null);
  const lucroTotal = lucrosRealizados.reduce((a, b) => a + b, 0);
  const lucroMedioAnimal = lotesVendidos.length
    ? lucroTotal / lotesVendidos.reduce((s, l) => s + numeroAnimaisAtual(l), 0)
    : 0;

  const custoRacaoTotal = todosLotes.reduce(
    (s, l) => s + custoRacaoAcumulado(l, todasFormulacoes), 0
  );
  const custoRacaoDiarioAtivos = lotesAtivos.reduce(
    (s, l) => s + custoDiarioNoCocho(l, todasFormulacoes), 0
  );
  const despesasTotais = todasDespesas.reduce((s, d) => s + d.valor, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700 flex items-center gap-2">🐂 Visão Geral</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Painel do seu confinamento, atualizado em tempo real.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bois Ativos" value={String(boisAtivos)} icon="🐂" sublabel={`${lotesAtivos.length} lote(s) ativo(s)`} color="green" />
        <StatCard label="Peso Médio Atual" value={`${pesoMedio.toFixed(0)} kg`} icon="⚖️" color="blue" />
        <StatCard label="GMD Médio" value={`${gmdMedio.toFixed(2)} kg/dia`} icon="📈" color="purple" />
        <StatCard label="Faturamento Total" value={formatBRL(faturamentoTotal)} icon="💰" color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard label="Lucro Total" value={formatBRL(lucroTotal)} icon="📊" />
        <StatCard label="Lucro Médio/Animal" value={lotesVendidos.length ? formatBRL(lucroMedioAnimal) : "—"} icon="🐄" sublabel={lotesVendidos.length ? undefined : "sem vendas ainda"} />
        <StatCard label="Custo de Ração (total)" value={formatBRL(custoRacaoTotal)} icon="🌾" color="orange" />
        <StatCard label="Despesas Totais" value={formatBRL(despesasTotais)} icon="💵" />
      </div>

      <div className="mt-4">
        <div className="card bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Custo diário de ração — lotes ativos:</strong> {formatBRL(custoRacaoDiarioAtivos)} / dia
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-gray-700 mb-3">Lotes Ativos</h2>
        {lotesAtivos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum lote ativo. Registre uma compra para começar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lotesAtivos.map((lote) => (
              <div key={lote.id} className="card">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-800">{lote.nome}</span>
                  <span className="badge-ativo">ATIVO</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Animais</p>
                    <p className="font-semibold">{numeroAnimaisAtual(lote)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Peso Atual</p>
                    <p className="font-semibold">{lote.peso_atual ? `${lote.peso_atual} kg` : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
