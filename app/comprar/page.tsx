import Link from "next/link";
import { iniciarPagamento } from "./actions";

export default function ComprarPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐂</div>
          <h1 className="text-2xl font-bold text-brand-700">Boi no Cocho</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão completa de confinamento</p>
        </div>

        <div className="card space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-500">Pagamento único</p>
            <p className="text-4xl font-bold text-brand-700 mt-1">R$ 64,90</p>
            <p className="text-sm text-gray-500 mt-1">Acesso vitalício — sem mensalidade</p>
          </div>

          <ul className="text-sm text-gray-600 space-y-2 border-t border-gray-100 pt-4">
            <li>✓ Todos os módulos liberados</li>
            <li>✓ Sem cobrança recorrente</li>
            <li>✓ Acesso enviado por e-mail em poucos minutos</li>
            <li>✓ Funciona no computador e no celular</li>
          </ul>

          <form action={iniciarPagamento} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Seu e-mail
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                É pra esse e-mail que enviamos o acesso após o pagamento.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full">
              Pagar com Mercado Pago — R$ 64,90
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            Pagamento processado com segurança pelo Mercado Pago (Pix, cartão ou boleto).
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já comprou?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
