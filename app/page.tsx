import Link from "next/link";
import type { ReactNode } from "react";

const DARK = "#182619";
const DARK_2 = "#2a3d20";
const CREAM = "#f7f2e7";
const INK = "#20291b";
const BRAND = "#2e4c2e";
const RUST = "#a85a2e";
const MUTED = "#5b6454";
const HAIRLINE = "#e2dac2";

export default function HomePage() {
  return (
    <main className="light-only" style={{ backgroundColor: CREAM, color: INK }}>
      <SiteHeader />
      <Hero />
      <PainSection />
      <CycleSection />
      <RealitySection />
      <PlatformSection />
      <AudienceSection />
      <PricingSection />
      <FaqSection />
      <SiteFooter />
    </main>
  );
}

/* ---------- Header ---------- */

function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur"
      style={{ backgroundColor: `${DARK}f2` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">🐂</span>
          Boi no Cocho
        </span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/80 sm:flex">
          <a href="#ciclo" className="hover:text-white">
            Funcionalidades
          </a>
          <a href="#duvidas" className="hover:text-white">
            Perguntas frequentes
          </a>
          <Link href="/login" className="hover:text-white">
            Entrar
          </Link>
        </nav>
        <Link
          href="/comprar"
          className="rounded-md bg-white px-4 py-2 text-sm font-bold"
          style={{ color: DARK }}
        >
          Comprar acesso
        </Link>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section
      className="px-6 pb-16 pt-16 sm:pb-24 sm:pt-20"
      style={{
        background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_2} 100%)`,
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          Confinamento tocado no chute é aposta.
        </h1>
        <p
          className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl"
          style={{ color: "#d79a6a" }}
        >
          Confinamento com números é lucro.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-lg">
          O Boi no Cocho organiza a compra do lote, a ração que vai pro cocho,
          os custos e o resultado da engorda — num painel simples, pelo
          celular ou computador.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/comprar"
            className="rounded-md px-7 py-3 text-base font-bold text-white"
            style={{ backgroundColor: RUST }}
          >
            Quero controlar meu confinamento
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/30 px-7 py-3 text-base font-semibold text-white"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/80">
          <Badge>Pagamento único</Badge>
          <Badge>Acesso vitalício</Badge>
          <Badge>Sem mensalidade</Badge>
        </div>
      </div>

      <DashboardMock />
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 px-3 py-1">
      {children}
    </span>
  );
}

function DashboardMock() {
  const tiles = [
    { label: "Animais no curral", value: "42" },
    { label: "GMD esperado", value: "1,45 kg/dia" },
    { label: "Custo ração/dia", value: "R$ 612" },
    { label: "Dias de confinamento", value: "58" },
  ];
  return (
    <div
      className="mx-auto mt-14 max-w-4xl rounded-xl border border-white/10 p-5 sm:p-8"
      style={{ backgroundColor: "#0f1a0f" }}
    >
      <div className="mb-5 flex items-center justify-between text-sm text-white/60">
        <span>Painel do lote — Curral 4</span>
        <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs">
          Em confinamento
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-white/50">{t.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{t.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Pain section ---------- */

function PainSection() {
  const items = [
    {
      title: "O resultado só aparece no abate",
      desc: "Você compra, trata o lote por meses e só sabe se ganhou ou perdeu dinheiro quando o boi já foi vendido.",
    },
    {
      title: "A ração vai pro cocho sem controle",
      desc: "Sem saber quanto cada curral está consumindo, não dá pra saber quanto a dieta está custando de verdade.",
    },
    {
      title: "As contas vivem espalhadas",
      desc: "Caderno, WhatsApp, memória. Na hora de fechar a conta do lote, os números nunca batem direito.",
    },
  ];
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Isso te soa familiar?
        </h2>
        <div className="mt-8 divide-y" style={{ borderColor: HAIRLINE }}>
          {items.map((it, i) => (
            <div
              key={it.title}
              className="flex gap-5 border-t py-6 first:border-t-0 first:pt-0"
              style={{ borderColor: HAIRLINE }}
            >
              <span
                className="mt-1 text-sm font-bold"
                style={{ color: RUST }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold">{it.title}</h3>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Cycle / feature sequence ---------- */

type CycleStep = {
  step: string;
  title: string;
  desc: string;
  bullets: string[];
  tiles: { label: string; value: string }[];
};

const CYCLE: CycleStep[] = [
  {
    step: "Entrada do lote",
    title: "Controle de lote",
    desc: "Registre a compra — quantidade, peso de entrada e investimento — e já veja a margem provável antes de começar a engorda.",
    bullets: [
      "Quantidade de animais e peso de entrada",
      "Investimento total do lote",
      "Dias de confinamento previstos",
      "Peso e ganho de saída projetados",
    ],
    tiles: [
      { label: "Animais", value: "38 bois" },
      { label: "Peso médio entrada", value: "365 kg" },
      { label: "Investimento", value: "R$ 61.200" },
      { label: "Ganho projetado", value: "+2.280 kg" },
    ],
  },
  {
    step: "Trato diário",
    title: "Ração no cocho",
    desc: "Registre a dieta de cada curral — ingredientes, quilos por dia, custo por quilo — e saiba exatamente quanto está entrando no cocho e quanto está custando.",
    bullets: [
      "Percentual de cada ingrediente da dieta",
      "Quilos e sacos oferecidos por dia",
      "Custo por quilo e custo diário total",
      "Consumo por curral, dia a dia",
    ],
    tiles: [
      { label: "Dieta do dia", value: "147,8 kg" },
      { label: "Custo/kg", value: "R$ 1,73" },
      { label: "Custo diário", value: "R$ 255,45" },
      { label: "Curral", value: "04" },
    ],
  },
  {
    step: "Durante a engorda",
    title: "Controle financeiro",
    desc: "Lance ração, sanidade, frete e mão de obra, e acompanhe o custo acumulado de cada lote enquanto ele ainda está no cocho — não só no fim.",
    bullets: [
      "Custos de ração, sanidade, frete e mão de obra",
      "Custo acumulado por lote em tempo real",
      "Custo por arroba produzida",
      "Margem estimada antes da venda",
    ],
    tiles: [
      { label: "Custo acumulado", value: "R$ 22.990" },
      { label: "Custo/arroba", value: "R$ 307" },
      { label: "Margem estimada", value: "9,4%" },
      { label: "Lucro projetado", value: "R$ 10.070" },
    ],
  },
  {
    step: "Saída do lote",
    title: "Relatórios e indicadores",
    desc: "Veja o ganho de peso, a conversão alimentar e o resultado financeiro de cada lote assim que ele sai do confinamento.",
    bullets: [
      "Ganho médio diário (GMD) por curral",
      "Conversão alimentar do lote",
      "Peso e rendimento de carcaça",
      "Resultado financeiro final da engorda",
    ],
    tiles: [
      { label: "GMD médio", value: "1,52 kg/dia" },
      { label: "Conversão", value: "6,1:1" },
      { label: "Rendimento médio", value: "54,1%" },
      { label: "Resultado", value: "R$ 10.070" },
    ],
  },
];

function CycleSection() {
  return (
    <section id="ciclo" className="px-6 py-16 sm:py-24" style={{ backgroundColor: "#f0ead9" }}>
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            O ciclo do seu confinamento, organizado do início ao fim
          </h2>
          <p className="mt-3 text-base" style={{ color: MUTED }}>
            Simples de usar, pensado pra quem vive a rotina do cocho — não
            pra quem só entende de planilha.
          </p>
        </div>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {CYCLE.map((c, i) => (
            <div
              key={c.title}
              className={`flex flex-col gap-8 sm:gap-12 ${
                i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
              } sm:items-center`}
            >
              <div className="sm:w-1/2">
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: RUST }}
                >
                  Etapa {i + 1} · {c.step}
                </p>
                <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base" style={{ color: MUTED }}>
                  {c.desc}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span style={{ color: BRAND }}>✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sm:w-1/2">
                <div
                  className="rounded-xl border bg-white p-5 shadow-sm"
                  style={{ borderColor: HAIRLINE }}
                >
                  <p className="mb-4 text-xs font-semibold" style={{ color: MUTED }}>
                    {c.title}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {c.tiles.map((t) => (
                      <div
                        key={t.label}
                        className="rounded-lg p-3"
                        style={{ backgroundColor: CREAM }}
                      >
                        <p className="text-[11px]" style={{ color: MUTED }}>
                          {t.label}
                        </p>
                        <p className="mt-0.5 text-sm font-bold" style={{ color: INK }}>
                          {t.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Reality / agitation ---------- */

function RealitySection() {
  const items = [
    {
      title: "Não mede o ganho de peso real",
      desc: "Sem GMD por curral, você não sabe se o lote está engordando ou só comendo.",
    },
    {
      title: "Não sabe a conversão alimentar",
      desc: "Cada quilo de ração que não virou carne é dinheiro que já saiu do bolso.",
    },
    {
      title: "Só vê o resultado no frigorífico",
      desc: "Quando os números finalmente aparecem, não dá mais pra mudar nada naquele lote.",
    },
  ];
  return (
    <section
      className="px-6 py-16 sm:py-20"
      style={{ backgroundColor: DARK, color: "white" }}
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold" style={{ color: "#d79a6a" }}>
          A conta que a maioria só faz tarde demais
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Você compra o lote, investe em ração, espera a engorda — e só
          depois descobre se ganhou ou perdeu dinheiro.
        </h2>
        <p className="mt-3 text-white/70">Isso não é gestão. É aposta.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="border-t border-white/15 pt-4">
              <h3 className="font-semibold text-white">{it.title}</h3>
              <p className="mt-2 text-sm text-white/60">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Platform ---------- */

function PlatformSection() {
  const devices = [
    { icon: "💻", label: "Computador", sub: "Windows ou Mac" },
    { icon: "📱", label: "Celular", sub: "iPhone ou Android" },
    { icon: "📋", label: "Tablet", sub: "iPad ou Android" },
  ];
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Funciona onde você está — na sede, no curral ou na estrada
        </h2>
        <p className="mt-3" style={{ color: MUTED }}>
          Acesse pelo navegador, sem precisar instalar nada. Atualizações
          chegam sozinhas, sem custo extra.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {devices.map((d) => (
            <div
              key={d.label}
              className="rounded-xl border bg-white p-6"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="text-2xl">{d.icon}</div>
              <p className="mt-2 font-semibold">{d.label}</p>
              <p className="text-sm" style={{ color: MUTED }}>
                {d.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Audience ---------- */

function AudienceSection() {
  const yes = [
    "Quer sair do controle solto em caderno e WhatsApp",
    "Quer começar um confinamento pequeno com segurança",
    "Já confina e quer aumentar a margem por arroba",
    "Decide pelos números, não só pelo olho",
  ];
  const no = [
    "Prefere continuar decidindo no chute",
    "Não pretende acompanhar os números do lote",
    "Está satisfeito em só saber o resultado no abate",
  ];
  return (
    <section className="px-6 py-16 sm:py-20" style={{ backgroundColor: "#f0ead9" }}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Feito pra quem vive a rotina do confinamento
        </h2>
        <p className="mt-3" style={{ color: MUTED }}>
          Sem termo técnico desnecessário. Sem burocracia.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold" style={{ color: BRAND }}>
              É pra você se
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {yes.map((t) => (
                <li key={t} className="flex gap-2">
                  <span style={{ color: BRAND }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: RUST }}>
              Não é pra você se
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {no.map((t) => (
                <li key={t} className="flex gap-2">
                  <span style={{ color: RUST }}>✗</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */

function PricingSection() {
  return (
    <section
      className="px-6 py-16 sm:py-24"
      style={{
        background: `linear-gradient(180deg, ${DARK} 0%, ${DARK_2} 100%)`,
        color: "white",
      }}
    >
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Pare de decidir no escuro no seu confinamento
        </h2>
        <p className="mt-3 text-white/70">
          Acesso liberado por e-mail poucos minutos após o pagamento.
        </p>

        <div
          className="mt-8 rounded-xl border border-white/10 p-8"
          style={{ backgroundColor: "#0f1a0f" }}
        >
          <p className="text-sm text-white/50">Pagamento único</p>
          <p className="mt-2 text-sm text-white/40 line-through">
            de R$ 197,00
          </p>
          <p className="text-4xl font-extrabold">R$ 64,90</p>
          <p className="mt-1 text-sm" style={{ color: "#d79a6a" }}>
            67% de desconto · acesso vitalício
          </p>

          <Link
            href="/comprar"
            className="mt-6 block rounded-md px-6 py-3 text-base font-bold text-white"
            style={{ backgroundColor: RUST }}
          >
            Quero ter controle total do meu confinamento
          </Link>

          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-white/50">
            <span>🔒 Pagamento seguro</span>
            <span>🚀 Acesso imediato</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

const FAQ = [
  {
    q: "Preciso saber o peso de cada animal já na compra do lote?",
    a: "Não. Você pode lançar o lote fechado e completar o peso individual de cada animal depois, assim que pesar.",
  },
  {
    q: "O Boi no Cocho funciona no celular?",
    a: "Sim. Funciona direto pelo navegador, sem precisar instalar nada — no computador, tablet ou celular.",
  },
  {
    q: "É pagamento único mesmo, sem mensalidade?",
    a: "Sim. Você paga uma vez e o acesso não expira.",
  },
  {
    q: "Como recebo o acesso depois de comprar?",
    a: "Assim que o pagamento é aprovado, você recebe um e-mail para criar sua senha e já pode entrar no sistema.",
  },
  {
    q: "Tem suporte se eu tiver dúvida de como usar?",
    a: "Sim, dá pra falar diretamente com a gente.",
  },
];

function FaqSection() {
  return (
    <section id="duvidas" className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
        <div className="mt-8 divide-y" style={{ borderColor: HAIRLINE }}>
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {f.q}
                <span
                  className="ml-4 text-xl transition-transform group-open:rotate-45"
                  style={{ color: RUST }}
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm" style={{ color: MUTED }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function SiteFooter() {
  return (
    <footer
      className="px-6 py-10 text-center text-sm"
      style={{ backgroundColor: DARK, color: "rgba(255,255,255,0.5)" }}
    >
      <p className="font-semibold text-white/80">🐂 Boi no Cocho</p>
      <p className="mt-1">Gestão completa de confinamento</p>
      <p className="mt-4">© 2026 Boi no Cocho. Todos os direitos reservados.</p>
    </footer>
  );
}
