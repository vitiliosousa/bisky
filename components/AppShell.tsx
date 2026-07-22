"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Wallet,
  Plus,
} from "lucide-react";
import { Header } from "./Header";
import { NAV_ALL, Sidebar } from "./Sidebar";
import { Toaster } from "./ui";
import { getPerfil } from "@/lib/profile";

const BOTTOM_NAV = [
  { href: "/dashboard",  label: "Início",   icon: LayoutDashboard },
  { href: "/pedidos",    label: "Pedidos",  icon: ShoppingBag     },
  { href: "/negocio",    label: "Negócio",  icon: Briefcase       },
  { href: "/financas",   label: "Finanças", icon: Wallet          },
];

function getPageInfo(pathname: string) {
  if (pathname === "/produtos/novo") {
    return { title: "Novo produto", subtitle: "Cadastre um produto e a sua receita" };
  }
  if (pathname.startsWith("/produtos/") && pathname.endsWith("/editar")) {
    return { title: "Editar produto", subtitle: "Atualize os dados e a receita" };
  }
  if (pathname.startsWith("/produtos/") && pathname !== "/produtos") {
    return { title: "Detalhe do produto", subtitle: "Receita, custos e preços" };
  }
  if (pathname === "/clientes/novo") {
    return { title: "Novo cliente", subtitle: "Cadastre um cliente" };
  }
  if (pathname.startsWith("/clientes/") && pathname.endsWith("/editar")) {
    return { title: "Editar cliente", subtitle: "Atualize os dados do cliente" };
  }
  if (pathname.startsWith("/clientes/") && pathname !== "/clientes") {
    return { title: "Detalhe do cliente", subtitle: "Histórico e contactos" };
  }
  if (pathname === "/caixa/novo") {
    return { title: "Novo movimento", subtitle: "Registe uma entrada ou saída" };
  }
  if (pathname.startsWith("/caixa/") && pathname.endsWith("/editar")) {
    return { title: "Editar movimento", subtitle: "Atualize o registo de caixa" };
  }
  if (pathname.startsWith("/caixa/") && pathname !== "/caixa") {
    return { title: "Detalhe do movimento", subtitle: "Entrada ou saída de caixa" };
  }
  if (pathname === "/pedidos/novo") {
    return { title: "Novo pedido", subtitle: "Cliente, produtos e entrega" };
  }
  if (pathname.startsWith("/pedidos/") && pathname.endsWith("/editar")) {
    return { title: "Editar pedido", subtitle: "Atualize os dados do pedido" };
  }
  if (pathname === "/calendario/novo") {
    return { title: "Novo evento", subtitle: "Agende uma entrega ou festa" };
  }
  if (pathname.startsWith("/calendario/") && pathname.endsWith("/editar")) {
    return { title: "Editar evento", subtitle: "Atualize o evento do calendário" };
  }
  if (pathname.startsWith("/calendario/") && pathname !== "/calendario") {
    return { title: "Detalhe do evento", subtitle: "Data, hora e tipo" };
  }
  if (pathname === "/contas-pagar/novo") {
    return { title: "Nova conta", subtitle: "Fornecedor, valor e vencimento" };
  }
  if (pathname.startsWith("/contas-pagar/") && pathname.endsWith("/editar")) {
    return { title: "Editar conta", subtitle: "Atualize os dados da conta" };
  }
  if (pathname === "/negocio") {
    return { title: "Negócio", subtitle: "Clientes, produtos e operações" };
  }
  if (pathname === "/financas") {
    return { title: "Finanças", subtitle: "Caixa, contas e relatórios" };
  }
  if (pathname === "/perdas") {
    return { title: "Perdas", subtitle: "Desperdícios e baixas de stock" };
  }
  if (pathname === "/materiais") {
    return { title: "Materiais", subtitle: "Caixas, fitas e outros consumíveis" };
  }
  if (pathname === "/materiais/novo") {
    return { title: "Novo material", subtitle: "Cadastre um consumível" };
  }
  if (pathname.includes("/materiais/") && pathname.endsWith("/editar")) {
    return { title: "Editar material", subtitle: "Actualize os dados" };
  }
  if (pathname === "/estoque/novo") {
    return { title: "Novo ingrediente", subtitle: "Cadastre no estoque" };
  }
  if (pathname.startsWith("/estoque/") && pathname.endsWith("/editar")) {
    return { title: "Editar ingrediente", subtitle: "Atualize quantidade e custos" };
  }
  if (pathname === "/perfil/editar") {
    return { title: "Editar perfil", subtitle: "Atualize os seus dados" };
  }
  if (pathname === "/perfil") {
    return { title: "Perfil", subtitle: "Os seus dados e contactos" };
  }
  const item = NAV_ALL.find((n) => n.href === pathname);
  return { title: item?.label ?? "Bisky", subtitle: item?.subtitle ?? "" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState("Adélia Machava");
  const [papel, setPapel] = useState("Confeiteira");

  useEffect(() => {
    const ok = localStorage.getItem("cakescontrol_auth") === "1";
    if (!ok) {
      router.replace("/login");
      return;
    }
    function refreshUser() {
      const perfil = getPerfil();
      setUser(perfil.nome);
      setPapel(perfil.papel);
    }
    refreshUser();
    window.addEventListener("bisky:profile-updated", refreshUser);
    setReady(true);
    return () => window.removeEventListener("bisky:profile-updated", refreshUser);
  }, [router]);

  function sair() {
    localStorage.removeItem("cakescontrol_auth");
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-muted">
        A carregar…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-page">
      <Sidebar pathname={pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pageTitle={getPageInfo(pathname).title}
          pageSubtitle={getPageInfo(pathname).subtitle}
          user={user}
          papel={papel}
          onSair={sair}
        />

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
          {children}
        </main>
        <Toaster />

        {/* ── Bottom nav mobile ──────────────────────────────── */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex items-stretch border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {BOTTOM_NAV.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-14 text-[0.6rem] font-semibold transition-colors ${
                  active ? "text-strawberry" : "text-muted"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}

          {/* Botão central — Novo pedido */}
          <div className="flex flex-1 items-center justify-center">
            <Link
              href="/pedidos/novo"
              className="flex size-13 items-center justify-center rounded-full bg-strawberry shadow-md shadow-strawberry/30 transition hover:brightness-110"
              aria-label="Novo pedido"
            >
              <Plus className="size-6 text-white" strokeWidth={2.5} />
            </Link>
          </div>

          {BOTTOM_NAV.slice(2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-14 text-[0.6rem] font-semibold transition-colors ${
                  active ? "text-strawberry" : "text-muted"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
