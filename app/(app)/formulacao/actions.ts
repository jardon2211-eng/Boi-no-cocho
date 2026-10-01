"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ItemReceita } from "@/lib/types";

export async function criarProduto(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("produtos").insert({
    user_id: user.id,
    nome: String(formData.get("nome")),
    categoria: String(formData.get("categoria") || ""),
    kg_por_saco: Number(formData.get("kg_por_saco") || 1),
    preco_saco: Number(formData.get("preco_saco")),
    fornecedor: String(formData.get("fornecedor") || ""),
    estoque_minimo_kg: Number(formData.get("estoque_minimo_kg") || 0),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/estoque");
}

export async function excluirProduto(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/estoque");
}

export async function criarFormulacao(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const loteId = String(formData.get("lote_id") || "");

  const { error } = await supabase.from("formulacoes").insert({
    user_id: user.id,
    lote_id: loteId || null,
    produto_id: String(formData.get("produto_id")),
    data: String(formData.get("data")),
    percentual: Number(formData.get("percentual")),
    kg_dia_total: Number(formData.get("kg_dia_total")),
    status: "Pendente",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
  revalidatePath("/lotes");
}

/** Cria de uma vez todos os ingredientes de uma dieta (mesma data/lote/kg_dia_total, % de cada produto). */
export async function criarDietaCompleta(
  loteId: string | null,
  data: string,
  kgDiaTotal: number,
  custoVolumosoKg: number,
  itens: ItemReceita[]
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const linhas = itens
    .filter((i) => i.produto_id && i.percentual > 0)
    .map((i) => ({
      user_id: user.id,
      lote_id: loteId,
      produto_id: i.produto_id,
      data,
      percentual: i.percentual,
      kg_dia_total: kgDiaTotal,
      custo_volumoso_kg: custoVolumosoKg,
      status: "Pendente" as const,
    }));
  if (linhas.length === 0) return;

  const { error } = await supabase.from("formulacoes").insert(linhas);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
  revalidatePath("/lotes");
  revalidatePath("/cocho");
}

export async function aprovarFormulacao(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("formulacoes").update({ status: "Aprovado" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
  revalidatePath("/lotes");
}

/** Aprova de uma vez todos os ingredientes de uma dieta (mesmo lote + mesma data). */
export async function aprovarDieta(loteId: string | null, data: string) {
  const supabase = createClient();
  const base = supabase.from("formulacoes").update({ status: "Aprovado" }).eq("data", data);
  const { error } = loteId ? await base.eq("lote_id", loteId) : await base.is("lote_id", null);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
  revalidatePath("/lotes");
}

export async function excluirDieta(loteId: string | null, data: string) {
  const supabase = createClient();
  const base = supabase.from("formulacoes").delete().eq("data", data);
  const { error } = loteId ? await base.eq("lote_id", loteId) : await base.is("lote_id", null);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
}

export async function excluirFormulacao(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("formulacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
}
