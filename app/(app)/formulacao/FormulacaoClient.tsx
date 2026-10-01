"use client";

import { useState, useRef } from "react";
import {
  criarProduto, excluirProduto, criarDietaCompleta, aprovarDieta, excluirDieta,
} from "./actions";
import { Produto, Lote, ItemReceita } from "@/lib/types";
import { formatBRL } from "@/lib/calculations";

/** Converte com segurança qualquer valor vindo do banco (às vezes chega como texto) pra número. */
function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

export function NovoProdutoForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kgSaco, setKgSaco] = useState(1);
  const [precoSaco, setPrecoSaco] = useState(0);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await criarProduto(formData);
      setOpen(false);
      setKgSaco(1); setPrecoSaco(0);
    } finally {
      setLoading(false);
    }
  }

  const custoKgPreview = kgSaco > 0 ? precoSaco / kgSaco : 0;

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary">+ Novo Produto</button>;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="font-bold text-gray-800 mb-3">Novo Produto</h3>
        <form action={handleSubmit} className="space-y-3">
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
              <label className="label-field">Kg por Saco</label>
              <input name="kg_por_saco" type="number" step="0.1" min={0.1} required className="input-field"
                value={kgSaco} onChange={(e) => setKgSaco(parseFloat(e.target.value) || 0)} placeholder="Ex: 40" />
            </div>
            <div>
              <label className="label-field">Valor/Saco (R$)</label>
              <input name="preco_saco" type="number" step="0.01" min={0} required className="input-field"
                value={precoSaco} onChange={(e) => setPrecoSaco(parseFloat(e.target.value) || 0)} placeholder="Ex: 65" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Custo por kg calculado: <strong>{formatBRL(custoKgPreview)}</strong>
            {" "}— pra comprar por kg direto (sem saco), deixe "Kg por Saco" = 1.
          </p>
          <div>
            <label className="label-field">Estoque Mínimo (kg)</label>
            <input name="estoque_minimo_kg" type="number" step="1" className="input-field" defaultValue={0} />
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
          <th className="py-2 font-medium">Kg/Saco</th>
          <th className="py-2 font-medium">Valor/Saco</th>
          <th className="py-2 font-medium">Custo/Kg</th>
          <th className="py-2 font-medium">Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.length === 0 ? (
          <tr><td colSpan={5} className="py-6 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>
        ) : produtos.map((p) => (
          <tr key={p.id} className="border-b border-gray-50">
            <td className="py-2 font-medium">{p.nome}</td>
            <td className="py-2 text-gray-500">{p.kg_por_saco} kg</td>
            <td className="py-2 text-gray-500">{formatBRL(p.preco_saco)}</td>
            <td className="py-2 font-semibold text-green-700">{formatBRL(p.preco_kg)}</td>
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

type LinhaReceita = ItemReceita & { _key: number };

export function NovaDietaForm({ lotes, produtos }: { lotes: Lote[]; produtos: Produto[] }) {
  const proximoKey = useRef(1);
  const novaLinha = (): LinhaReceita => ({ _key: proximoKey.current++, produto_id: produtos[0]?.id ?? "", percentual: 0 });

  const [loteId, setLoteId] = useState<string>("__independente__");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [kgDiaTotal, setKgDiaTotal] = useState(0);
  const [itens, setItens] = useState<LinhaReceita[]>(() => [novaLinha()]);
  const [loading, setLoading] = useState(false);

  const totalPct = itens.reduce((s, i) => s + num(i.percentual), 0);
  const custoPorKgRacao = itens.reduce((s, i) => {
    const p = produtos.find((x) => x.id === i.produto_id);
    return s + (p ? (num(i.percentual) / 100) * num(p.preco_kg) : 0);
  }, 0);
  const custoAnimalDia = custoPorKgRacao * num(kgDiaTotal);

  function atualizarItem<K extends keyof ItemReceita>(key: number, campo: K, valor: ItemReceita[K]) {
    setItens((prev) => prev.map((it) => (it._key === key ? { ...it, [campo]: valor } : it)));
  }
  function adicionarItem() {
    setItens((prev) => [...prev, novaLinha()]);
  }
  function removerItem(key: number) {
    setItens((prev) => prev.filter((it) => it._key !== key));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const loteReal = loteId === "__independente__" ? null : loteId;
      const payload: ItemReceita[] = itens.map(({ produto_id, percentual }) => ({ produto_id, percentual: num(percentual) }));
      await criarDietaCompleta(loteReal, data, num(kgDiaTotal), payload);
      setItens([novaLinha()]);
      setKgDiaTotal(0);
    } finally {
      setLoading(false);
    }
  }

  if (produtos.length === 0) {
    return <p className="text-sm text-gray-400">Cadastre ao menos um produto pra montar uma dieta.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="label-field">Lote</label>
          <select value={loteId} onChange={(e) => setLoteId(e.target.value)} className="input-field">
            <option value="__independente__">Sem Lote (Independente)</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">Kg/Dia Total (por animal)</label>
          <input type="number" step="0.01" min={0} value={kgDiaTotal || ""}
            onChange={(e) => setKgDiaTotal(parseFloat(e.target.value) || 0)} className="input-field" placeholder="Ex: 8" />
        </div>
      </div>

      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="py-2 font-medium">Produto</th>
            <th className="py-2 font-medium">% na Dieta</th>
            <th className="py-2 font-medium">Kg/Dia</th>
            <th className="py-2 font-medium">Custo/Dia</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const p = produtos.find((x) => x.id === item.produto_id);
            const kgDia = (num(item.percentual) / 100) * num(kgDiaTotal);
            const custoDia = kgDia * num(p?.preco_kg);
            return (
              <tr key={item._key} className="border-b border-gray-50">
                <td className="py-2">
                  <select value={item.produto_id} onChange={(e) => atualizarItem(item._key, "produto_id", e.target.value)} className="input-field">
                    {produtos.map((prod) => <option key={prod.id} value={prod.id}>{prod.nome}</option>)}
                  </select>
                </td>
                <td className="py-2">
                  <input type="number" step="0.1" min={0} max={100} value={item.percentual || ""}
                    onChange={(e) => atualizarItem(item._key, "percentual", parseFloat(e.target.value) || 0)}
                    className="input-field w-24" placeholder="%" />
                </td>
                <td className="py-2 text-gray-500">{kgDia.toFixed(2)} kg</td>
                <td className="py-2 text-gray-500">{formatBRL(custoDia)}</td>
                <td className="py-2">
                  <button type="button" onClick={() => removerItem(item._key)} className="text-red-500 text-xs hover:underline">remover</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" onClick={adicionarItem} className="text-sm font-semibold text-brand-600 hover:underline mb-4">
        + Adicionar ingrediente
      </button>

      <div className={`rounded-lg p-3 mb-4 text-sm flex justify-between items-center ${Math.round(totalPct) === 100 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
        <span>Total da dieta: <strong>{totalPct.toFixed(1)}%</strong> {Math.round(totalPct) !== 100 && "(precisa somar 100%)"}</span>
        <span>Custo/kg de ração: <strong>{formatBRL(custoPorKgRacao)}</strong> · Custo/animal/dia: <strong>{formatBRL(custoAnimalDia)}</strong></span>
      </div>

      <button
        type="button"
        disabled={loading || Math.round(totalPct) !== 100 || num(kgDiaTotal) <= 0}
        onClick={handleSubmit}
        className="btn-primary"
      >
        {loading ? "Salvando..." : "Salvar Dieta"}
      </button>
    </div>
  );
}

export function AprovarDietaBotao({ loteId, data }: { loteId: string | null; data: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => { setLoading(true); await aprovarDieta(loteId, data); setLoading(false); }}
      className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
    >
      ✓ Aprovar
    </button>
  );
}

export function ExcluirDietaBotao({ loteId, data }: { loteId: string | null; data: string }) {
  return (
    <form action={excluirDieta.bind(null, loteId, data)}>
      <button className="text-red-500 hover:underline text-xs">excluir</button>
    </form>
  );
}
