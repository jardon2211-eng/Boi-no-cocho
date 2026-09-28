"use client";

import { useState, useRef } from "react";
import { registrarMovimento, excluirMovimento } from "./actions";
import { Produto, Lote } from "@/lib/types";

export function NovoMovimentoForm({ produtos, lotes }: { produtos: Produto[]; lotes: Lote[] }) {
  const [open, setOpen] = useState<null | "Entrada" | "Saída">(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await registrarMovimento(formData);
      formRef.current?.reset();
      setOpen(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => setOpen("Saída")} className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-lg">
        ↓ Registrar Saída
      </button>
      <button onClick={() => setOpen("Entrada")} className="btn-primary text-sm">
        + Registrar Entrada
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="font-bold text-gray-800 mb-3">Registrar {open}</h3>
            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <input type="hidden" name="tipo" value={open} />
              <div>
                <label className="label-field">Produto</label>
                <select name="produto_id" required className="input-field">
                  {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Quantidade (kg)</label>
                <input name="quantidade_kg" type="number" step="1" min={1} required className="input-field" />
              </div>
              {open === "Saída" && (
                <div>
                  <label className="label-field">Lote (opcional)</label>
                  <select name="lote_id" className="input-field">
                    <option value="">—</option>
                    {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="label-field">Data</label>
                <input name="data" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <label className="label-field">Observação</label>
                <input name="observacao" className="input-field" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(null)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExcluirMovimentoBotao({ id }: { id: string }) {
  return (
    <form action={excluirMovimento.bind(null, id)}>
      <button className="text-red-500 hover:underline text-xs">excluir</button>
    </form>
  );
}
