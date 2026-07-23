"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { usePagination } from "@/lib/usePagination";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function CaixaPage() {
  const { movimentos } = useStore();
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<"todos" | "entrada" | "saida">("todos");

  const entradas = movimentos
    .filter((m) => m.tipo === "entrada")
    .reduce((s, m) => s + m.valor, 0);
  const saidas = movimentos
    .filter((m) => m.tipo === "saida")
    .reduce((s, m) => s + m.valor, 0);
  const lucro = entradas - saidas;

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return [...movimentos]
      .filter((m) => {
        if (tipo !== "todos" && m.tipo !== tipo) return false;
        if (!q) return true;
        return (
          m.descricao.toLowerCase().includes(q) ||
          m.categoria.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [movimentos, busca, tipo]);

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  return (
    <div className="animate-in space-y-4">
      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Receita</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint sm:size-10">
              <ArrowUpRight className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-mint sm:mt-3 sm:text-3xl">
            {mzn(entradas)}
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
            {mzn(saidas)}
          </p>
        </div>
        <div className="card col-span-2 flex flex-col justify-between !p-3.5 sm:col-span-1 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Lucro</p>
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10 ${lucro >= 0 ? "bg-mint-soft text-mint" : "bg-strawberry-soft text-strawberry"}`}>
              <Wallet className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className={`mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl ${lucro >= 0 ? "text-ink" : "text-strawberry"}`}>
            {mzn(lucro)}
          </p>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="search-pill w-full min-w-0 sm:flex-1"
          style={{ maxWidth: "none" }}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar movimento…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar por tipo"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>

          <Link
            href="/caixa/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo movimento</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* ── Lista ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={busca || tipo !== "todos" ? "Nenhum movimento encontrado." : "Sem movimentos ainda."}
            hint={busca || tipo !== "todos" ? undefined : "Registe o primeiro movimento de caixa."}
          />
        </div>
      ) : (
        <>
          <div className="card p-2!">
            <ul className="divide-y divide-line">
              {pageItems.map((m) => {
                const isEntrada = m.tipo === "entrada";
                return (
                  <li key={m.id}>
                    <Link
                      href={`/caixa/${m.id}`}
                      className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 ${
                          isEntrada
                            ? "bg-mint-soft text-mint"
                            : "bg-caramel-soft text-caramel"
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpRight className="size-4.5" strokeWidth={2} />
                        ) : (
                          <ArrowDownLeft className="size-4.5" strokeWidth={2} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                          {m.descricao}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {dataCurta(m.data)} · {m.categoria}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          isEntrada ? "text-mint" : "text-caramel"
                        }`}
                      >
                        {isEntrada ? "+" : "−"}
                        {mzn(m.valor)}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-muted transition group-hover:text-strawberry"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
