# 🐂 Boi no Cocho

Aplicativo de gestão de confinamento — cada cliente com login próprio e dados
100% isolados (multi-tenant real, com Supabase Row Level Security).

Módulos: Visão Geral, Compras, Formulação, Relatório de Consumo, Estoque de
Ração, Ração no Cocho, Lotes, Despesas, Exportar Dados, Como Usar.

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou mais recente
- Uma conta gratuita no [Supabase](https://supabase.com) (banco de dados + login)
- Uma conta gratuita na [Vercel](https://vercel.com) (para hospedar)

---

## 2. Criar o banco de dados (Supabase)

1. Crie um projeto novo em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor** → **New query**.
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie todo o conteúdo,
   cole no editor e clique em **Run**. Isso cria todas as tabelas, o controle
   de acesso (cada cliente só vê os próprios dados) e os índices.
4. Vá em **Authentication → Providers** e confirme que **Email** está
   habilitado (vem habilitado por padrão).
5. (Opcional, recomendado) Em **Authentication → Settings**, desative
   "Confirm email" enquanto estiver testando, para não depender de e-mail
   configurado. Reative antes de vender de verdade.

---

## 2.1 Habilitar "Continuar com Google" (opcional, mas recomendado)

O código já tem o botão pronto — falta só configurar as credenciais. São dois
lugares: o Google Cloud (pra gerar a chave) e o Supabase (pra usar essa chave).

**No Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Crie um projeto novo (ou use um existente).
2. Vá em **APIs e Serviços → Tela de consentimento OAuth**. Escolha "Externo",
   preencha nome do app, e-mail de suporte e e-mail de contato do
   desenvolvedor. Pode deixar o resto padrão e publicar.
3. Vá em **APIs e Serviços → Credenciais → Criar Credenciais → ID do cliente
   OAuth**.
4. Tipo de aplicativo: **Aplicativo da Web**.
5. Em **Origens JavaScript autorizadas**, adicione o link do seu app (ex:
   `https://seu-projeto.vercel.app`) e, se for testar local,
   `http://localhost:3000`.
6. Em **URIs de redirecionamento autorizados**, adicione a URL de callback do
   Supabase — o formato é:
   `https://SEU-PROJETO.supabase.co/auth/v1/callback`
7. Clique em Criar. Copie o **Client ID** e o **Client Secret** gerados.

**No Supabase:**

1. Vá em **Authentication → Providers → Google**.
2. Ative o provider e cole o **Client ID** e o **Client Secret** do Google.
3. O Supabase mostra ali mesmo a URL de callback exata — confirme que é a
   mesma que você colocou no passo 6 acima (copie de lá se for diferente).
4. Salve.

Pronto — o botão "Continuar com Google" já funciona nas telas de login e
cadastro, sem precisar mexer em mais nada no código.

---

## 3. Configurar as variáveis de ambiente

1. No painel do Supabase, vá em **Project Settings → API**.
2. Copie a **Project URL** e a chave **anon public**.
3. Neste projeto, copie `.env.local.example` para `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

4. Preencha os dois valores:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você vai cair na tela
de login. Clique em "Criar conta" para testar o cadastro.

---

## 5. Publicar (deploy) na Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione as mesmas duas variáveis do
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Em ~1 minuto seu app estará no ar com um link
   `https://seu-projeto.vercel.app`.
5. (Opcional) Em **Settings → Domains**, aponte seu próprio domínio
   (ex: `app.boicontrole.com.br`).

Cada vez que você atualizar o código e enviar (`git push`), a Vercel publica
a nova versão automaticamente.

---

## 5.1 App instalável (PWA) — ícone na tela inicial do celular

O projeto já vem configurado como PWA (Progressive Web App). Depois de
publicado (em HTTPS — a Vercel já entrega isso automaticamente), qualquer
cliente pode "instalar" o app assim:

**Android (Chrome):** abrir o link → menu (⋮) → "Instalar aplicativo" ou
"Adicionar à tela inicial". O Chrome também costuma mostrar um banner
oferecendo isso sozinho.

**iPhone (Safari):** abrir o link → botão de compartilhar (□↑) → "Adicionar
à Tela de Início".

Depois de instalado, o ícone abre em tela cheia, sem a barra de endereço do
navegador — visualmente idêntico a um app baixado de loja. Os arquivos por
trás disso:

- `public/manifest.json` — nome, ícone e cor do app
- `public/icons/` — os ícones em cada tamanho necessário
- `public/sw.js` — um service worker mínimo (não faz cache de dados, só
  habilita a instalação)
- `components/RegisterSW.tsx` — registra esse service worker

Se você quiser trocar o ícone, gere novos arquivos PNG nos mesmos tamanhos
(192×192, 512×512, e 180×180 para o `apple-touch-icon.png`) e substitua os
arquivos em `public/icons/`.

---

## 6. Como funciona o multi-cliente (login de cada produtor)

- Qualquer pessoa pode criar uma conta pela tela de cadastro (`/signup`) com
  e-mail e senha — isso é gerenciado pelo Supabase Auth.
- Todas as tabelas (`lotes`, `produtos`, `formulacoes`, `estoque_movimentos`,
  `despesas`, `cocho_registros`) têm uma coluna `user_id` e uma política de
  segurança (RLS) que garante: **cada usuário só enxerga e edita os próprios
  dados**. Isso é aplicado no banco de dados, não só na tela — não dá pra
  burlar mudando algo no navegador.
- Não existe um "modo admin" pronto para você ver os dados de todos os
  clientes. Se quiser isso no futuro (ex: um painel seu para dar suporte),
  precisa de uma tabela de perfis com um campo `role='admin'` e políticas
  extras — posso te ajudar a montar isso depois.

---

## 7. O que ainda NÃO está incluído (próximos passos se for vender de verdade)

- **Cobrança/assinatura** (Stripe): hoje qualquer pessoa que se cadastra tem
  acesso completo de graça. Para cobrar, o caminho comum é integrar o
  [Stripe Checkout](https://stripe.com/docs/checkout) + webhooks que liberam
  ou bloqueiam o acesso conforme o pagamento.
- **Confirmação de e-mail / recuperação de senha personalizada**: o Supabase
  já manda esses e-mails, mas com o remetente e template padrão dele. Dá pra
  personalizar em **Authentication → Email Templates** e configurar um
  domínio de envio próprio (SMTP) depois.
- **Exportação em PDF**: hoje funciona abrindo uma janela de impressão do
  navegador ("Salvar como PDF"), sem depender de serviço externo. Funciona
  bem, mas não é um PDF "de marca" com logo — dá pra evoluir depois com uma
  biblioteca de geração de PDF no servidor.
- **App mobile**: hoje é um site responsivo (funciona bem no celular pelo
  navegador), não um aplicativo de loja (App Store/Play Store).

---

## 8. Estrutura do projeto

```
app/
  login/            → tela de login
  signup/           → tela de cadastro
  (app)/            → área logada (protegida pelo middleware)
    dashboard/      → Visão Geral
    compras/        → Compras de Gado
    lotes/          → Lotes de Gado
    formulacao/      → Formulação de Ração
    consumo/        → Relatório de Consumo
    estoque/        → Estoque de Ração
    cocho/          → Ração no Cocho
    despesas/       → Despesas
    exportar/       → Exportar Dados
    como-usar/      → Como Usar
lib/
  supabase/         → clientes Supabase (browser, server)
  calculations.ts   → toda a lógica de negócio (GMD, custo, lucro etc)
  types.ts          → tipos TypeScript das tabelas
supabase/
  schema.sql        → script para criar o banco de dados
middleware.ts       → protege as rotas e mantém o login ativo
```
