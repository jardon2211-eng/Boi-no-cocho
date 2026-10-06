import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-14 sm:mb-20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐂</span>
            <span className="font-bold text-[#2e4c2e] text-lg">Boi no Cocho</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#2e4c2e] hover:underline"
          >
            Entrar
          </Link>
        </header>

        {/* Hero */}
        <section className="text-center mb-16 sm:mb-20">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#2e4c2e] mb-4 leading-tight">
            Gestão completa do seu confinamento,
            <br className="hidden sm:block" /> sem planilha e sem complicação
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Controle lotes, ração no cocho, custos e o resultado da engorda em
            um só lugar — direto do computador ou do celular.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/comprar"
              className="rounded-lg bg-[#2e4c2e] text-white font-semibold px-8 py-3 hover:bg-[#24391f] transition"
            >
              Comprar acesso — R$ 64,90
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[#2e4c2e] text-[#2e4c2e] font-semibold px-8 py-3 hover:bg-green-50 transition"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Pagamento único. Acesso vitalício. Sem mensalidade.
          </p>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-2 gap-6 mb-16 sm:mb-20">
          <FeatureCard
            icon="🐄"
            title="Controle de lote"
            desc="Cadastre cada lote de confinamento e acompanhe entrada, peso, dias de cocho e saída de cada animal sem perder informação."
          />
          <FeatureCard
            icon="🌾"
            title="Ração no cocho"
            desc="Registre a ração oferecida em cada trato e tenha o consumo de cada curral sob controle, dia a dia."
          />
          <FeatureCard
            icon="💰"
            title="Controle financeiro"
            desc="Lance os custos de ração, sanidade, frete e mão de obra e saiba exatamente quanto cada lote está custando."
          />
          <FeatureCard
            icon="📊"
            title="Relatórios e indicadores"
            desc="Acompanhe ganho de peso, conversão alimentar e o resultado financeiro da engorda em relatórios prontos."
          />
        </section>

        {/* Pricing */}
        <section className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-sm border border-green-100 p-8 mb-16">
          <p className="text-sm text-gray-500 mb-1">Pagamento único</p>
          <p className="text-4xl font-bold text-[#2e4c2e] mb-1">R$ 64,90</p>
          <p className="text-sm text-gray-500 mb-6">
            Acesso vitalício — sem mensalidade
          </p>
          <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
            <li>✓ Todos os módulos liberados</li>
            <li>✓ Sem cobrança recorrente</li>
            <li>✓ Acesso enviado por e-mail em poucos minutos</li>
            <li>✓ Funciona no computador e no celular</li>
          </ul>
          <Link
            href="/comprar"
            className="block rounded-lg bg-[#2e4c2e] text-white font-semibold py-3 hover:bg-[#24391f] transition"
          >
            Comprar agora
          </Link>
        </section>

        <footer className="text-center text-sm text-gray-400">
          <p>Boi no Cocho — Gestão completa de confinamento</p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-[#2e4c2e] mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
