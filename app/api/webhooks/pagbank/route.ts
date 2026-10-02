import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * O PagBank assina a notificação com SHA-256 usando o token da sua conta:
 * assinatura = SHA256("{token}-{corpo_cru_da_requisicao}"), enviada no header
 * x-authenticity-token. Por isso precisamos do corpo CRU (texto), não o JSON
 * já interpretado, pra recalcular e comparar.
 */
function assinaturaValida(payloadCru: string, token: string, recebida: string | null): boolean {
  if (!recebida) return false;
  const esperada = crypto.createHash("sha256").update(`${token}-${payloadCru}`).digest("hex");
  return esperada === recebida;
}

export async function POST(request: Request) {
  try {
    const payloadCru = await request.text();
    const token = process.env.PAGBANK_TOKEN;
    const assinaturaRecebida = request.headers.get("x-authenticity-token");

    if (token && !assinaturaValida(payloadCru, token, assinaturaRecebida)) {
      console.error("Webhook PagBank: assinatura não confere.");
      return NextResponse.json({ ok: true });
    }

    const body = JSON.parse(payloadCru);

    // O formato exato pode variar um pouco (Checkout x Pedido/Charge).
    // Se o primeiro teste real não liberar o acesso, veja nos logs da Vercel
    // o payload de verdade e ajuste os caminhos abaixo.
    const status: string | undefined = body?.status ?? body?.charges?.[0]?.status;
    const email: string | undefined = body?.customer?.email;

    if (status !== "PAID" || !email) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/definir-senha`,
    });
    if (error && !error.message.toLowerCase().includes("already")) {
      console.error("Erro ao convidar usuário após pagamento:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do PagBank:", err);
    // sempre responde 200 pro PagBank não ficar retentando indefinidamente por erro nosso
    return NextResponse.json({ ok: true });
  }
}

// o PagBank também pode enviar um GET de verificação ao salvar o webhook
export async function GET() {
  return NextResponse.json({ ok: true });
}
