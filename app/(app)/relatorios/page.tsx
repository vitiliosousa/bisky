"use client";

import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight, Receipt, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function RelatoriosPage() {
  const { pedidos, produtos, clientes, ingredientes, movimentos } = useStore();

  const stats = useMemo(() => {
    const vendidos = new Map<string, number>();
    const gastoCliente = new Map<string, number>();
    const usoIng = new Map<string, number>();

    const ativos = pedidos.filter((p) => p.estado !== "cancelado");

    for (const p of ativos) {
      gastoCliente.set(p.clienteId, (gastoCliente.get(p.clienteId) ?? 0) + p.valor);
      for (const item of p.itens) {
        vendidos.set(item.produtoId, (vendidos.get(item.produtoId) ?? 0) + item.quantidade);
        const pr = produtos.find((x) => x.id === item.produtoId);
        if (!pr) continue;
        for (const r of pr.receita) {
          usoIng.set(r.ingredienteId, (usoIng.get(r.ingredienteId) ?? 0) + r.quantidade * item.quantidade);
        }
      }
    }

    const topProdutos = [...vendidos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topClientes = [...gastoCliente.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topIng = [...usoIng.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const receita = movimentos.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
    const despesas = movimentos.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
    const ticketMedio = ativos.length > 0 ? ativos.reduce((s, p) => s + p.valor, 0) / ativos.length : 0;

    return { topProdutos, topClientes, topIng, receita, despesas, lucro: receita - despesas, ticketMedio };
  }, [pedidos, produtos, movimentos]);

  return (
    <div className="animate-in space-y-4">
      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Receita total</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint sm:size-10">
              <ArrowUpRight className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-mint sm:mt-3 sm:text-3xl">
            {mzn(stats.receita)}
          </p>
        </div>
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Despesas</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-caramel sm:size-10">
              <ArrowDownLeft className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-caramel sm:mt-3 sm:text-3xl">
            {mzn(stats.despesas)}
          </p>
        </div>
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Lucro</p>
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10 ${stats.lucro >= 0 ? "bg-mint-soft text-mint" : "bg-strawberry-soft text-strawberry"}`}>
              <TrendingUp className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className={`mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl ${stats.lucro >= 0 ? "text-ink" : "text-strawberry"}`}>
            {mzn(stats.lucro)}
          </p>
        </div>
        <div className="card col-span-2 flex flex-col justify-between !p-3.5 sm:col-span-1 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Ticket médio</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blueberry-soft text-blueberry sm:size-10">
              <Receipt className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-blueberry sm:mt-3 sm:text-3xl">
            {mzn(Math.round(stats.ticketMedio))}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Produtos mais vendidos ───────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Produtos mais vendidos</h2>
            <p className="text-xs text-muted">Por quantidade de unidades</p>
          </div>
          {stats.topProdutos.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Sem dados ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topProdutos.map(([id, qty], i) => {
                const pr = produtos.find((p) => p.id === id);
                const pct = Math.round((qty / stats.topProdutos[0][1]) * 100);
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-xs font-bold text-strawberry">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{pr?.nome ?? "—"}</p>
                        <p className="shrink-0 text-xs text-muted">{qty} un.</p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f4f5f7]">
                        <div className="h-full rounded-full bg-strawberry" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Melhores clientes ────────────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Melhores clientes</h2>
            <p className="text-xs text-muted">Por valor total gasto</p>
          </div>
          {stats.topClientes.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Sem dados ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topClientes.map(([id, total], i) => {
                const c = clientes.find((x) => x.id === id);
                const pct = Math.round((total / stats.topClientes[0][1]) * 100);
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blueberry-soft text-xs font-bold text-blueberry">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{c?.nome ?? "—"}</p>
                        <p className="shrink-0 text-xs text-muted">{mzn(total)}</p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f4f5f7]">
                        <div className="h-full rounded-full bg-blueberry" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Ingredientes mais usados ─────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Ingredientes mais usados</h2>
            <p className="text-xs text-muted">Consumo estimado pelas receitas</p>
          </div>
          {stats.topIng.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Sem dados ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topIng.map(([id, qty], i) => {
                const ing = ingredientes.find((x) => x.id === id);
                const pct = Math.round((qty / stats.topIng[0][1]) * 100);
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-xs font-bold text-caramel">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{ing?.nome ?? "—"}</p>
                        <p className="shrink-0 text-xs text-muted">
                          ~{Math.round(qty * 10) / 10} {ing?.unidade}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f4f5f7]">
                        <div className="h-full rounded-full bg-caramel" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Desempenho financeiro ────────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Desempenho financeiro</h2>
            <p className="text-xs text-muted">Receita vs. despesas acumuladas</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted">Receita</span>
                <span className="text-sm font-semibold text-mint">{mzn(stats.receita)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#f4f5f7]">
                <div className="h-full rounded-full bg-mint" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted">Despesas</span>
                <span className="text-sm font-semibold text-caramel">{mzn(stats.despesas)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#f4f5f7]">
                <div
                  className="h-full rounded-full bg-caramel"
                  style={{
                    width: `${
                      stats.receita > 0
                        ? Math.min(100, (stats.despesas / stats.receita) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div
              className={`flex items-center justify-between rounded-2xl p-4 ${
                stats.lucro >= 0 ? "bg-mint-soft" : "bg-strawberry-soft"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  stats.lucro >= 0 ? "text-mint" : "text-strawberry"
                }`}
              >
                Lucro
              </span>
              <span
                className={`text-xl font-semibold tracking-tight ${
                  stats.lucro >= 0 ? "text-mint" : "text-strawberry"
                }`}
              >
                {mzn(stats.lucro)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
