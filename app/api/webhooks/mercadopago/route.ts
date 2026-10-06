import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * O Mercado Pago chama essa rota sempre que o status de um pagamento muda.
 * Por segurança, NUNCA confiamos no corpo da notificação sozinho — sempre
 * buscamos o pagamento de verdade na API do Mercado Pago antes de agir.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => null);

    const paymentId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN não configurado no servidor.");
      return NextResponse.json({ ok: true });
    }

    const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!mpResp.ok) {
      console.error("Não foi possível confirmar o pagamento", paymentId);
      return NextResponse.json({ ok: true });
    }
    const payment = await mpResp.json();

    if (payment.status === "approved") {
      // O e-mail do comprador é gravado por nós em external_reference na hora
      // de criar a preferência (app/comprar/actions.ts). payment.payer?.email
      // NÃO é confiável: para alguns meios de pagamento (ex.: transferência
      // bancária/Pix com CNPJ) o Mercado Pago devolve esse campo mascarado,
      // tipo "XXXXXXXXXXX", em vez do e-mail real.
      const emailValidoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const candidatos = [payment.external_reference, payment.payer?.email];
      const email = candidatos.find(
        (c): c is string => typeof c === "string" && emailValidoRegex.test(c.trim())
      )?.trim().toLowerCase();

      if (!email) {
        console.error(
          "Pagamento aprovado mas sem e-mail válido para criar acesso. payment_id:",
          paymentId,
          "external_reference:",
          payment.external_reference,
          "payer.email:",
          payment.payer?.email
        );
      } else {
        const admin = createAdminClient();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
        const { error } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${siteUrl}/definir-senha`,
        });
        if (error && !error.message.toLowerCase().includes("already")) {
          console.error("Erro ao convidar usuário após pagamento:", error.message);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
