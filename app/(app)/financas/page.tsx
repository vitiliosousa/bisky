"use client";

import Link from "next/link";
import { Wallet, ArrowDownLeft, BarChart3, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    href: "/caixa",
    icon: Wallet,
    label: "Fluxo de caixa",
    subtitle: "Entradas e saídas do mês",
    color: "bg-mint text-white",
  },
  {
    href: "/contas-pagar",
    icon: ArrowDownLeft,
    label: "Contas a pagar",
    subtitle: "Fornecedores e despesas",
    color: "bg-caramel text-white",
  },
  {
    href: "/relatorios",
    icon: BarChart3,
    label: "Relatórios",
    subtitle: "Desempenho e análises",
    color: "bg-blueberry text-white",
  },
];

export default function FinancasPage() {
  return (
    <div className="animate-in space-y-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="card flex items-center gap-4 transition hover:ring-2 hover:ring-strawberry/20"
          >
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{item.label}</span>
              <span className="block text-xs text-muted">{item.subtitle}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
          </Link>
        );
      })}
    </div>
  );
}
