import { createClient } from "@/lib/supabase/server";
import { Lote, Formulacao, FaseAdaptacao } from "@/lib/types";
import { numeroAnimaisAtual, custoMedioPorKgDieta, custoVolumosoPorKg, custoRegistroCocho, previstoAdaptacaoHoje, diasConfinamento, formatBRL } from "@/lib/calculations";
import { NovoRegistroCochoForm, ExcluirCochoBotao, FasesAdaptacaoBotao } from "./CochoClient";

const NOME_TRATO: Record<number, string> = { 1: "1º Trato", 2: "2º Trato", 3: "3º Trato" };

export default async function CochoPage() {
  const supabase = createClient();
  const [{ data: lotes }, { data: formulacoes }, { data: registros }, { data: fases }] = await Promise.all([
    supabase.from("lotes").select("*"),
    supabase.from("formulacoes").select("*, produtos(*)"),
    supabase.from("cocho_registros").select("*, lotes(nome)").order("data", { ascending: false }).order("trato_numero"),
    supabase.from("fases_adaptacao").select("*").order("ordem"),
  ]);

  const todosLotes = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as Formulacao[];
  const todosRegistros = (registros ?? []) as any[];
  const todasFases = (fases ?? []) as FaseAdaptacao[];
  const lotesAtivos = todosLotes.filter((l) => l.status === "Ativo");
  const loteById = new Map(todosLotes.map((l) => [l.id, l]));

  const kgLiquidoRegistro = (r: any) => Math.max(0, r.racao_kg + r.volumoso_kg - (r.sobrou ? r.sobra_kg : 0));
  const custoRegistro = (r: any, loteId: string) =>
    custoRegistroCocho(r.racao_kg, r.volumoso_kg, r.sobrou, r.sobra_kg, todasFormulacoes, loteId);

  const resumoPorLote = lotesAtivos.map((lote) => {
    const registrosDoLote = todosRegistros.filter((r) => r.lote_id === lote.id);
    const fasesDoLote = todasFases.filter((f) => f.lote_id === lote.id);
    const kgLiquido = registrosDoLote.reduce((s, r) => s + kgLiquidoRegistro(r), 0);
    const custoTotal = registrosDoLote.reduce((s, r) => s + custoRegistro(r, lote.id), 0);
    const custoRacaoKg = custoMedioPorKgDieta(todasFormulacoes, lote.id);
    const custoVolKg = custoVolumosoPorKg(todasFormulacoes, lote.id);
    const diasDistintos = new Set(registrosDoLote.map((r) => r.data)).size;
    const mediaDiariaKg = diasDistintos > 0 ? kgLiquido / diasDistintos : 0;

    const dias = diasConfinamento(lote);
    const adaptacao = previstoAdaptacaoHoje(lote, fasesDoLote);
    // enquanto o lote estiver dentro de alguma fase cadastrada, o previsto vem dali;
    // depois da última fase (ou se não tiver nenhuma cadastrada), vem da dieta fixa aprovada
    const previstoKgDiaFormulacao = numeroAnimaisAtual(lote) * (
      todasFormulacoes
        .filter((f) => f.lote_id === lote.id && f.status === "Aprovado")
        .reduce((s, f) => s + f.kg_animal_dia, 0)
    );
    const previstoKgDiaAdaptacao = numeroAnimaisAtual(lote) * (adaptacao.racaoKg + adaptacao.volumosoKg);
    const previstoKgDia = adaptacao.emAdaptacao ? previstoKgDiaAdaptacao : previstoKgDiaFormulacao;

    return {
      lote, fasesDoLote, kgLiquido, custoTotal, custoRacaoKg, custoVolKg, mediaDiariaKg, previstoKgDia, diasDistintos,
      dias, emAdaptacao: adaptacao.emAdaptacao, fase: adaptacao.fase, diaDaFase: adaptacao.diaDaFase,
      previstoRacaoAdaptacao: numeroAnimaisAtual(lote) * adaptacao.racaoKg,
      previstoVolumosoAdaptacao: numeroAnimaisAtual(lote) * adaptacao.volumosoKg,
    };
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">🌾 Ração no Cocho</h1>
          <p className="text-gray-500 text-sm mt-1">
            Anote os 3 tratos do dia (ração e volumoso) de cada lote — ração e volumoso são
            precificados separadamente, com base na dieta aprovada.
          </p>
        </div>
        <NovoRegistroCochoForm lotes={lotesAtivos} />
      </div>

      {resumoPorLote.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">Nenhum lote ativo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {resumoPorLote.map(({ lote, fasesDoLote, kgLiquido, custoTotal, custoRacaoKg, custoVolKg, mediaDiariaKg, previstoKgDia, diasDistintos, dias, emAdaptacao, fase, diaDaFase, previstoRacaoAdaptacao, previstoVolumosoAdaptacao }) => (
            <div key={lote.id} className="card">
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-800">{lote.nome}</span>
                <span className="badge-ativo">ATIVO</span>
              </div>
              {emAdaptacao && fase && (
                <div className="mt-2 mb-1 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-amber-800">
                    🌱 {fase.ordem}ª fase de adaptação — dia {diaDaFase} de {fase.dias_duracao} (dia {dias} de confinamento)
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Previsto hoje: {previstoRacaoAdaptacao.toFixed(1)} kg ração + {previstoVolumosoAdaptacao.toFixed(1)} kg volumoso
                  </p>
                </div>
              )}
              {!emAdaptacao && fasesDoLote.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 mb-1">
                  Nenhuma fase de adaptação cadastrada — usando direto a dieta fixa de Formulação.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Colocado (líquido)</p>
                  <p className="font-semibold">{kgLiquido.toLocaleString("pt-BR")} kg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custo Estimado</p>
                  <p className="font-semibold text-brand-700">{formatBRL(custoTotal)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Média/dia registrada</p>
                  <p className="font-semibold">{mediaDiariaKg.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Previsto {emAdaptacao ? "(adaptação)" : "pela dieta"}</p>
                  <p className="font-semibold text-purple-600">{previstoKgDia.toFixed(1)} kg/dia</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 border-t border-gray-50 pt-2">
                Ração: {formatBRL(custoRacaoKg)}/kg · Volumoso: {formatBRL(custoVolKg)}/kg
              </p>
              {diasDistintos > 0 && previstoKgDia > 0 && (
                <p className={`text-xs mt-2 ${mediaDiariaKg > previstoKgDia * 1.1 ? "text-amber-600" : mediaDiariaKg < previstoKgDia * 0.9 ? "text-blue-600" : "text-green-600"}`}>
                  {mediaDiariaKg > previstoKgDia * 1.1
                    ? "⚠ Colocando mais que o previsto"
                    : mediaDiariaKg < previstoKgDia * 0.9
                    ? "ℹ Colocando menos que o previsto"
                    : "✓ Dentro do previsto"}
                </p>
              )}
              <FasesAdaptacaoBotao loteId={lote.id} loteNome={lote.nome} fases={fasesDoLote} />
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="font-bold text-gray-700 mb-3">Histórico de Registros</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 font-medium">Data</th>
              <th className="py-2 font-medium">Lote</th>
              <th className="py-2 font-medium">Trato</th>
              <th className="py-2 font-medium">Horário</th>
              <th className="py-2 font-medium">Ração</th>
              <th className="py-2 font-medium">Volumoso</th>
              <th className="py-2 font-medium">Sobrou?</th>
              <th className="py-2 font-medium">Líquido</th>
              <th className="py-2 font-medium">Custo</th>
              <th className="py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {todosRegistros.length === 0 ? (
              <tr><td colSpan={10} className="py-6 text-center text-gray-400">Nenhum registro ainda.</td></tr>
            ) : todosRegistros.map((r) => {
              const lote = loteById.get(r.lote_id);
              const kgLiquido = kgLiquidoRegistro(r);
              const custo = lote ? custoRegistro(r, lote.id) : 0;
              return (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2">{new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="py-2">{r.lotes?.nome}</td>
                  <td className="py-2">{NOME_TRATO[r.trato_numero] ?? `${r.trato_numero}º Trato`}</td>
                  <td className="py-2 text-gray-500">{r.horario?.slice(0, 5)}</td>
                  <td className="py-2">{r.racao_kg} kg</td>
                  <td className="py-2">{r.volumoso_kg} kg</td>
                  <td className="py-2">
                    {r.sobrou ? <span className="badge-baixo">Sim · {r.sobra_kg} kg</span> : <span className="badge-ativo">Não</span>}
                  </td>
                  <td className="py-2 font-medium">{kgLiquido.toFixed(1)} kg</td>
                  <td className="py-2">{formatBRL(custo)}</td>
                  <td className="py-2"><ExcluirCochoBotao id={r.id} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
