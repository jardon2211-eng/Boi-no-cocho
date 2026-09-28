"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarMovimento(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const loteId = String(formData.get("lote_id") || "");

  const { error } = await supabase.from("estoque_movimentos").insert({
    user_id: user.id,
    produto_id: String(formData.get("produto_id")),
    tipo: String(formData.get("tipo")),
    quantidade_kg: Number(formData.get("quantidade_kg")),
    lote_id: loteId || null,
    observacao: String(formData.get("observacao") || ""),
    data: String(formData.get("data")),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}

export async function excluirMovimento(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("estoque_movimentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/estoque");
}
