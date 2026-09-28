"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarProduto(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("produtos").insert({
    user_id: user.id,
    nome: String(formData.get("nome")),
    categoria: String(formData.get("categoria") || ""),
    preco_kg: Number(formData.get("preco_kg")),
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

  const { error } = await supabase.from("formulacoes").insert({
    user_id: user.id,
    lote_id: String(formData.get("lote_id")),
    produto_id: String(formData.get("produto_id")),
    data: String(formData.get("data")),
    kg_animal_dia: Number(formData.get("kg_animal_dia")),
    status: "Pendente",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
  revalidatePath("/lotes");
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

export async function excluirFormulacao(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("formulacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/formulacao");
  revalidatePath("/consumo");
  revalidatePath("/dashboard");
}
