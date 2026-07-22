"use client";

import Link from "next/link";
import { Users, Cake, Package, CalendarDays, Box, Trash2, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    href: "/clientes",
    icon: Users,
    label: "Clientes",
    subtitle: "Quem compra mais",
    color: "bg-blueberry text-white",
  },
  {
    href: "/produtos",
    icon: Cake,
    label: "Produtos",
    subtitle: "Bolos, doces e encomendas",
    color: "bg-strawberry text-white",
  },
  {
    href: "/estoque",
    icon: Package,
    label: "Estoque",
    subtitle: "Ingredientes e quantidades",
    color: "bg-caramel text-white",
  },
  {
    href: "/calendario",
    icon: CalendarDays,
    label: "Calendário",
    subtitle: "Entregas e prazos",
    color: "bg-mint text-white",
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
];

export default function NegocioPage() {
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
