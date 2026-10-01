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
      // notificação de outro tipo (ex: teste) — nada a fazer, só confirma o recebimento
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
      const email: string | undefined = payment.payer?.email;
      if (email) {
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
    // sempre responde 200 pro Mercado Pago não ficar retentando indefinidamente por erro nosso
    return NextResponse.json({ ok: true });
  }
}

// o Mercado Pago também pode enviar um GET de verificação
export async function GET() {
  return NextResponse.json({ ok: true });
}
