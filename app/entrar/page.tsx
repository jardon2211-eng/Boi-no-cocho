import { redirect } from "next/navigation";

// Atalho para divulgar: boinococho.com/entrar leva direto para o login do aplicativo.
export default function EntrarPage() {
  redirect("/login");
}
