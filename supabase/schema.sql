-- =========================================================
-- BOI CONTROLE — Schema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro em: Supabase Dashboard > SQL Editor > New query
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- LOTES (compra + acompanhamento do lote, é a mesma entidade) ----------
create table if not exists lotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  nome text not null,                       -- ex: "Lote Início", "Lote 001"
  fornecedor text,
  data_entrada date not null default current_date,
  quantidade_inicial int not null check (quantidade_inicial > 0),
  ajuste_animais int not null default 0,    -- + nascimentos/compras extras, - mortes/vendas parciais
  peso_entrada numeric not null,            -- kg médio de entrada
  peso_atual numeric,                       -- kg médio atual (atualizado por pesagem)
  preco_compra_kg numeric not null default 0,
  gmd_esperado numeric not null default 1.4, -- kg/dia
  dias_previstos int not null default 90,
  status text not null default 'Ativo' check (status in ('Ativo','Vendido')),
  data_venda date,
  peso_venda numeric,
  preco_venda_kg numeric,
  created_at timestamptz not null default now()
);

-- ---------- PRODUTOS (ingredientes da ração) ----------
-- Cadastrados por saco (como se compra de verdade); o custo por kg é calculado sozinho.
-- Pra comprar direto por kg (sem saco), basta deixar kg_por_saco = 1.
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  nome text not null,
  categoria text,
  kg_por_saco numeric not null default 1,
  preco_saco numeric not null default 0,
  preco_kg numeric generated always as (
    case when kg_por_saco > 0 then round(preco_saco / kg_por_saco, 4) else 0 end
  ) stored,
  fornecedor text,
  estoque_minimo_kg numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- FORMULAÇÕES (dieta de cada lote, por % de cada ingrediente da RAÇÃO) ----------
-- Cada linha é um ingrediente da RAÇÃO CONCENTRADA de uma "dieta" (mesmo lote_id + mesma
-- data = mesma dieta). percentual de todas as linhas da mesma dieta deve somar 100%.
-- kg_dia_total e custo_volumoso_kg ficam repetidos em todas as linhas da mesma dieta
-- (são "cabeçalho" da dieta, não por ingrediente) — kg_dia_total é só da ração
-- concentrada; o volumoso (silagem etc.) é precificado à parte por custo_volumoso_kg,
-- porque normalmente tem um custo bem mais baixo que o concentrado.
-- lote_id pode ficar em branco: é a "Formulação Independente" (simula custo antes de comprar o gado).
create table if not exists formulacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  lote_id uuid references lotes(id) on delete cascade,
  produto_id uuid not null references produtos(id) on delete cascade,
  data date not null default current_date,
  percentual numeric not null default 0,
  kg_dia_total numeric not null default 0,
  custo_volumoso_kg numeric not null default 0,
  kg_animal_dia numeric generated always as (
    coalesce(percentual, 0) / 100.0 * coalesce(kg_dia_total, 0)
  ) stored,
  status text not null default 'Pendente' check (status in ('Pendente','Aprovado')),
  created_at timestamptz not null default now()
);

-- ---------- ESTOQUE (entradas e saídas de ração) ----------
create table if not exists estoque_movimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  lote_id uuid references lotes(id) on delete set null,
  tipo text not null check (tipo in ('Entrada','Saída')),
  quantidade_kg numeric not null check (quantidade_kg > 0),
  observacao text,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- FASES DE ADAPTAÇÃO (editáveis por lote, em kg direto) ----------
-- Substitui qualquer tabela fixa de % — cada produtor ajusta do seu jeito.
-- A ordem define a sequência (fase 1, fase 2...), cada uma dura "dias_duracao"
-- dias, contados a partir da data de entrada do lote. Depois da última fase
-- cadastrada, o sistema passa a usar a dieta fixa aprovada em Formulação.
create table if not exists fases_adaptacao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  lote_id uuid not null references lotes(id) on delete cascade,
  ordem int not null,
  dias_duracao int not null check (dias_duracao > 0),
  racao_kg numeric not null default 0,
  volumoso_kg numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- DESPESAS ----------
create table if not exists despesas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  lote_id uuid references lotes(id) on delete set null,
  categoria text not null default 'Variável' check (categoria in ('Fixa','Variável')),
  categoria_detalhe text,
  recorrencia text not null default 'Único' check (recorrencia in ('Único','Mensal')),
  descricao text not null,
  valor numeric not null check (valor >= 0),
  data date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- RAÇÃO NO COCHO (registro diário do que foi de fato colocado no cocho) ----------
-- Suporta múltiplos tratos por dia (ex: 1º Trato 07:00, 2º Trato 12:00, 3º Trato 17:00),
-- com ração (concentrado) e volumoso separados, e controle de sobra por trato.
create table if not exists cocho_registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  lote_id uuid not null references lotes(id) on delete cascade,
  data date not null default current_date,
  trato_numero smallint not null default 1,       -- 1º, 2º, 3º trato do dia...
  horario time not null default '07:00',
  racao_kg numeric not null default 0,             -- concentrado colocado nesse trato
  volumoso_kg numeric not null default 0,          -- volumoso colocado nesse trato
  sobrou boolean not null default false,           -- sobrou algo no cocho desse trato?
  sobra_kg numeric not null default 0,             -- quanto sobrou (só relevante se sobrou=true)
  observacao text,
  created_at timestamptz not null default now(),
  unique (lote_id, data, trato_numero)             -- reenviar o mesmo trato/dia atualiza os valores
);

-- =========================================================
-- ROW LEVEL SECURITY — cada cliente só vê e mexe nos próprios dados
-- =========================================================
alter table lotes enable row level security;
alter table produtos enable row level security;
alter table formulacoes enable row level security;
alter table estoque_movimentos enable row level security;
alter table despesas enable row level security;
alter table cocho_registros enable row level security;
alter table fases_adaptacao enable row level security;

create policy "lotes_isolamento" on lotes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "produtos_isolamento" on produtos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "formulacoes_isolamento" on formulacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "estoque_isolamento" on estoque_movimentos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "despesas_isolamento" on despesas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cocho_isolamento" on cocho_registros for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fases_adaptacao_isolamento" on fases_adaptacao for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- índices úteis
create index if not exists idx_lotes_user on lotes(user_id);
create index if not exists idx_produtos_user on produtos(user_id);
create index if not exists idx_formulacoes_lote on formulacoes(lote_id);
create index if not exists idx_estoque_produto on estoque_movimentos(produto_id);
create index if not exists idx_despesas_lote on despesas(lote_id);
create index if not exists idx_cocho_lote on cocho_registros(lote_id);
create index if not exists idx_fases_adaptacao_lote on fases_adaptacao(lote_id);
