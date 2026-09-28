"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarCocho(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("cocho_registros").insert({
    user_id: user.id,
    lote_id: String(formData.get("lote_id")),
    data: String(formData.get("data")),
    quantidade_kg: Number(formData.get("quantidade_kg")),
    sobra_kg: Number(formData.get("sobra_kg") || 0),
    observacao: String(formData.get("observacao") || ""),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/cocho");
  revalidatePath("/dashboard");
}

export async function excluirCocho(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("cocho_registros").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cocho");
  revalidatePath("/dashboard");
}
