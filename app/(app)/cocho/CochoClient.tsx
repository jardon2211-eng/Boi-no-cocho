"use client";

import { useState } from "react";
import { registrarTratosDoDia, excluirCocho, criarFaseAdaptacao, excluirFaseAdaptacao, TratoInput } from "./actions";
import { Lote, FaseAdaptacao } from "@/lib/types";
import { sugestaoFaseAdaptacao } from "@/lib/calculations";

const TRATOS_PADRAO: TratoInput[] = [
  { trato_numero: 1, horario: "07:00", racao_kg: 0, volumoso_kg: 0, sobrou: false, sobra_kg: 0 },
  { trato_numero: 2, horario: "12:00", racao_kg: 0, volumoso_kg: 0, sobrou: false, sobra_kg: 0 },
  { trato_numero: 3, horario: "17:00", racao_kg: 0, volumoso_kg: 0, sobrou: false, sobra_kg: 0 },
];

const ICONE_TRATO = ["🌅", "☀️", "🌙"];
const NOME_TRATO = ["1º Trato", "2º Trato", "3º Trato"];

export function NovoRegistroCochoForm({ lotes }: { lotes: Lote[] }) {
  const [open, setOpen] = useState(false);
  const [loteId, setLoteId] = useState(lotes[0]?.id ?? "");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [tratos, setTratos] = useState<TratoInput[]>(TRATOS_PADRAO);
  const [loading, setLoading] = useState(false);

  function atualizarTrato(idx: number, campo: keyof TratoInput, valor: string | number | boolean) {
    setTratos((prev) => prev.map((t, i) => (i === idx ? { ...t, [campo]: valor } : t)));
  }

  async function handleSubmit() {
    if (!loteId) return;
    setLoading(true);
    try {
      await registrarTratosDoDia(loteId, data, tratos);
      setTratos(TRATOS_PADRAO);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (lotes.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum lote ativo. Registre uma compra primeiro.</p>;
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary">+ Registrar Ração no Cocho</button>;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-3">Ração Colocada no Cocho</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label-field">Lote</label>
            <select value={loteId} onChange={(e) => setLoteId(e.target.value)} className="input-field">
              {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="space-y-5">
          {tratos.map((t, idx) => (
            <div key={t.trato_numero} className={idx > 0 ? "pt-4 border-t border-gray-100" : ""}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">{NOME_TRATO[idx]}</span>
                <span className="text-xl">{ICONE_TRATO[idx]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Horário</label>
                  <input
                    type="time"
                    value={t.horario}
                    onChange={(e) => atualizarTrato(idx, "horario", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Ração (kg)</label>
                  <input
                    type="number" step="0.1" min={0}
                    value={t.racao_kg || ""}
                    onChange={(e) => atualizarTrato(idx, "racao_kg", parseFloat(e.target.value) || 0)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="label-field">Volumoso (kg)</label>
                <input
                  type="number" step="0.1" min={0}
                  value={t.volumoso_kg || ""}
                  onChange={(e) => atualizarTrato(idx, "volumoso_kg", parseFloat(e.target.value) || 0)}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div className="mt-3">
                <label className="label-field">Sobrou no cocho?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`sobrou-${idx}`}
                      checked={!t.sobrou}
                      onChange={() => atualizarTrato(idx, "sobrou", false)}
                    />
                    Não
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`sobrou-${idx}`}
                      checked={t.sobrou}
                      onChange={() => atualizarTrato(idx, "sobrou", true)}
                    />
                    Sim
                  </label>
                </div>
              </div>
              {t.sobrou && (
                <div className="mt-3">
                  <label className="label-field">Quantidade da sobra (kg)</label>
                  <input
                    type="number" step="0.1" min={0}
                    value={t.sobra_kg || ""}
                    onChange={(e) => atualizarTrato(idx, "sobra_kg", parseFloat(e.target.value) || 0)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-5">
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
          <button type="button" disabled={loading} onClick={handleSubmit} className="btn-primary flex-1">
            {loading ? "Salvando..." : "Salvar os 3 tratos"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExcluirCochoBotao({ id }: { id: string }) {
  return (
    <form action={excluirCocho.bind(null, id)}>
      <button className="text-red-500 hover:underline text-xs">excluir</button>
    </form>
  );
}

export function FasesAdaptacaoBotao({ loteId, loteNome, fases, pesoVivo }: { loteId: string; loteNome: string; fases: FaseAdaptacao[]; pesoVivo: number }) {
  const [open, setOpen] = useState(false);
  const [dias, setDias] = useState(3);
  const [racaoKg, setRacaoKg] = useState(0);
  const [volumosoKg, setVolumosoKg] = useState(0);
  const [loading, setLoading] = useState(false);

  const ordenadas = [...fases].sort((a, b) => a.ordem - b.ordem);
  const proximaFase = ordenadas.length + 1;

  function preencherSugestao() {
    const { racaoKg: r, volumosoKg: v } = sugestaoFaseAdaptacao(proximaFase, pesoVivo);
    setRacaoKg(r);
    setVolumosoKg(v);
  }

  async function handleAdicionar() {
    setLoading(true);
    try {
      await criarFaseAdaptacao(loteId, dias, racaoKg, volumosoKg);
      setDias(3); setRacaoKg(0); setVolumosoKg(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-center text-xs font-medium text-brand-600 hover:underline mt-2">
        ⚙️ Configurar fases de adaptação
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-1">Fases de Adaptação — {loteNome}</h3>
            <p className="text-xs text-gray-500 mb-4">
              Cadastre em ordem: quantos dias cada fase dura, e quanto de ração e volumoso dar por dia
              nela. Depois da última fase, o sistema passa a usar a dieta fixa de Formulação.
            </p>

            {ordenadas.length > 0 && (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="py-1 font-medium">Fase</th>
                    <th className="py-1 font-medium">Dias</th>
                    <th className="py-1 font-medium">Ração</th>
                    <th className="py-1 font-medium">Volumoso</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {ordenadas.map((f) => (
                    <tr key={f.id} className="border-b border-gray-50">
                      <td className="py-1">{f.ordem}ª</td>
                      <td className="py-1">{f.dias_duracao}d</td>
                      <td className="py-1">{f.racao_kg} kg</td>
                      <td className="py-1">{f.volumoso_kg} kg</td>
                      <td className="py-1">
                        <form action={excluirFaseAdaptacao.bind(null, f.id)}>
                          <button className="text-red-500 hover:underline text-xs">excluir</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-600">
                  Adicionar {proximaFase}ª fase
                </p>
                <button type="button" onClick={preencherSugestao} className="text-xs font-medium text-brand-600 hover:underline">
                  📊 Sugerir (Método Ararate · peso vivo {pesoVivo} kg)
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label-field">Dias</label>
                  <input type="number" min={1} className="input-field" value={dias || ""}
                    onChange={(e) => setDias(parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="label-field">Ração (kg)</label>
                  <input type="number" step="0.1" min={0} className="input-field" value={racaoKg || ""}
                    onChange={(e) => setRacaoKg(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="label-field">Volumoso (kg)</label>
                  <input type="number" step="0.1" min={0} className="input-field" value={volumosoKg || ""}
                    onChange={(e) => setVolumosoKg(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <button type="button" disabled={loading} onClick={handleAdicionar} className="btn-primary w-full mt-3 text-sm">
                {loading ? "Salvando..." : "+ Adicionar fase"}
              </button>
            </div>

            <button type="button" onClick={() => setOpen(false)} className="btn-secondary w-full mt-4">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
