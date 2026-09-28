import { Lote, Formulacao, Despesa } from "./types";

/** Nº de animais atualmente no lote (inicial + ajustes de mortes/compras extras) */
export function numeroAnimaisAtual(lote: Lote): number {
  return lote.quantidade_inicial + lote.ajuste_animais;
}

/** Dias corridos desde a entrada do lote (ou até a venda, se já vendido) */
export function diasConfinamento(lote: Lote): number {
  const inicio = new Date(lote.data_entrada).getTime();
  const fim = lote.data_venda ? new Date(lote.data_venda).getTime() : Date.now();
  return Math.max(0, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));
}

/** Peso final projetado com base no GMD esperado e dias previstos, em kg */
export function pesoFinalProjetado(lote: Lote): number {
  return lote.peso_entrada + lote.gmd_esperado * lote.dias_previstos;
}

/** GMD real medido (kg/dia), com base no peso atual informado */
export function gmdReal(lote: Lote): number | null {
  const dias = diasConfinamento(lote);
  if (!lote.peso_atual || dias === 0) return null;
  return (lote.peso_atual - lote.peso_entrada) / dias;
}

/** Valor total pago na compra do lote */
export function valorCompra(lote: Lote): number {
  return lote.quantidade_inicial * lote.peso_entrada * lote.preco_compra_kg;
}

/** Receita total da venda (0 se ainda não vendido) */
export function receitaVenda(lote: Lote): number {
  if (lote.status !== "Vendido" || !lote.peso_venda || !lote.preco_venda_kg) return 0;
  return numeroAnimaisAtual(lote) * lote.peso_venda * lote.preco_venda_kg;
}

/**
 * Para cada combinação Lote+Produto, mantém só a formulação Aprovada mais recente
 * (equivalente à coluna "Dieta Vigente" da planilha) — evita somar dietas antigas já substituídas.
 */
export function dietaVigente(formulacoes: Formulacao[], loteId: string): Formulacao[] {
  const aprovadas = formulacoes.filter(
    (f) => f.lote_id === loteId && f.status === "Aprovado"
  );
  const maisRecentePorProduto = new Map<string, Formulacao>();
  for (const f of aprovadas) {
    const atual = maisRecentePorProduto.get(f.produto_id);
    if (!atual || new Date(f.data) > new Date(atual.data)) {
      maisRecentePorProduto.set(f.produto_id, f);
    }
  }
  return Array.from(maisRecentePorProduto.values());
}

/** Custo da dieta vigente por animal/dia, em R$ */
export function custoDietaPorAnimalDia(formulacoes: Formulacao[], loteId: string): number {
  const vigente = dietaVigente(formulacoes, loteId);
  return vigente.reduce((soma, f) => {
    const precoKg = f.produtos?.preco_kg ?? 0;
    return soma + f.kg_animal_dia * precoKg;
  }, 0);
}

/** Custo diário total de ração no cocho para o lote inteiro, em R$ */
export function custoDiarioNoCocho(lote: Lote, formulacoes: Formulacao[]): number {
  return numeroAnimaisAtual(lote) * custoDietaPorAnimalDia(formulacoes, lote.id);
}

/** Custo de ração acumulado estimado até hoje (ou até a venda), em R$ */
export function custoRacaoAcumulado(lote: Lote, formulacoes: Formulacao[]): number {
  return custoDiarioNoCocho(lote, formulacoes) * diasConfinamento(lote);
}

/** Custo médio por kg da dieta vigente (R$/kg) — usado para precificar o que é colocado no cocho */
export function custoMedioPorKgDieta(formulacoes: Formulacao[], loteId: string): number {
  const vigente = dietaVigente(formulacoes, loteId);
  const kgTotalPorAnimalDia = vigente.reduce((s, f) => s + f.kg_animal_dia, 0);
  if (kgTotalPorAnimalDia === 0) return 0;
  return custoDietaPorAnimalDia(formulacoes, loteId) / kgTotalPorAnimalDia;
}

/** Custo real do que foi colocado no cocho num registro (kg líquido = colocado - sobra) */
export function custoRegistroCocho(
  quantidadeKg: number,
  sobraKg: number,
  formulacoes: Formulacao[],
  loteId: string
): number {
  const kgLiquido = Math.max(0, quantidadeKg - sobraKg);
  return kgLiquido * custoMedioPorKgDieta(formulacoes, loteId);
}


export function despesasDoLote(despesas: Despesa[], loteId: string): number {
  return despesas
    .filter((d) => d.lote_id === loteId)
    .reduce((soma, d) => soma + d.valor, 0);
}

/** Custo total do lote: compra + ração + despesas extras */
export function custoTotalLote(lote: Lote, formulacoes: Formulacao[], despesas: Despesa[]): number {
  return (
    valorCompra(lote) +
    custoRacaoAcumulado(lote, formulacoes) +
    despesasDoLote(despesas, lote.id)
  );
}

/** Lucro do lote — null enquanto ainda não foi vendido ("Em andamento") */
export function lucroLote(lote: Lote, formulacoes: Formulacao[], despesas: Despesa[]): number | null {
  if (lote.status !== "Vendido") return null;
  return receitaVenda(lote) - custoTotalLote(lote, formulacoes, despesas);
}

export function lucroPorAnimal(lote: Lote, formulacoes: Formulacao[], despesas: Despesa[]): number | null {
  const lucro = lucroLote(lote, formulacoes, despesas);
  if (lucro === null) return null;
  return lucro / numeroAnimaisAtual(lote);
}

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatKg = (v: number) =>
  `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
