"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarCompra(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const nome = String(formData.get("nome") || "").trim() || `Lote ${new Date().toLocaleDateString("pt-BR")}`;

  const { error } = await supabase.from("lotes").insert({
    user_id: user.id,
    nome,
    fornecedor: String(formData.get("fornecedor") || ""),
    data_entrada: String(formData.get("data_entrada")),
    quantidade_inicial: Number(formData.get("quantidade_inicial")),
    peso_entrada: Number(formData.get("peso_entrada")),
    preco_compra_kg: Number(formData.get("preco_compra_kg")),
    gmd_esperado: Number(formData.get("gmd_esperado")),
    dias_previstos: Number(formData.get("dias_previstos")),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/compras");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}

export async function excluirLote(loteId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("lotes").delete().eq("id", loteId);
  if (error) throw new Error(error.message);
  revalidatePath("/compras");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}

export async function ajustarAnimais(loteId: string, ajuste: number) {
  const supabase = createClient();
  const { data: lote } = await supabase.from("lotes").select("ajuste_animais").eq("id", loteId).single();
  const novoAjuste = (lote?.ajuste_animais ?? 0) + ajuste;
  const { error } = await supabase.from("lotes").update({ ajuste_animais: novoAjuste }).eq("id", loteId);
  if (error) throw new Error(error.message);
  revalidatePath("/lotes");
  revalidatePath("/compras");
  revalidatePath("/dashboard");
}

export async function atualizarPeso(loteId: string, pesoAtual: number) {
  const supabase = createClient();
  const { error } = await supabase.from("lotes").update({ peso_atual: pesoAtual }).eq("id", loteId);
  if (error) throw new Error(error.message);
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}

export async function registrarVenda(loteId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lotes")
    .update({
      status: "Vendido",
      data_venda: String(formData.get("data_venda")),
      peso_venda: Number(formData.get("peso_venda")),
      preco_venda_kg: Number(formData.get("preco_venda_kg")),
    })
    .eq("id", loteId);
  if (error) throw new Error(error.message);
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}
