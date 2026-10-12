import { createClient } from "@/lib/supabase/server";
import { Lote } from "@/lib/types";
import { numeroAnimaisAtual, pesoVivoAtual, diasConfinamento } from "@/lib/calculations";
import { planoAdaptacao, faseDeHoje, fmtKg, HORARIOS_TRATO, TOTAL_FASES, DIAS_POR_FASE } from "@/lib/adaptacao";
import { criarLoteAdaptacao, atualizarPesoAdaptacao } from "./actions";

function NovoLoteForm() {
  const hoje = new Date().toISOString().slice(0, 10);
  return (
    <form action={criarLoteAdaptacao} className="card space-y-4 max-w-md">
      <div>
        <label className="label-field">Nome do lote</label>
        <input name="nome" className="input-field" placeholder="Ex: Lote Outubro" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Nº de animais</label>
          <input name="quantidade" type="number" min={1} required inputMode="numeric" className="input-field" />
        </div>
        <div>
          <label className="label-field">Data de entrada</label>
          <input name="data_entrada" type="date" required defaultValue={hoje} className="input-field" />
        </div>
      </div>
      <div>
        <label className="label-field">Peso médio de entrada (kg por animal)</label>
        <input name="peso" type="number" step="0.1" min={1} required inputMode="decimal" className="input-field text-xl font-bold" />
        <p className="text-xs text-gray-500 mt-1">Você poderá atualizar esse peso quando pesar de novo.</p>
      </div>
      <button type="submit" className="btn-primary w-full">Gerar plano de adaptação</button>
    </form>
  );
}

export default async function AdaptacaoPage() {
  const supabase = createClient();
  const { data } = await supabase.from("lotes").select("*").order("created_at", { ascending: false });
  const lotes = ((data ?? []) as Lote[]).filter((l) => l.status === "Ativo");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700">🌱 Adaptação</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Informe o peso do lote e receba as {TOTAL_FASES} fases dos 15 dias de adaptação, com a ração e o
        volumoso de cada trato. Pesou de novo? Atualize o peso e o plano se recalcula.
      </p>

      {lotes.length === 0 ? (
        <NovoLoteForm />
      ) : (
        <div className="space-y-10">
          {lotes.map((lote) => {
            const peso = pesoVivoAtual(lote);
            const animais = numeroAnimaisAtual(lote);
            const dia = Math.max(1, diasConfinamento(lote));
            const fasePeso = faseDeHoje(dia);
            const fases = planoAdaptacao(peso, animais);
            return (
              <section key={lote.id} className="space-y-4">
                <div className="card space-y-4">
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <h2 className="text-xl font-bold text-gray-800">{lote.nome}</h2>
                    <span className="text-sm text-gray-500">
                      entrada {new Date(lote.data_entrada + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Animais</p>
                      <p className="text-2xl font-bold">{animais}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Peso médio atual</p>
                      <p className="text-2xl font-bold">{fmtKg(peso, 1)} kg</p>
                    </div>
                  </div>
                  <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                    {fasePeso
                      ? `Hoje: dia ${dia} de ${TOTAL_FASES * DIAS_POR_FASE}, Fase ${fasePeso}`
                      : `Adaptação concluída (dia ${dia}). Siga a dieta fixa da Formulação.`}
                  </p>
                  <form action={atualizarPesoAdaptacao.bind(null, lote.id)} className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <label className="label-field">Pesei de novo: peso médio (kg por animal)</label>
                      <input
                        name="peso" type="number" step="0.1" min={1} required inputMode="decimal"
                        defaultValue={peso} className="input-field text-lg font-bold"
                      />
                    </div>
                    <button type="submit" className="btn-primary">Atualizar peso</button>
                  </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {fases.map((f) => {
                    const hojeFase = f.numero === fasePeso;
                    return (
                      <div
                        key={f.numero}
                        className={`card space-y-3 ${hojeFase ? "border-2 border-amber-400 bg-amber-50" : ""}`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg text-brand-700">
                            Fase {f.numero}{" "}
                            <span className="text-sm font-semibold text-gray-500">
                              · dias {f.diaInicio} a {f.diaFim}
                            </span>
                          </h3>
                          {hojeFase && (
                            <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-gray-900">
                              HOJE
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Ração por animal</p>
                            <p className="text-2xl font-bold">{fmtKg(f.racaoAnimalKg)} kg</p>
                            <p className="text-xs text-gray-500">{fmtKg(f.pctRacao, 1)}% do peso</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Volumoso por animal</p>
                            <p className="text-2xl font-bold">{fmtKg(f.volumosoAnimalKg)} kg</p>
                            <p className="text-xs text-gray-500">{fmtKg(f.pctVolumoso, 1)}% do peso</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-sm font-semibold mb-2">Lote, em cada trato:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {HORARIOS_TRATO.map((h) => (
                              <div key={h} className="rounded-lg bg-gray-50 px-2.5 py-2 text-sm">
                                <p className="font-bold text-brand-700">{h}</p>
                                <p>Ração {fmtKg(f.racaoLoteTratoKg, 1)} kg</p>
                                <p>Vol. {fmtKg(f.volumosoLoteTratoKg, 1)} kg</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Lote, por dia: ração {fmtKg(f.racaoLoteDiaKg, 1)} kg · volumoso {fmtKg(f.volumosoLoteDiaKg, 1)} kg
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                  <strong>Dia {TOTAL_FASES * DIAS_POR_FASE + 1} em diante:</strong> o lote segue a dieta fixa da
                  Formulação. Os 3 tratos têm a mesma quantidade, que é o total do dia dividido por 3.
                </p>
              </section>
            );
          })}

          <details className="max-w-md">
            <summary className="cursor-pointer text-sm font-semibold text-brand-700">+ Registrar outro lote</summary>
            <div className="mt-3">
              <NovoLoteForm />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
