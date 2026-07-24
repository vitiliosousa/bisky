"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Cake,
  Package,
  ShoppingBag,
  CalendarDays,
  Wallet,
  ArrowDownLeft,
  BarChart3,
  Box,
  Trash2,
  Calculator,
} from "lucide-react";
import { BiskyLogo } from "./BiskyLogo";

export type NavItem = {
  href: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
};

export const NAV_MAIN: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",  subtitle: "Visão geral do negócio",       icon: LayoutDashboard },
  { href: "/produtos",   label: "Produtos",   subtitle: "Bolos, doces e encomendas",    icon: Cake           },
  { href: "/clientes",   label: "Clientes",   subtitle: "Quem compra mais",             icon: Users          },
  { href: "/pedidos",    label: "Pedidos",    subtitle: "Encomendas e entregas",        icon: ShoppingBag    },
  { href: "/ingredientes", label: "Ingredientes", subtitle: "Ingredientes e quantidades",   icon: Package        },
  { href: "/calendario", label: "Calendário", subtitle: "Entregas e prazos",            icon: CalendarDays   },
  { href: "/materiais",  label: "Materiais",  subtitle: "Caixas, fitas e outros",       icon: Box            },
  { href: "/perdas",     label: "Perdas",     subtitle: "Desperdícios e baixas",        icon: Trash2         },
];

export const NAV_FIN: NavItem[] = [
  { href: "/caixa",          label: "Fluxo de caixa", subtitle: "Entradas e saídas do mês",    icon: Wallet        },
  { href: "/contas-pagar",   label: "Contas a pagar", subtitle: "Fornecedores e despesas",     icon: ArrowDownLeft },
  { href: "/relatorios",     label: "Relatórios",     subtitle: "Desempenho e análises",       icon: BarChart3     },
  { href: "/calculadoras",   label: "Calculadoras",   subtitle: "Ferramentas de cálculo",      icon: Calculator    },
];

export const NAV_ALL = [...NAV_MAIN, ...NAV_FIN];

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group flex h-10 items-center gap-3 rounded-full px-3.5 text-sm font-medium transition-all ${
        active
          ? "bg-strawberry text-white shadow-sm shadow-strawberry/25"
          : "text-muted hover:bg-[#ececee] hover:text-ink"
      }`}
    >
      <Icon
        className={`size-4.5 shrink-0 ${active ? "text-white" : "text-muted group-hover:text-ink"}`}
        strokeWidth={1.75}
      />
      {item.label}
    </Link>
  );
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-(--sidebar-w) shrink-0 flex-col bg-[#f8f8f9] lg:flex">
      <div className="flex h-full flex-col">
        <div className="px-5 pb-3 pt-6">
          <BiskyLogo className="h-10" href="/dashboard" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {NAV_MAIN.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
            {NAV_FIN.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
