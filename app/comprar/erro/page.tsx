import Link from "next/link";

export default function ErroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="card max-w-md text-center space-y-3">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold text-brand-700">Pagamento não concluído</h1>
        <p className="text-sm text-gray-600">
          Algo deu errado ou o pagamento ficou pendente. Se o valor foi descontado, aguarde alguns minutos —
          às vezes a confirmação demora. Se não, pode tentar de novo.
        </p>
        <Link href="/comprar" className="btn-primary inline-block mt-2">Tentar novamente</Link>
      </div>
    </div>
  );
}
