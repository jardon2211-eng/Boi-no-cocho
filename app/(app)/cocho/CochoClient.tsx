"use client";

import { useState, useRef } from "react";
import { registrarCocho, excluirCocho } from "./actions";
import { Lote } from "@/lib/types";

export function NovoRegistroCochoForm({ lotes }: { lotes: Lote[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await registrarCocho(formData);
      formRef.current?.reset();
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
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="font-bold text-gray-800 mb-3">Ração Colocada no Cocho Hoje</h3>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">Lote</label>
            <select name="lote_id" required className="input-field">
              {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Data</label>
            <input name="data" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Qtd. Colocada (kg)</label>
              <input name="quantidade_kg" type="number" step="0.1" min={0.1} required className="input-field" placeholder="Ex: 450" />
            </div>
            <div>
              <label className="label-field">Sobra no Cocho (kg)</label>
              <input name="sobra_kg" type="number" step="0.1" min={0} className="input-field" defaultValue={0} />
            </div>
          </div>
          <div>
            <label className="label-field">Observação</label>
            <input name="observacao" className="input-field" placeholder="Ex: trato da manhã" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </form>
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
