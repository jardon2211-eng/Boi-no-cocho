"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TratoInput = {
  trato_numero: number;
  horario: string;
  racao_kg: number;
  volumoso_kg: number;
  sobrou: boolean;
  sobra_kg: number;
};

/** Salva (ou atualiza, se já existir) os tratos de um dia inteiro pra um lote, de uma vez. */
export async function registrarTratosDoDia(loteId: string, data: string, tratos: TratoInput[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const linhas = tratos.map((t) => ({
    user_id: user.id,
    lote_id: loteId,
    data,
    trato_numero: t.trato_numero,
    horario: t.horario,
    racao_kg: t.racao_kg,
    volumoso_kg: t.volumoso_kg,
    sobrou: t.sobrou,
    sobra_kg: t.sobrou ? t.sobra_kg : 0,
  }));

  const { error } = await supabase
    .from("cocho_registros")
    .upsert(linhas, { onConflict: "lote_id,data,trato_numero" });

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
