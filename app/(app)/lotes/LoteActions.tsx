"use client";

import { useState } from "react";
import { ajustarAnimais, atualizarPeso, registrarVenda, excluirLote } from "../compras/actions";
import { Lote } from "@/lib/types";

export default function LoteActions({ lote }: { lote: Lote }) {
  const [modal, setModal] = useState<null | "peso" | "ajuste" | "venda">(null);
  const [loading, setLoading] = useState(false);

  async function submitPeso(formData: FormData) {
    setLoading(true);
    try {
      await atualizarPeso(lote.id, Number(formData.get("peso")));
      setModal(null);
    } finally {
      setLoading(false);
    }
  }

  async function submitAjuste(delta: number) {
    setLoading(true);
    try {
      await ajustarAnimais(lote.id, delta);
      setModal(null);
    } finally {
      setLoading(false);
    }
  }

  async function submitVenda(formData: FormData) {
    setLoading(true);
    try {
      await registrarVenda(lote.id, formData);
      setModal(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o lote "${lote.nome}"? Essa ação não pode ser desfeita.`)) return;
    await excluirLote(lote.id);
  }

  return (
    <div className="space-y-2 mt-4">
      <button onClick={() => setModal("peso")} className="w-full text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg py-2">
        📈 Atualizar Peso
      </button>
      <button onClick={() => setModal("ajuste")} className="w-full text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-2">
        + Adicionar / Remover Bois
      </button>
      {lote.status === "Ativo" && (
        <button onClick={() => setModal("venda")} className="w-full text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg py-2">
          🛒 Vender
        </button>
      )}
      <button onClick={handleDelete} className="w-full text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg py-2">
        🗑 Excluir Lote
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            {modal === "peso" && (
              <form action={submitPeso} className="space-y-3">
                <h3 className="font-bold text-gray-800">Atualizar Peso — {lote.nome}</h3>
                <div>
                  <label className="label-field">Peso médio atual (kg)</label>
                  <input name="peso" type="number" step="0.1" required autoFocus className="input-field" defaultValue={lote.peso_atual ?? ""} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">Salvar</button>
                </div>
              </form>
            )}

            {modal === "ajuste" && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800">Ajustar Animais — {lote.nome}</h3>
                <p className="text-sm text-gray-500">Quantidade atual: <strong>{lote.quantidade_inicial + lote.ajuste_animais}</strong></p>
                <AjusteForm onSubmit={submitAjuste} loading={loading} />
                <button onClick={() => setModal(null)} className="btn-secondary w-full">Fechar</button>
              </div>
            )}

            {modal === "venda" && (
              <form action={submitVenda} className="space-y-3">
                <h3 className="font-bold text-gray-800">Registrar Venda — {lote.nome}</h3>
                <div>
                  <label className="label-field">Data da Venda</label>
                  <input name="data_venda" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <label className="label-field">Peso médio de venda (kg)</label>
                  <input name="peso_venda" type="number" step="0.1" required className="input-field" />
                </div>
                <div>
                  <label className="label-field">Preço de venda /kg (R$)</label>
                  <input name="preco_venda_kg" type="number" step="0.01" required className="input-field" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">Confirmar Venda</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AjusteForm({ onSubmit, loading }: { onSubmit: (delta: number) => void; loading: boolean }) {
  const [valor, setValor] = useState(1);
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="input-field w-20"
      />
      <button disabled={loading} onClick={() => onSubmit(valor)} className="btn-primary flex-1">+ Adicionar</button>
      <button disabled={loading} onClick={() => onSubmit(-valor)} className="btn-secondary flex-1">− Remover</button>
    </div>
  );
}
