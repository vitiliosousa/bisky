"use client";

import { ChevronRight, Calculator, Scale, TrendingUp, Target } from "lucide-react";
import Link from "next/link";

const CALCULADORAS = [
  {
    href: "/calculadoras/custo-por-unidade",
    icon: Calculator,
    color: "bg-strawberry-soft text-strawberry",
    nome: "Custo por unidade",
    descricao:
      "Sabes que a receita rende X donuts, mas qual é o custo de 1? Insere os ingredientes, a quantidade produzida e descobre o custo unitário.",
  },
  {
    href: "/calculadoras/escalar-receita",
    icon: Scale,
    color: "bg-blueberry-soft text-blueberry",
    nome: "Escalar receita",
    descricao:
      "A receita é para 12 unidades mas precisas de 40? Descobre quanto de cada ingrediente precisas para qualquer quantidade.",
  },
  {
    href: "/calculadoras/preco-de-venda",
    icon: TrendingUp,
    color: "bg-mint-soft text-mint",
    nome: "Preço de venda",
    descricao:
      "Com base no custo do produto, calcula o preço de venda ideal para atingir a margem de lucro que queres.",
  },
  {
    href: "/calculadoras/ponto-de-equilibrio",
    icon: Target,
    color: "bg-caramel-soft text-caramel",
    nome: "Ponto de equilíbrio",
    descricao:
      "Quantas unidades precisas de vender por mês para cobrir os custos fixos e não ter prejuízo?",
  },
];

export default function CalculadorasPage() {
  return (
    <div className="animate-in space-y-4 sm:space-y-5">
     

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {CALCULADORAS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="card group flex items-start gap-4 transition hover:shadow-md"
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${c.color}`}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink group-hover:text-strawberry">
                  {c.nome}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {c.descricao}
                </p>
              </div>
              <ChevronRight
                className="mt-0.5 size-4 shrink-0 text-muted transition group-hover:text-strawberry"
                strokeWidth={1.75}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
