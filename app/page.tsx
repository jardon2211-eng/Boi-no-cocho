import Track from "@/components/Track";
import Link from "next/link";

const DARK = "#12281a";
const PAPER = "#f6f7f1";
const INK = "#1a2419";
const MUTED = "#4a5547";
const BORDER = "#cfd6c8";
const HAY = "#f2b01e";
const SOFT = "#eef2e8";

const FASES = [
  { n: 1, dias: "1 a 3", racao: "1,05", vol: "10,50", racaoTrato: "7,0", volTrato: "70,0", hoje: false, travada: false },
  { n: 2, dias: "4 a 6", racao: "2,80", vol: "8,75", racaoTrato: "18,7", volTrato: "58,3", hoje: true, travada: false },
  { n: 3, dias: "7 a 9", racao: "4,55", vol: "7,00", racaoTrato: "30,3", volTrato: "46,7", hoje: false, travada: true },
  { n: 4, dias: "10 a 12", racao: "6,30", vol: "5,25", racaoTrato: "42,0", volTrato: "35,0", hoje: false, travada: true },
  { n: 5, dias: "13 a 15", racao: "8,05", vol: "3,50", racaoTrato: "53,7", volTrato: "23,3", hoje: false, travada: true },
];

const FAQ = [
  {
    q: "Como recebo o acesso?",
    a: "Depois que o pagamento é confirmado, você recebe um e-mail com o link para criar sua senha. Confira também o spam.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Abre direto no navegador, no celular, no tablet ou no computador, sem instalar nada.",
  },
  {
    q: "É pagamento único mesmo?",
    a: "Sim. Você paga uma vez e o acesso é vitalício, sem mensalidade.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias para desistir da compra e pedir o dinheiro de volta.",
  },
  {
    q: "O plano serve para qualquer lote?",
    a: "O cálculo usa o peso médio e o número de animais do lote. Para casos especiais, confirme a dieta com seu zootecnista ou veterinário.",
  },
  {
    q: "Preciso saber o peso de cada animal na compra do lote?",
    a: "Não. Você lança o lote fechado e completa o peso individual depois, quando pesar.",
  },
];

export default function HomePage() {
  return (
    <main
      className="light-only pb-24 md:pb-0"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <Track pagina="home" />
      <SiteHeader />
      <Hero />
      <DemoSection />
      <ProblemSection />
      <HowSection />
      <CompareSection />
      <PricingSection />
      <FaqSection />
      <SiteFooter />
      <StickyBar />
    </main>
  );
}

/* ---------- Header ---------- */

function SiteHeader() {
  return (
    <header style={{ backgroundColor: DARK }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-10">
        <span className="text-xl font-extrabold text-white">Boi no Cocho</span>
        <nav className="flex items-center gap-6 text-sm font-semibold text-white/80">
          <a href="#como" className="hidden hover:text-white md:inline">
            Como funciona
          </a>
          <a href="#preco" className="hidden hover:text-white md:inline">
            Preço
          </a>
          <a href="#duvidas" className="hidden hover:text-white md:inline">
            Dúvidas
          </a>
          <Link
            href="/login"
            className="flex min-h-[44px] items-center rounded-lg border border-white/50 px-4 text-white hover:bg-white/10"
          >
            Já sou cliente · Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section style={{ backgroundColor: DARK }} className="text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-4 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-10 md:pb-20 md:pt-10">
        <div className="flex flex-col gap-4 md:gap-5">
          <h1 className="text-[40px] font-extrabold leading-[1.02] md:text-6xl">
            A ração certa para cada dia dos 15 dias de adaptação
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
            Informe o peso do lote. O app calcula a ração e o volumoso de cada
            fase e de cada trato, e recalcula quando você pesar de novo.
          </p>
          <div className="mt-1 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Link
              href="/comprar"
              className="flex min-h-[64px] flex-col items-center justify-center rounded-xl px-8 py-2 text-center"
              style={{ backgroundColor: HAY, color: INK }}
            >
              <span className="text-xl font-extrabold md:text-2xl">
                Quero meu plano de adaptação
              </span>
              <span className="text-sm font-semibold">
                R$ 64,90 · pagamento único
              </span>
            </Link>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75 md:flex-col md:gap-y-1">
              <li>Acesso vitalício, sem mensalidade</li>
              <li>7 dias para desistir</li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col gap-3 rounded-2xl p-4 md:p-5"
          style={{ backgroundColor: PAPER, color: INK }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold" style={{ color: DARK }}>
              Lote Outubro
            </span>
            <span className="text-sm" style={{ color: MUTED }}>
              20 animais · 350 kg
            </span>
          </div>
          <div
            className="rounded-lg border-2 px-3 py-2 text-base font-semibold"
            style={{ backgroundColor: "#fff3cf", borderColor: HAY }}
          >
            Hoje: dia 5 de 15, Fase 2
          </div>
          {FASES.slice(0, 2).map((f) => (
            <FaseResumo key={f.n} fase={f} />
          ))}
          <p className="text-xs" style={{ color: MUTED }}>
            R = ração, V = volumoso, em kg por trato, para o lote inteiro.
          </p>
        </div>
      </div>
    </section>
  );
}

function FaseResumo({ fase }: { fase: (typeof FASES)[number] }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl bg-white p-3"
      style={{
        border: fase.hoje ? `3px solid ${HAY}` : `2px solid ${BORDER}`,
        backgroundColor: fase.hoje ? "#fffaf0" : "#ffffff",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold" style={{ color: "#1d3a24" }}>
          Fase {fase.n}{" "}
          <span className="text-sm font-semibold" style={{ color: MUTED }}>
            · dias {fase.dias}
          </span>
        </span>
        {fase.hoje && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: HAY }}
          >
            HOJE
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["07:00", "12:00", "17:00"].map((h) => (
          <div
            key={h}
            className="rounded-lg px-2 py-1.5 text-xs md:text-sm"
            style={{ backgroundColor: SOFT }}
          >
            <b>{h}</b>
            <br />R {fase.racaoTrato} · V {fase.volTrato}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Demonstração ---------- */

function DemoSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
      <h2
        className="text-[28px] font-extrabold leading-tight md:text-4xl"
        style={{ color: DARK }}
      >
        As 5 fases, com a quantidade de cada animal
      </h2>
      <p className="mt-2 text-base md:text-lg" style={{ color: MUTED }}>
        Exemplo: lote de 20 animais com 350 kg de peso médio. As fases 3, 4 e 5
        ficam liberadas depois da compra.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
        {FASES.map((f) => (
          <div
            key={f.n}
            className="flex flex-col gap-0.5 rounded-2xl p-4"
            style={
              f.travada
                ? { backgroundColor: SOFT, border: "2px dashed #8d9a86" }
                : {
                    backgroundColor: f.hoje ? "#fffaf0" : "#ffffff",
                    border: f.hoje ? `3px solid ${HAY}` : `2px solid ${BORDER}`,
                  }
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold" style={{ color: "#1d3a24" }}>
                Fase {f.n}
              </span>
              {f.hoje && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: HAY }}
                >
                  HOJE
                </span>
              )}
            </div>
            <span className="text-sm" style={{ color: MUTED }}>
              dias {f.dias}
            </span>
            <span className="mt-2 text-xs" style={{ color: MUTED }}>
              Ração por animal
            </span>
            <span
              className="select-none text-3xl font-bold leading-tight"
              style={f.travada ? { color: "#8d9a86", filter: "blur(5px)" } : undefined}
            >
              {f.racao} kg
            </span>
            <span className="text-xs" style={{ color: MUTED }}>
              Volumoso por animal
            </span>
            <span
              className="select-none text-3xl font-bold leading-tight"
              style={f.travada ? { color: "#8d9a86", filter: "blur(5px)" } : undefined}
            >
              {f.vol} kg
            </span>
            {f.travada && (
              <span className="mt-2 text-xs font-bold" style={{ color: "#1d3a24" }}>
                Liberada depois da compra
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Problema ---------- */

function ProblemSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
      <h2
        className="text-3xl font-extrabold leading-tight md:text-4xl"
        style={{ color: DARK }}
      >
        A adaptação é a fase em que mais se erra
      </h2>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed" style={{ color: "#2a362a" }}>
        Quem chega no cocho sem plano costuma dar ração demais cedo, ou menos do
        que o animal aguenta. O resultado pode ser animal que para de comer,
        perda de peso e prejuízo logo na entrada do lote.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div
          className="rounded-xl bg-white p-4 text-base leading-snug"
          style={{ border: `2px solid ${BORDER}` }}
        >
          <b>Conta feita de cabeça</b>
          <br />O peso muda e a quantidade certa muda junto.
        </div>
        <div
          className="rounded-xl bg-white p-4 text-base leading-snug"
          style={{ border: `2px solid ${BORDER}` }}
        >
          <b>Cada trato num papel</b>
          <br />
          Sem registro, não dá para saber se o que foi para o cocho bate com o
          previsto.
        </div>
      </div>
    </section>
  );
}

/* ---------- Como funciona ---------- */

function HowSection() {
  const passos = [
    ["Registre o lote.", "Nome, número de animais, data e peso médio de entrada."],
    ["Veja o plano na hora.", "As 5 fases de 3 dias, com os tratos das 07:00, 12:00 e 17:00."],
    ["Pesou de novo? Atualize.", "Todas as fases que faltam se recalculam com o peso novo."],
  ];
  return (
    <section id="como" className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
      <h2
        className="text-3xl font-extrabold leading-tight md:text-4xl"
        style={{ color: DARK }}
      >
        Como funciona
      </h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-3 md:gap-6">
        {passos.map(([titulo, texto], i) => (
          <li key={titulo} className="flex items-start gap-4">
            <span
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-xl font-extrabold"
              style={{ backgroundColor: DARK, color: HAY }}
            >
              {i + 1}
            </span>
            <p className="text-lg leading-snug">
              <b>{titulo}</b> {texto}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Caderno x app ---------- */

function CompareSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
      <div className="grid gap-8 md:grid-cols-2 md:gap-14">
        <div>
          <h2
            className="text-3xl font-extrabold leading-tight md:text-4xl"
            style={{ color: DARK }}
          >
            Caderno ou Boi no Cocho?
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 text-[15px] leading-relaxed"
              style={{ backgroundColor: "#e9ebe2" }}
            >
              <b className="text-lg">No caderno</b>
              <br />
              Conta a cada pesagem
              <br />
              Erro de conta passa batido
              <br />
              Sem histórico do lote
              <br />
              Sem custo por dia
            </div>
            <div
              className="rounded-xl p-4 text-[15px] leading-relaxed text-white"
              style={{ backgroundColor: DARK }}
            >
              <b className="text-lg" style={{ color: HAY }}>
                No app
              </b>
              <br />
              Plano pronto pelo peso
              <br />
              Recalcula sozinho
              <br />
              Histórico de cada trato
              <br />
              Custo de ração por dia
            </div>
          </div>
        </div>
        <div>
          <h2
            className="text-3xl font-extrabold leading-tight md:text-4xl"
            style={{ color: DARK }}
          >
            Além da adaptação, o confinamento inteiro
          </h2>
          <p className="mt-3 text-lg leading-relaxed" style={{ color: "#2a362a" }}>
            Compra do lote, ração no cocho, estoque, despesas e resultado, tudo
            no mesmo lugar. O app tem tema próprio para ler ao ar livre, no sol.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Preço ---------- */

function PricingSection() {
  return (
    <section id="preco" className="mx-auto max-w-6xl px-0 pt-12 md:px-10 md:pt-16">
      <div
        className="grid gap-6 px-5 py-8 text-white md:grid-cols-2 md:items-center md:gap-12 md:rounded-[20px] md:px-14 md:py-12"
        style={{ backgroundColor: DARK }}
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
            Pague uma vez e use sempre
          </h2>
          <div className="flex items-baseline gap-3">
            <span
              className="text-6xl font-extrabold leading-none md:text-7xl"
              style={{ color: HAY }}
            >
              R$ 64,90
            </span>
            <span className="text-sm text-white/75">preço de lançamento</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-1.5 text-base text-white/90">
            <li>Acesso vitalício, sem mensalidade</li>
            <li>Plano de adaptação e todos os módulos</li>
            <li>Acesso enviado por e-mail depois do pagamento</li>
            <li>Pix, cartão ou boleto pelo Mercado Pago</li>
          </ul>
          <Link
            href="/comprar"
            className="flex min-h-[60px] items-center justify-center rounded-xl text-xl font-extrabold md:text-2xl"
            style={{ backgroundColor: HAY, color: INK }}
          >
            Quero meu plano de adaptação
          </Link>
          <p className="text-sm leading-snug text-white/75">
            <b className="text-white">7 dias para desistir.</b> Se não for o que
            você esperava, pode pedir o dinheiro de volta nesse prazo.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FaqSection() {
  return (
    <section id="duvidas" className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
      <h2
        className="text-3xl font-extrabold leading-tight md:text-4xl"
        style={{ color: DARK }}
      >
        Dúvidas comuns
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {FAQ.map((f) => (
          <div
            key={f.q}
            className="rounded-xl bg-white px-4 py-4"
            style={{ border: `2px solid ${BORDER}` }}
          >
            <p className="font-bold">{f.q}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: "#3f4c3c" }}>
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Rodapé ---------- */

function SiteFooter() {
  return (
    <footer
      className="mx-auto max-w-6xl px-5 py-10 text-sm leading-relaxed md:px-10"
      style={{ color: MUTED }}
    >
      <b className="text-base" style={{ color: DARK }}>
        Boi no Cocho
      </b>
      <br />
      Gestão de confinamento bovino
      <br />
      <Link href="/login" className="font-semibold underline">
        Entrar no aplicativo
      </Link>
      <br />© 2026 Boi no Cocho
    </footer>
  );
}

/* ---------- Barra fixa (celular) ---------- */

function StickyBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 md:hidden"
      style={{ backgroundColor: DARK, boxShadow: `0 -2px 0 ${HAY}` }}
    >
      <div className="flex flex-col text-white">
        <span className="text-2xl font-extrabold leading-none">R$ 64,90</span>
        <span className="text-xs text-white/75">pagamento único</span>
      </div>
      <Link
        href="/comprar"
        className="flex min-h-[48px] items-center rounded-[10px] px-5 text-lg font-extrabold"
        style={{ backgroundColor: HAY, color: INK }}
      >
        Quero meu plano
      </Link>
    </div>
  );
}
