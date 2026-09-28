"use client";

import { useState, useRef } from "react";
import { criarCompra } from "./actions";

export default function NovaCompraForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await criarCompra(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Nova Compra
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-brand-700 mb-4">Nova Compra de Gado</h2>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">Nome do Lote</label>
            <input name="nome" className="input-field" placeholder="Ex: Lote Início" />
          </div>
          <div>
            <label className="label-field">Fornecedor</label>
            <input name="fornecedor" className="input-field" placeholder="Ex: Fazenda Santa Rita" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Data da Compra</label>
              <input name="data_entrada" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label className="label-field">Nº de Animais</label>
              <input name="quantidade_inicial" type="number" min={1} required className="input-field" placeholder="Ex: 50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Peso Médio Entrada (kg)</label>
              <input name="peso_entrada" type="number" step="0.1" min={0} required className="input-field" placeholder="Ex: 380" />
            </div>
            <div>
              <label className="label-field">Preço/kg Vivo (R$)</label>
              <input name="preco_compra_kg" type="number" step="0.01" min={0} required className="input-field" placeholder="Ex: 14.50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">GMD Esperado (kg/dia)</label>
              <input name="gmd_esperado" type="number" step="0.01" min={0} required className="input-field" defaultValue="1.5" />
            </div>
            <div>
              <label className="label-field">Dias Previstos</label>
              <input name="dias_previstos" type="number" min={1} required className="input-field" defaultValue="90" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando..." : "Criar Lote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
