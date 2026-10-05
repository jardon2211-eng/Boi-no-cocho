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

## 6. Como funciona a venda (pagamento único + conta automática)

- O produto é vendido por **pagamento único de R$ 64,90** — não é assinatura.
  A tela `/signup` não cria mais conta grátis: ela só mostra o preço e manda
  a pessoa pra `/comprar`.
- Em `/comprar`, a pessoa paga pelo PagBank (Pix, cartão ou boleto), usando um
  link de pagamento fixo. Isso não exige que ela já tenha conta.
- Quando o PagBank confirma o pagamento, ele avisa o seu site através
  de um **webhook** (`/api/webhooks/pagbank`). O servidor então:
  1. confere a assinatura da notificação (um código calculado com o seu
     token de integração) pra garantir que o aviso é mesmo do PagBank,
     e não de alguém tentando forjar uma notificação falsa;
  2. cria a conta da pessoa no Supabase automaticamente, usando o e-mail
     que ela informou no pagamento;
  3. o Supabase manda um e-mail de convite pra esse endereço, com um link;
  4. a pessoa clica, cai em `/definir-senha`, escolhe uma senha, e já entra
     direto no sistema.
- Todas as tabelas (`lotes`, `produtos`, `formulacoes`, `estoque_movimentos`,
  `despesas`, `cocho_registros`) têm uma coluna `user_id` e uma política de
  segurança (RLS) que garante: **cada usuário só enxerga e edita os próprios
  dados**. Isso é aplicado no banco de dados, não só na tela.
- Não existe um "modo admin" pronto para você ver os dados de todos os
  clientes. Se quiser isso no futuro, precisa de uma tabela de perfis com um
  campo `role='admin'` e políticas extras — posso te ajudar a montar depois.

---

## 6.1 Configurar a cobrança (PagBank)

**Pegar o Token de Integração:**

1. Acesse sua conta em [pagbank.com.br](https://pagbank.com.br).
2. Vá em **Minha Conta → Token de Segurança** (ou **Integrações**, o caminho
   exato varia um pouco conforme a versão do painel).
3. Gere (ou copie, se já tiver) o **Token de Integração**. ⚠️ Se você gerar
   um token novo, o antigo para de funcionar — não gere de novo depois de
   configurar, a menos que precise trocar.

**Criar o link de pagamento fixo (uma vez só):**

4. No painel do PagBank, procure por **Cobrar → Link de Pagamento** (ou
   "Vender" → "Link de Pagamento").
5. Preencha: Nome do produto = "Boi no Cocho — Acesso Vitalício", Valor =
   **64,90**, pagamento único (não recorrente), deixe o cliente escolher
   Pix, cartão ou boleto.
6. Salve e copie a **URL do link** gerada (algo como `pag.ae/xxxxx`).

**Criar o Webhook (pra avisar seu site quando alguém pagar):**

7. No painel do PagBank, procure por **Integrações → Webhooks** (ou
   "Notificações").
8. Cadastre a URL: `https://SEU-SITE/api/webhooks/pagbank` (troque pelo
   endereço real do seu site publicado).
9. O PagBank usa o próprio Token de Integração (passo 3) pra assinar as
   notificações — não precisa gerar outro token separado pra isso.

**No projeto, preencha estas variáveis** (`.env.local` pra testar local, e
nas Environment Variables da Vercel pra valer):

10. `PAGBANK_TOKEN` = o token de integração do passo 3.
11. `NEXT_PUBLIC_PAGBANK_PAYMENT_LINK` = a URL do link de pagamento do passo 6.
12. Confirme que `NEXT_PUBLIC_SITE_URL` está com o endereço certo do seu site
    publicado (sem barra no final).

**Bloquear cadastro grátis (passo manual e importante):**

13. No painel do Supabase, vá em **Authentication → Settings**.
14. Desative a opção **"Allow new users to sign up"** (ou "Enable sign ups",
    o nome exato varia um pouco por versão do painel).
15. Isso bloqueia qualquer criação de conta nova por fora do fluxo de
    pagamento — inclusive pelo botão "Continuar com Google". A criação de
    conta feita pelo webhook (com a chave de administrador) continua
    funcionando normalmente, porque ela não passa por essa restrição.

**Chave de administrador do Supabase:**

16. No painel do Supabase, vá em **Project Settings → API**.
17. Copie a chave em **service_role** (⚠️ nunca compartilhe essa chave, ela
    tem acesso total ao banco, ignorando as travas de segurança).
18. Cole em `SUPABASE_SERVICE_ROLE_KEY` (`.env.local` local, e nas
    Environment Variables da Vercel — marque como variável **sensível/secreta**
    se o painel oferecer essa opção).

**Personalizar o e-mail de convite (opcional, recomendado):**

19. No painel do Supabase, vá em **Authentication → Email Templates → Invite user**.
20. Edite o texto/assunto pra ter a cara do Boi no Cocho, já que é o
    e-mail que a pessoa recebe depois de pagar.

**Testar de ponta a ponta:**

21. Acesse `/comprar` no seu site publicado, clique em pagar, e faça um
    pagamento de teste (o jeito mais simples de testar de verdade é fazer
    um Pix pequeno pra si mesmo).
22. ⚠️ **O formato exato da notificação do PagBank pode variar um pouco.**
    Depois do primeiro pagamento de teste, se a conta não for criada
    automaticamente, veja os logs da função na Vercel (aba Logs do projeto)
    pra conferir o payload real que chegou, e me manda que eu ajusto o
    código do webhook pra bater certinho com o formato que o PagBank
    realmente está enviando pra sua conta.
23. Confirme que o e-mail de convite chegou e que o login funciona depois
    de definir a senha.

---

## 7. O que ainda NÃO está incluído

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
  signup/           → agora só mostra o preço e manda pra /comprar
  comprar/          → página de pagamento único (link fixo do PagBank)
    sucesso/        → tela opcional pra configurar como redirecionamento do PagBank após pagar
    erro/           → idem, pra pagamento recusado/pendente
  definir-senha/    → onde a pessoa cai depois de clicar no e-mail de convite
  api/
    webhooks/
      pagbank/        → recebe a confirmação de pagamento e cria a conta
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
  supabase/
    client.ts       → cliente Supabase do navegador
    server.ts       → cliente Supabase do servidor (Server Components/Actions)
    admin.ts        → cliente com a chave service_role — só usado no webhook
  calculations.ts   → toda a lógica de negócio (GMD, custo, lucro etc)
  types.ts          → tipos TypeScript das tabelas
supabase/
  schema.sql        → script para criar o banco de dados
middleware.ts       → protege as rotas e mantém o login ativo
```
