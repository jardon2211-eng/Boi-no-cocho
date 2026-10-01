import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-2">🐂</div>
        <h1 className="text-2xl font-bold text-brand-700 mb-1">Boi no Cocho</h1>
        <p className="text-gray-500 text-sm mb-8">Gestão completa de confinamento</p>

        <div className="card space-y-4">
          <p className="text-sm text-gray-600">
            O Boi no Cocho é vendido por pagamento único de <strong>R$ 49,90</strong> — acesso vitalício,
            sem mensalidade. Depois de pagar, você recebe por e-mail o link pra criar sua senha e entrar.
          </p>
          <Link href="/comprar" className="btn-primary w-full block text-center">
            Comprar agora — R$ 49,90
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já comprou?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
