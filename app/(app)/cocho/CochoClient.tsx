"use client";

import { useState } from "react";
import { registrarTratosDoDia, excluirCocho, TratoInput } from "./actions";
import { Lote } from "@/lib/types";

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
