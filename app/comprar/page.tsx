import Track from "@/components/Track";
import Link from "next/link";
import ComprarForm from "./ComprarForm";

const DARK = "#12281a";
const PAPER = "#f6f7f1";
const INK = "#1a2419";
const MUTED = "#4a5547";
const BORDER = "#cfd6c8";

const MENSAGENS: Record<string, string> = {
  email: "Esse e-mail parece inválido. Confira e tente de novo.",
  pagamento:
    "Não conseguimos abrir o pagamento agora. Tente de novo em instantes. Nada foi cobrado.",
};

export default function ComprarPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const erro = searchParams.erro ? MENSAGENS[searchParams.erro] : undefined;

  return (
    <div
      className="light-only min-h-screen px-4 py-6"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <Track pagina="comprar" />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="min-h-[44px] py-3 text-sm font-semibold" style={{ color: MUTED }}>
            ← Voltar
          </Link>
          <span className="text-lg font-extrabold" style={{ color: DARK }}>
            Boi no Cocho
          </span>
        </div>

        <div
          className="space-y-5 rounded-2xl bg-white p-5"
          style={{ border: `2px solid ${BORDER}` }}
        >
          <div>
            <h1 className="text-2xl font-extrabold leading-tight" style={{ color: DARK }}>
              Plano de adaptação de 15 dias + gestão do confinamento
            </h1>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Informe o peso do lote e receba a ração e o volumoso de cada fase e de cada
              trato (07:00, 12:00 e 17:00). Pesou de novo? O plano se recalcula.
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="whitespace-nowrap text-5xl font-extrabold" style={{ color: DARK }}>
              R$ 64,90
            </span>
            <span className="text-sm" style={{ color: MUTED }}>
              pagamento único · preço de lançamento
            </span>
          </div>

          <ul className="space-y-1.5 text-sm" style={{ color: "#2a362a" }}>
            <li>✓ Acesso vitalício, sem mensalidade</li>
            <li>✓ Todos os módulos: compras, ração no cocho, estoque e despesas</li>
            <li>✓ Acesso enviado por e-mail em poucos minutos</li>
            <li>✓ Funciona no celular e no computador, sem instalar nada</li>
          </ul>

          {erro && (
            <p
              className="rounded-lg p-3 text-sm font-semibold"
              style={{ backgroundColor: "#fdecea", color: "#9b1c1c" }}
            >
              {erro}
            </p>
          )}

          <ComprarForm />

          <p className="text-center text-xs" style={{ color: MUTED }}>
            <b style={{ color: INK }}>7 dias para desistir:</b> se não for o que você esperava,
            pode pedir o dinheiro de volta nesse prazo. Pagamento processado com segurança
            pelo Mercado Pago.
          </p>
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: MUTED }}>
          Já comprou?{" "}
          <Link href="/login" className="font-semibold underline" style={{ color: DARK }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
