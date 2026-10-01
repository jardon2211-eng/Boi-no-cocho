import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave de serviço (service role) do Supabase — ignora o RLS.
 * NUNCA importe isso em um Client Component nem exponha essa chave ao navegador.
 * Usado só em rotas de servidor (ex: webhook de pagamento) pra criar contas.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
