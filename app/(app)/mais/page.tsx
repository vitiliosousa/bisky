"use client";

import {
  ArrowDownLeft,
  BarChart3,
  Box,
  Cake,
  ChevronRight,
  LogOut,
  Package,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

const SECOES = [
  {
    titulo: "Negócio",
    items: [
      {
        href: "/clientes",
        icon: Users,
        label: "Clientes",
        subtitle: "Quem compra mais",
        color: "bg-blueberry-soft text-blueberry",
      },
      {
        href: "/produtos",
        icon: Cake,
        label: "Produtos",
        subtitle: "Bolos, doces e encomendas",
        color: "bg-strawberry-soft text-strawberry",
      },
      {
        href: "/estoque",
        icon: Package,
        label: "Ingredientes",
        subtitle: "Ingredientes e quantidades",
        color: "bg-blueberry-soft text-blueberry",
      },
      {
        href: "/materiais",
        icon: Box,
        label: "Materiais",
        subtitle: "Caixas, fitas e outros",
        color: "bg-blueberry-soft text-blueberry",
      },
      {
        href: "/perdas",
        icon: Trash2,
        label: "Perdas",
        subtitle: "Desperdícios e baixas",
        color: "bg-strawberry-soft text-strawberry",
      },
    ],
  },
  {
    titulo: "Finanças",
    items: [
      {
        href: "/caixa",
        icon: Wallet,
        label: "Fluxo de caixa",
        subtitle: "Entradas e saídas",
        color: "bg-mint-soft text-mint",
      },
      {
        href: "/contas-pagar",
        icon: ArrowDownLeft,
        label: "Contas a pagar",
        subtitle: "Fornecedores e despesas",
        color: "bg-caramel-soft text-caramel",
      },
      {
        href: "/relatorios",
        icon: BarChart3,
        label: "Relatórios",
        subtitle: "Desempenho e análises",
        color: "bg-blueberry-soft text-blueberry",
      },
    ],
  },
];

export default function MaisPage() {
  const router = useRouter();

  function sair() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="animate-in space-y-6">
      {SECOES.map((secao) => (
        <section key={secao.titulo}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {secao.titulo}
          </h2>
          <ul className="overflow-hidden rounded-(--radius-card) bg-white shadow-(--shadow-card)">
            {secao.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-[#f4f5f7] ${
                      i > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${item.color}`}
                    >
                      <Icon className="size-4.5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {item.label}
                      </span>
                      <span className="block text-xs text-muted">
                        {item.subtitle}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Conta
        </h2>
        <ul className="overflow-hidden rounded-(--radius-card) bg-white shadow-(--shadow-card)">
          <li>
            <Link
              href="/perfil"
              className="flex items-center gap-3 px-4 py-3.5 transition active:bg-[#f4f5f7]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4f5f7] text-muted">
                <UserRound className="size-4.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  Perfil
                </span>
                <span className="block text-xs text-muted">
                  Os seus dados e contactos
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted"
                strokeWidth={1.75}
              />
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5 text-left transition active:bg-strawberry-soft"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-strawberry-soft text-strawberry">
                <LogOut className="size-4.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-strawberry">
                  Sair
                </span>
                <span className="block text-xs text-muted">
                  Encerrar a sessão
                </span>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
