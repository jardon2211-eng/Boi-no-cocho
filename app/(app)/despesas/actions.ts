"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarDespesa(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const loteId = String(formData.get("lote_id") || "");

  const { error } = await supabase.from("despesas").insert({
    user_id: user.id,
    lote_id: loteId || null,
    categoria: String(formData.get("categoria")),
    descricao: String(formData.get("descricao")),
    valor: Number(formData.get("valor")),
    data: String(formData.get("data")),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/despesas");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}

export async function excluirDespesa(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/despesas");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}
