import { createClient } from "@/lib/supabase/server";
import { Lote, Formulacao, Despesa } from "@/lib/types";
import {
  numeroAnimaisAtual, diasConfinamento, gmdReal, pesoFinalProjetado,
  custoTotalLote, receitaVenda, lucroLote, lucroPorAnimal, formatBRL,
} from "@/lib/calculations";
import LoteActions from "./LoteActions";

export default async function LotesPage() {
  const supabase = createClient();
  const [{ data: lotes }, { data: formulacoes }, { data: despesas }] = await Promise.all([
    supabase.from("lotes").select("*").order("created_at", { ascending: false }),
    supabase.from("formulacoes").select("*, produtos(*)"),
    supabase.from("despesas").select("*"),
  ]);

  const todosLotes = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as Formulacao[];
  const todasDespesas = (despesas ?? []) as Despesa[];

  const ativos = todosLotes.filter((l) => l.status === "Ativo");
  const vendidos = todosLotes.filter((l) => l.status === "Vendido");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">📈 Lotes de Gado</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Acompanhamento e performance</p>

      <h2 className="font-bold text-gray-700 mb-3">Lotes Ativos</h2>
      {ativos.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">Nenhum lote ativo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ativos.map((lote) => (
            <LoteCard key={lote.id} lote={lote} formulacoes={todasFormulacoes} despesas={todasDespesas} />
          ))}
        </div>
      )}

      <h2 className="font-bold text-gray-700 mb-3">Histórico (Vendidos)</h2>
      {vendidos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum lote vendido ainda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendidos.map((lote) => (
            <LoteCard key={lote.id} lote={lote} formulacoes={todasFormulacoes} despesas={todasDespesas} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoteCard({ lote, formulacoes, despesas }: { lote: Lote; formulacoes: Formulacao[]; despesas: Despesa[] }) {
  const gmd = gmdReal(lote);
  const lucro = lucroLote(lote, formulacoes, despesas);
  const lucroAnimal = lucroPorAnimal(lote, formulacoes, despesas);

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <span className="font-bold text-gray-800">{lote.nome}</span>
        <span className={lote.status === "Ativo" ? "badge-ativo" : "badge-vendido"}>
          {lote.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Quantidade</p>
          <p className="font-semibold">{numeroAnimaisAtual(lote)} bois</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Peso Inicial</p>
          <p className="font-semibold">{lote.peso_entrada.toFixed(1)} kg</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Peso Final Esperado</p>
          <p className="font-semibold text-green-700">{pesoFinalProjetado(lote).toFixed(1)} kg</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">GMD {gmd !== null ? "Real" : "Desejado"}</p>
          <p className="font-semibold text-purple-600">
            {gmd !== null ? gmd.toFixed(2) : lote.gmd_esperado.toFixed(2)} kg/dia
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Dias Conf.</p>
          <p className="font-semibold">{diasConfinamento(lote)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Peso Atual</p>
          <p className="font-semibold">{lote.peso_atual ? `${lote.peso_atual} kg` : "—"}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-3 pt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Custo Total</p>
          <p className="font-semibold">{formatBRL(custoTotalLote(lote, formulacoes, despesas))}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">{lote.status === "Vendido" ? "Receita" : "Lucro"}</p>
          <p className={`font-semibold ${lucro !== null && lucro >= 0 ? "text-green-700" : lucro !== null ? "text-red-600" : "text-gray-400"}`}>
            {lote.status === "Vendido" ? formatBRL(receitaVenda(lote)) : "Em andamento"}
          </p>
        </div>
        {lote.status === "Vendido" && (
          <>
            <div>
              <p className="text-gray-400 text-xs">Lucro</p>
              <p className={`font-semibold ${lucro! >= 0 ? "text-green-700" : "text-red-600"}`}>{formatBRL(lucro ?? 0)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Lucro/Animal</p>
              <p className={`font-semibold ${lucroAnimal! >= 0 ? "text-green-700" : "text-red-600"}`}>{formatBRL(lucroAnimal ?? 0)}</p>
            </div>
          </>
        )}
      </div>

      {lote.status === "Ativo" && <LoteActions lote={lote} />}
    </div>
  );
}
