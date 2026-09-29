export type Lote = {
  id: string;
  user_id: string;
  nome: string;
  fornecedor: string | null;
  data_entrada: string;
  quantidade_inicial: number;
  ajuste_animais: number;
  peso_entrada: number;
  peso_atual: number | null;
  preco_compra_kg: number;
  gmd_esperado: number;
  dias_previstos: number;
  status: "Ativo" | "Vendido";
  data_venda: string | null;
  peso_venda: number | null;
  preco_venda_kg: number | null;
  created_at: string;
};

export type Produto = {
  id: string;
  user_id: string;
  nome: string;
  categoria: string | null;
  kg_por_saco: number;
  preco_saco: number;
  preco_kg: number; // calculado automaticamente (preco_saco / kg_por_saco)
  fornecedor: string | null;
  estoque_minimo_kg: number;
  created_at: string;
};

export type Formulacao = {
  id: string;
  user_id: string;
  lote_id: string | null; // pode ser null = "Formulação Independente" (sem lote / planejamento de custo)
  produto_id: string;
  data: string;
  percentual: number;      // % desse produto na dieta (soma dos produtos da mesma dieta = 100%)
  kg_dia_total: number;    // kg totais/animal/dia da dieta (compartilhado entre os produtos da mesma dieta)
  kg_animal_dia: number;   // calculado automaticamente = percentual/100 * kg_dia_total
  status: "Pendente" | "Aprovado";
  created_at: string;
  produtos?: Produto;
};

export type ItemReceita = { produto_id: string; percentual: number };

export type EstoqueMovimento = {
  id: string;
  user_id: string;
  produto_id: string;
  lote_id: string | null;
  tipo: "Entrada" | "Saída";
  quantidade_kg: number;
  observacao: string | null;
  data: string;
  created_at: string;
  produtos?: Produto;
};

export type Despesa = {
  id: string;
  user_id: string;
  lote_id: string | null;
  categoria: "Fixa" | "Variável";
  categoria_detalhe: string | null; // ex: Medicação, Frete, Mão de obra...
  recorrencia: "Único" | "Mensal";
  descricao: string;
  valor: number;
  data: string;
  created_at: string;
};

export type CochoRegistro = {
  id: string;
  user_id: string;
  lote_id: string;
  data: string;
  trato_numero: number;
  horario: string;
  racao_kg: number;
  volumoso_kg: number;
  sobrou: boolean;
  sobra_kg: number;
  observacao: string | null;
  created_at: string;
};
