-- Programa de afiliados: cadastro de parceiros e registro de cada venda aprovada.
-- Acesso só pelo servidor (service role). RLS ligado e sem políticas = nenhum acesso pelo navegador.

create table if not exists public.afiliados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text not null unique check (codigo ~ '^[a-z0-9_-]{2,30}$'),
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  comissao_pct numeric not null default 40 check (comissao_pct >= 0 and comissao_pct <= 100),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null unique,
  email text not null,
  valor numeric not null,
  status text not null default 'approved',
  afiliado_codigo text references public.afiliados(codigo),
  comissao numeric not null default 0,
  aprovado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists vendas_afiliado_idx on public.vendas (afiliado_codigo, aprovado_em desc);

alter table public.afiliados enable row level security;
alter table public.vendas enable row level security;
