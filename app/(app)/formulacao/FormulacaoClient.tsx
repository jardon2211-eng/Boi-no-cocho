"use client";

import { useState, useRef } from "react";
import { criarProduto, criarFormulacao, aprovarFormulacao, excluirFormulacao, excluirProduto } from "./actions";
import { Produto, Lote } from "@/lib/types";

export function NovoProdutoForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await criarProduto(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary">+ Novo Produto</button>;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="font-bold text-gray-800 mb-3">Novo Produto</h3>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <div>
            <label className="label-field">Nome</label>
            <input name="nome" required className="input-field" placeholder="Ex: Milho" />
          </div>
          <div>
            <label className="label-field">Categoria</label>
            <input name="categoria" className="input-field" placeholder="Ex: Grão energético" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Preço/kg (R$)</label>
              <input name="preco_kg" type="number" step="0.01" required className="input-field" />
            </div>
            <div>
              <label className="label-field">Estoque Mínimo (kg)</label>
              <input name="estoque_minimo_kg" type="number" step="1" className="input-field" defaultValue={0} />
            </div>
          </div>
          <div>
            <label className="label-field">Fornecedor</label>
            <input name="fornecedor" className="input-field" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProdutosTable({ produtos }: { produtos: Produto[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-100">
          <th className="py-2 font-medium">Produto</th>
          <th className="py-2 font-medium">Categoria</th>
          <th className="py-2 font-medium">Preço/kg</th>
          <th className="py-2 font-medium">Estoque Mín.</th>
          <th className="py-2 font-medium">Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.length === 0 ? (
          <tr><td colSpan={5} className="py-6 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>
        ) : produtos.map((p) => (
          <tr key={p.id} className="border-b border-gray-50">
            <td className="py-2 font-medium">{p.nome}</td>
            <td className="py-2 text-gray-500">{p.categoria || "—"}</td>
            <td className="py-2">R$ {p.preco_kg.toFixed(2)}</td>
            <td className="py-2 text-gray-500">{p.estoque_minimo_kg} kg</td>
            <td className="py-2">
              <form action={excluirProduto.bind(null, p.id)}>
                <button className="text-red-500 hover:underline text-xs">excluir</button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function NovaFormulacaoForm({ lotes, produtos }: { lotes: Lote[]; produtos: Produto[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await criarFormulacao(formData);
      formRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  if (lotes.length === 0 || produtos.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Cadastre ao menos um produto e um lote (em Compras) para montar uma dieta.
      </p>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
      <div>
        <label className="label-field">Lote</label>
        <select name="lote_id" required className="input-field">
          {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="label-field">Produto</label>
        <select name="produto_id" required className="input-field">
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="label-field">Kg/Animal/Dia</label>
        <input name="kg_animal_dia" type="number" step="0.01" min={0} required className="input-field" />
      </div>
      <div>
        <label className="label-field">Data</label>
        <input name="data" type="date" required className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary h-[38px]">
        {loading ? "Salvando..." : "+ Adicionar"}
      </button>
    </form>
  );
}

export function AprovarBotao({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => { setLoading(true); await aprovarFormulacao(id); setLoading(false); }}
      className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
    >
      ✓ Aprovar
    </button>
  );
}

export function ExcluirFormulacaoBotao({ id }: { id: string }) {
  return (
    <form action={excluirFormulacao.bind(null, id)}>
      <button className="text-red-500 hover:underline text-xs">excluir</button>
    </form>
  );
}
