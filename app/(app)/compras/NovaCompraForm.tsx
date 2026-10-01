"use client";

import { useState, useRef } from "react";
import { criarCompra } from "./actions";
import { formatBRL } from "@/lib/calculations";

const KG_POR_ARROBA = 15;

export default function NovaCompraForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [unidadePreco, setUnidadePreco] = useState<"arroba" | "kg">("arroba");
  const [precoDigitado, setPrecoDigitado] = useState(0);
  const [pesoEntrada, setPesoEntrada] = useState(0);
  const [quantidade, setQuantidade] = useState(0);

  const precoPorKg = unidadePreco === "arroba" ? precoDigitado / KG_POR_ARROBA : precoDigitado;
  const valorTotalEstimado = quantidade * pesoEntrada * precoPorKg;

  async function handleSubmit(formData: FormData) {
    // sempre manda o preço já convertido pra R$/kg, seja qual for a unidade escolhida acima
    formData.set("preco_compra_kg", String(precoPorKg));
    setLoading(true);
    try {
      await criarCompra(formData);
      formRef.current?.reset();
      setUnidadePreco("arroba"); setPrecoDigitado(0); setPesoEntrada(0); setQuantidade(0);
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
              <input name="quantidade_inicial" type="number" min={1} required className="input-field" placeholder="Ex: 50"
                value={quantidade || ""} onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label-field">Peso Médio Entrada (kg)</label>
            <input name="peso_entrada" type="number" step="0.1" min={0} required className="input-field" placeholder="Ex: 380"
              value={pesoEntrada || ""} onChange={(e) => setPesoEntrada(parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <label className="label-field">Preço negociado</label>
            <div className="flex gap-2">
              <select
                value={unidadePreco}
                onChange={(e) => setUnidadePreco(e.target.value as "arroba" | "kg")}
                className="input-field w-40 flex-shrink-0"
              >
                <option value="arroba">R$ por arroba (@)</option>
                <option value="kg">R$ por kg vivo</option>
              </select>
              <input
                type="number" step="0.01" min={0} required className="input-field"
                placeholder={unidadePreco === "arroba" ? "Ex: 300" : "Ex: 20"}
                value={precoDigitado || ""}
                onChange={(e) => setPrecoDigitado(parseFloat(e.target.value) || 0)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {unidadePreco === "arroba" ? (
                <>1 arroba = {KG_POR_ARROBA} kg → equivale a <strong>{formatBRL(precoPorKg)}/kg vivo</strong></>
              ) : (
                <>equivale a <strong>{formatBRL(precoPorKg * KG_POR_ARROBA)}/arroba</strong></>
              )}
              {quantidade > 0 && pesoEntrada > 0 && (
                <> · Valor total estimado: <strong>{formatBRL(valorTotalEstimado)}</strong></>
              )}
            </p>
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
