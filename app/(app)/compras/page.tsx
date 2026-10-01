import { createClient } from "@/lib/supabase/server";
import { Lote } from "@/lib/types";
import { pesoFinalProjetado, diasConfinamento, formatBRL, valorCompra } from "@/lib/calculations";
import NovaCompraForm from "./NovaCompraForm";

export default async function ComprasPage() {
  const supabase = createClient();
  const { data: lotes } = await supabase
    .from("lotes")
    .select("*")
    .order("created_at", { ascending: false });

  const todosLotes = (lotes ?? []) as Lote[];

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">🛒 Compras de Gado</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de entrada com criação automática de lote</p>
        </div>
        <NovaCompraForm />
      </div>

      {todosLotes.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">
          Nenhuma compra registrada ainda. Clique em "Nova Compra" para começar.
        </div>
      ) : (
        <div className="space-y-4">
          {todosLotes.map((lote) => {
            const pesoFinal = pesoFinalProjetado(lote);
            const ganhoTotal = (pesoFinal - lote.peso_entrada) * lote.quantidade_inicial;
            const ganhoPorBoi = pesoFinal - lote.peso_entrada;
            return (
              <div key={lote.id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">🐂 {lote.nome}</span>
                    <p className="text-xs text-gray-400">
                      📅 {new Date(lote.data_entrada).toLocaleDateString("pt-BR")}
                      {lote.fornecedor ? ` · ${lote.fornecedor}` : ""}
                    </p>
                  </div>
                  <span className={lote.status === "Ativo" ? "badge-ativo" : "badge-vendido"}>
                    {lote.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Quantidade</p>
                    <p className="font-semibold">{lote.quantidade_inicial} bois</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Peso Médio Entrada</p>
                    <p className="font-semibold">{lote.peso_entrada} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Preço/kg Vivo</p>
                    <p className="font-semibold">{formatBRL(lote.preco_compra_kg)}</p>
                    <p className="text-xs text-gray-400">{formatBRL(lote.preco_compra_kg * 15)}/@</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Valor Total</p>
                    <p className="font-semibold text-brand-700">{formatBRL(valorCompra(lote))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-400 text-xs">GMD Esperado</p>
                    <p className="font-semibold text-purple-600">{lote.gmd_esperado} kg/dia</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Dias Confinamento</p>
                    <p className="font-semibold">{diasConfinamento(lote)} / {lote.dias_previstos}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Peso Final Projetado</p>
                    <p className="font-semibold text-green-700">{pesoFinal.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Ganho Esperado</p>
                    <p className="font-semibold text-green-700">+{ganhoPorBoi.toFixed(1)} kg/boi · +{ganhoTotal.toFixed(0)} kg total</p>
                  </div>
                </div>
                {lote.status === "Ativo" && (
                  <a href="/lotes" className="block text-center mt-4 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-2">
                    + Adicionar / Remover Bois do Lote
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
