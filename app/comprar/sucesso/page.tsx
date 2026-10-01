export default function SucessoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="card max-w-md text-center space-y-3">
        <div className="text-4xl">✅</div>
        <h1 className="text-xl font-bold text-brand-700">Pagamento recebido!</h1>
        <p className="text-sm text-gray-600">
          Em alguns instantes você vai receber um e-mail com o link pra criar sua senha e acessar o
          Boi no Cocho. Não esqueça de checar a caixa de spam/lixo eletrônico.
        </p>
        <p className="text-xs text-gray-400">O e-mail é enviado assim que o Mercado Pago confirmar o pagamento.</p>
      </div>
    </div>
  );
}
