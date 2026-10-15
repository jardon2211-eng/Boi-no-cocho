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

    // registra a venda (e a comissão do afiliado, se houver). Nunca bloqueia a liberação do acesso.
    try {
      const adm = createAdminClient();
      if (payment.status === "approved") {
        const refBruto = String(payment.metadata?.ref ?? "").toLowerCase();
        let codigo: string | null = null;
        let comissao = 0;
        const valor = Number(payment.transaction_amount) || 0;
        if (/^[a-z0-9_-]{2,30}$/.test(refBruto)) {
          const { data: af } = await adm
            .from("afiliados")
            .select("codigo, comissao_pct, ativo")
            .eq("codigo", refBruto)
            .maybeSingle();
          if (af?.ativo) {
            codigo = af.codigo;
            comissao = Math.round(valor * Number(af.comissao_pct)) / 100;
          }
        }
        const emailVenda = String(payment.external_reference || payment.payer?.email || "").trim().toLowerCase();
        await adm.from("vendas").upsert(
          {
            payment_id: String(paymentId),
            email: emailVenda || "desconhecido",
            valor,
            status: "approved",
            afiliado_codigo: codigo,
            comissao,
            aprovado_em: payment.date_approved || new Date().toISOString(),
          },
          { onConflict: "payment_id", ignoreDuplicates: true }
        );
      } else if (["refunded", "charged_back", "cancelled"].includes(payment.status)) {
        await adm.from("vendas").update({ status: payment.status }).eq("payment_id", String(paymentId));
      }
    } catch (e) {
      console.error("Erro ao registrar venda/afiliado:", e);
    }

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
