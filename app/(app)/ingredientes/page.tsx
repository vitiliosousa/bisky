"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { custoUnitario, formatQty } from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Ingrediente } from "@/lib/types";
import { usePagination } from "@/lib/usePagination";
import {
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  List,
  Package,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function GridIngredientes({ items }: { items: Ingrediente[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
      {items.map((i) => {
        const baixo = i.quantidadeAtual < i.estoqueMinimo;
        const unitario = custoUnitario(i);
        return (
          <Link
            key={i.id}
            href={`/ingredientes/${i.id}`}
            className="card group flex flex-col gap-2.5 transition hover:shadow-md sm:gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full sm:size-11 ${
                  baixo
                    ? "bg-strawberry-soft text-strawberry"
                    : "bg-blueberry-soft text-blueberry"
                }`}
              >
                {baixo ? (
                  <AlertTriangle className="size-4 sm:size-5" strokeWidth={1.75} />
                ) : (
                  <Package className="size-4 sm:size-5" strokeWidth={1.75} />
                )}
              </span>
              <span className="truncate rounded-full bg-[#f4f5f7] px-2.5 py-1 text-[0.7rem] font-medium text-muted sm:px-3 sm:text-xs">
                {i.unidade}
              </span>
            </div>

            <p
              className={`truncate text-sm font-semibold sm:text-base ${
                baixo
                  ? "text-strawberry"
                  : "text-ink group-hover:text-strawberry"
              }`}
            >
              {i.nome}
            </p>

            <div className="mt-auto flex items-end justify-between gap-1.5">
              <div className="min-w-0">
                <p
                  className={`truncate text-lg font-semibold tracking-tight sm:text-2xl ${
                    baixo ? "text-strawberry" : "text-ink"
                  }`}
                >
                  {formatQty(i.quantidadeAtual, i.unidade)}
                </p>
                <p className="mt-0.5 truncate text-[0.7rem] text-muted sm:text-xs">
                  mín. {formatQty(i.estoqueMinimo, i.unidade)}
                </p>
              </div>
              {unitario > 0 && (
                <span className="shrink-0 rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[0.65rem] font-semibold text-muted sm:text-xs">
                  {mzn(Math.round(unitario))}/{i.unidade}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ListaIngredientes({ items }: { items: Ingrediente[] }) {
  return (
    <div className="card p-2!">
      <ul className="divide-y divide-line">
        {items.map((i) => {
          const baixo = i.quantidadeAtual < i.estoqueMinimo;
          return (
            <li key={i.id}>
              <Link
                href={`/ingredientes/${i.id}`}
                className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                    baixo
                      ? "bg-strawberry-soft text-strawberry"
                      : "bg-blueberry-soft text-blueberry"
                  }`}
                >
                  {baixo ? (
                    <AlertTriangle className="size-5" strokeWidth={1.75} />
                  ) : (
                    <Package className="size-5" strokeWidth={1.75} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-semibold ${
                      baixo
                        ? "text-strawberry"
                        : "text-ink group-hover:text-strawberry"
                    }`}
                  >
                    {i.nome}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    mín. {formatQty(i.estoqueMinimo, i.unidade)}
                  </span>
                </span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span
                    className={`text-sm font-semibold ${
                      baixo ? "text-strawberry" : "text-ink"
                    }`}
                  >
                    {formatQty(i.quantidadeAtual, i.unidade)}
                  </span>
                  <ChevronRight
                    className="size-4 text-muted transition group-hover:text-strawberry"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function IngredientesPage() {
  const { ingredientes } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "falta">("todos");
  const [view, setView] = useState<"grid" | "list">("grid");

  const falta = ingredientes.filter((i) => i.quantidadeAtual < i.estoqueMinimo);

  const filtered = useMemo(() => {
    return ingredientes
      .filter((i) => {
        const matchBusca =
          !busca || i.nome.toLowerCase().includes(busca.toLowerCase());
        const matchFiltro =
          filtro === "todos" || i.quantidadeAtual < i.estoqueMinimo;
        return matchBusca && matchFiltro;
      })
      .sort((a, b) => {
        const aFalta = a.quantidadeAtual < a.estoqueMinimo;
        const bFalta = b.quantidadeAtual < b.estoqueMinimo;
        if (aFalta !== bFalta) return aFalta ? -1 : 1;
        return a.nome.localeCompare(b.nome, "pt");
      });
  }, [ingredientes, busca, filtro]);

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  return (
    <div className="animate-in space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="search-pill w-full min-w-0 sm:flex-1"
          style={{ maxWidth: "none" }}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar ingrediente…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "todos" | "falta")}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar estoque"
          >
            <option value="todos">Todos</option>
            <option value="falta">
              Em falta{falta.length > 0 ? ` (${falta.length})` : ""}
            </option>
          </select>

          <div className="hidden h-10 shrink-0 items-center gap-0.5 rounded-full bg-[#f4f5f7] p-1 sm:flex">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`flex size-8 items-center justify-center rounded-full transition ${
                view === "grid" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
              aria-label="Vista em cartões"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex size-8 items-center justify-center rounded-full transition ${
                view === "list" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
              aria-label="Vista em lista"
              aria-pressed={view === "list"}
            >
              <List className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <Link
            href="/ingredientes/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={
              busca || filtro !== "todos"
                ? "Nenhum ingrediente encontrado."
                : "Sem ingredientes ainda."
            }
            hint={
              busca || filtro !== "todos"
                ? undefined
                : "Adicione o seu primeiro ingrediente."
            }
          />
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <GridIngredientes items={pageItems} />
          ) : (
            <>
              <div className="sm:hidden">
                <GridIngredientes items={pageItems} />
              </div>
              <div className="hidden sm:block">
                <ListaIngredientes items={pageItems} />
              </div>
            </>
          )}
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
