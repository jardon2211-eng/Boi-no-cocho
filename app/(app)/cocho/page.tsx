import { createClient } from "@/lib/supabase/server";
import { Lote, Formulacao, CochoRegistro } from "@/lib/types";
import { numeroAnimaisAtual, custoMedioPorKgDieta, formatBRL } from "@/lib/calculations";
import { NovoRegistroCochoForm, ExcluirCochoBotao } from "./CochoClient";

export default async function CochoPage() {
  const supabase = createClient();
  const [{ data: lotes }, { data: formulacoes }, { data: registros }] = await Promise.all([
    supabase.from("lotes").select("*"),
    supabase.from("formulacoes").select("*, produtos(*)"),
    supabase.from("cocho_registros").select("*, lotes(nome)").order("data", { ascending: false }),
  ]);

  const todosLotes = (lotes ?? []) as Lote[];
  const todasFormulacoes = (formulacoes ?? []) as Formulacao[];
  const todosRegistros = (registros ?? []) as any[];
  const lotesAtivos = todosLotes.filter((l) => l.status === "Ativo");
  const loteById = new Map(todosLotes.map((l) => [l.id, l]));

  // resumo por lote: total colocado, total sobra, custo estimado, média diária
  const resumoPorLote = lotesAtivos.map((lote) => {
    const registrosDoLote = todosRegistros.filter((r) => r.lote_id === lote.id);
    const totalColocado = registrosDoLote.reduce((s, r) => s + r.quantidade_kg, 0);
    const totalSobra = registrosDoLote.reduce((s, r) => s + r.sobra_kg, 0);
    const kgLiquido = totalColocado - totalSobra;
    const custoKg = custoMedioPorKgDieta(todasFormulacoes, lote.id);
    const custoTotal = kgLiquido * custoKg;
    const dias = registrosDoLote.length;
    const mediaDiariaKg = dias > 0 ? kgLiquido / dias : 0;
    const previstoKgDia = numeroAnimaisAtual(lote) * (
      todasFormulacoes
        .filter((f) => f.lote_id === lote.id && f.status === "Aprovado")
        .reduce((s, f) => s + f.kg_animal_dia, 0)
    );
    return { lote, totalColocado, totalSobra, kgLiquido, custoTotal, custoKg, dias, mediaDiariaKg, previstoKgDia };
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">🌾 Ração no Cocho</h1>
          <p className="text-gray-500 text-sm mt-1">
            Anote diariamente quanto de ração foi de fato colocado no cocho de cada lote — o custo é calculado com base na dieta aprovada.
          </p>
        </div>
        <NovoRegistroCochoForm lotes={lotesAtivos} />
      </div>

      {resumoPorLote.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">Nenhum lote ativo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {resumoPorLote.map(({ lote, kgLiquido, custoTotal, mediaDiariaKg, previstoKgDia, dias }) => (
            <div key={lote.id} className="card">
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-800">{lote.nome}</span>
                <span className="badge-ativo">ATIVO</span>
              </div>
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
                  <p className="text-gray-400 text-xs">Previsto pela dieta</p>
                  <p className="font-semibold text-purple-600">{previstoKgDia.toFixed(1)} kg/dia</p>
                </div>
              </div>
              {dias > 0 && previstoKgDia > 0 && (
                <p className={`text-xs mt-3 ${mediaDiariaKg > previstoKgDia * 1.1 ? "text-amber-600" : mediaDiariaKg < previstoKgDia * 0.9 ? "text-blue-600" : "text-green-600"}`}>
                  {mediaDiariaKg > previstoKgDia * 1.1
                    ? "⚠ Colocando mais que o previsto pela dieta"
                    : mediaDiariaKg < previstoKgDia * 0.9
                    ? "ℹ Colocando menos que o previsto pela dieta"
                    : "✓ Dentro do previsto pela dieta"}
                </p>
              )}
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
              <th className="py-2 font-medium">Colocado</th>
              <th className="py-2 font-medium">Sobra</th>
              <th className="py-2 font-medium">Líquido</th>
              <th className="py-2 font-medium">Custo</th>
              <th className="py-2 font-medium">Observação</th>
              <th className="py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {todosRegistros.length === 0 ? (
              <tr><td colSpan={8} className="py-6 text-center text-gray-400">Nenhum registro ainda.</td></tr>
            ) : todosRegistros.map((r) => {
              const lote = loteById.get(r.lote_id);
              const kgLiquido = r.quantidade_kg - r.sobra_kg;
              const custo = lote ? kgLiquido * custoMedioPorKgDieta(todasFormulacoes, lote.id) : 0;
              return (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2">{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                  <td className="py-2">{r.lotes?.nome}</td>
                  <td className="py-2">{r.quantidade_kg} kg</td>
                  <td className="py-2 text-gray-500">{r.sobra_kg} kg</td>
                  <td className="py-2 font-medium">{kgLiquido.toFixed(1)} kg</td>
                  <td className="py-2">{formatBRL(custo)}</td>
                  <td className="py-2 text-gray-500">{r.observacao || "—"}</td>
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
