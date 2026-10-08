"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

const MENU = [
  { href: "/dashboard", label: "Visão Geral", icon: "▦" },
  { href: "/compras", label: "Compras", icon: "🛒" },
  { href: "/formulacao", label: "Formulação", icon: "🧪" },
  { href: "/consumo", label: "Relatório Consumo", icon: "📊" },
  { href: "/estoque", label: "Estoque Ração", icon: "📦" },
  { href: "/cocho", label: "Ração no Cocho", icon: "🌾" },
  { href: "/lotes", label: "Lotes", icon: "📈" },
  { href: "/despesas", label: "Despesas", icon: "💵" },
  { href: "/exportar", label: "Exportar Dados", icon: "📤" },
  { href: "/como-usar", label: "Como Usar", icon: "❓", badge: "NOVO" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">Menu</p>
        {MENU.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-brand-700 text-white" : "text-gray-700 hover:bg-brand-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  function LogoutButton() {
    return (
      <div className="p-3 border-t border-gray-100 space-y-1">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          ↩ Sair
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Barra superior — só aparece no celular/tablet estreito */}
      <div className="md:hidden sticky top-0 z-30 bg-brand-700 text-white flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <span className="font-bold flex items-center gap-2">🐂 Boi no Cocho</span>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-2xl leading-none px-1">☰</button>
        </div>
      </div>

      {/* Menu lateral fixo — telas médias/grandes */}
      <aside className="hidden md:flex w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex-col">
        <div className="bg-brand-700 text-white px-5 py-4 flex items-center gap-2">
          <span className="text-xl">🐂</span>
          <span className="font-bold">Boi no Cocho</span>
        </div>
        <NavLinks />
        <LogoutButton />
      </aside>

      {/* Menu em gaveta — celular */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white flex flex-col shadow-xl">
            <div className="bg-brand-700 text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">🐂 Boi no Cocho</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-2xl leading-none px-1">×</button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <LogoutButton />
          </aside>
        </div>
      )}
    </>
  );
}
