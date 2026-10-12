"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function numero(v: FormDataEntryValue | null): number {
  return Number(String(v ?? "").replace(",", "."));
}

/** Cria um lote só com o essencial para a adaptação (o resto usa os valores padrão do banco). */
export async function criarLoteAdaptacao(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const nome = String(formData.get("nome") || "").trim() || `Lote ${new Date().toLocaleDateString("pt-BR")}`;
  const quantidade = Math.round(numero(formData.get("quantidade")));
  const peso = numero(formData.get("peso"));
  const data = String(formData.get("data_entrada") || "");

  if (!(quantidade > 0) || !(peso > 0) || !data) return;

  const { error } = await supabase.from("lotes").insert({
    user_id: user.id,
    nome,
    data_entrada: data,
    quantidade_inicial: quantidade,
    peso_entrada: peso,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/adaptacao");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}

/** Nova pesagem: atualiza o peso médio do lote e o plano é recalculado na tela. */
export async function atualizarPesoAdaptacao(loteId: string, formData: FormData) {
  const supabase = createClient();
  const peso = numero(formData.get("peso"));
  if (!(peso > 0)) return;

  const { error } = await supabase.from("lotes").update({ peso_atual: peso }).eq("id", loteId);
  if (error) throw new Error(error.message);
  revalidatePath("/adaptacao");
  revalidatePath("/lotes");
  revalidatePath("/dashboard");
}
