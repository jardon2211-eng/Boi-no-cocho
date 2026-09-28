"use client";

import { useState, useRef } from "react";
import { criarDespesa, excluirDespesa } from "./actions";
import { Lote } from "@/lib/types";

export function NovaDespesaForm({ lotes }: { lotes: Lote[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await criarDespesa(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary">+ Nova Despesa</button>;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="font-bold text-gray-800 mb-3">Nova Despesa</h3>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">Descrição</label>
            <input name="descricao" required className="input-field" placeholder="Ex: Frete dos animais" />
          </div>
          <div>
            <label className="label-field">Lote (opcional)</label>
            <select name="lote_id" className="input-field">
              <option value="">— Despesa geral —</option>
              {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Categoria</label>
              <select name="categoria" required className="input-field">
                <option value="Variável">Variável</option>
                <option value="Fixa">Fixa</option>
              </select>
            </div>
            <div>
              <label className="label-field">Valor (R$)</label>
              <input name="valor" type="number" step="0.01" min={0} required className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-field">Data</label>
            <input name="data" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ExcluirDespesaBotao({ id }: { id: string }) {
  return (
    <form action={excluirDespesa.bind(null, id)}>
      <button className="text-red-500 hover:underline text-xs">excluir</button>
    </form>
  );
}
