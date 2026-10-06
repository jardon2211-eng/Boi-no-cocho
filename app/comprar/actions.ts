"use server";

import { redirect } from "next/navigation";

export async function iniciarPagamento(formData: FormData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN não configurado. Veja o README para configurar o Mercado Pago.");
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    throw new Error("Informe um e-mail válido para receber o acesso.");
  }

  const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: "Boi no Cocho — Acesso Vitalício",
          description: "Gestão completa de confinamento, pagamento único",
          quantity: 1,
          unit_price: 64.9,
          currency_id: "BRL",
        },
      ],
      payer: {
        email,
      },
      // Fonte confiável do e-mail do comprador: o campo payer.email que volta
      // na consulta do pagamento pode vir mascarado ("XXXXXXXXXXX") dependendo
      // do meio de pagamento (ex.: transferência bancária/Pix com CNPJ). Por
      // isso guardamos o e-mail digitado aqui e o webhook usa este campo.
      external_reference: email,
      back_urls: {
        success: `${siteUrl}/comprar/sucesso`,
        failure: `${siteUrl}/comprar/erro`,
        pending: `${siteUrl}/comprar/sucesso`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "BOI NO COCHO",
    }),
  });

  if (!resp.ok) {
    const texto = await resp.text();
    console.error("Erro ao criar preferência Mercado Pago:", texto);
    throw new Error("Não foi possível iniciar o pagamento. Tente novamente em instantes.");
  }

  const data = await resp.json();
  redirect(data.init_point as string);
}
