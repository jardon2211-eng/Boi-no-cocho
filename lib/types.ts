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
  preco_kg: number;
  fornecedor: string | null;
  estoque_minimo_kg: number;
  created_at: string;
};

export type Formulacao = {
  id: string;
  user_id: string;
  lote_id: string;
  produto_id: string;
  data: string;
  kg_animal_dia: number;
  status: "Pendente" | "Aprovado";
  created_at: string;
  produtos?: Produto;
};

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
  quantidade_kg: number;
  sobra_kg: number;
  observacao: string | null;
  created_at: string;
};
