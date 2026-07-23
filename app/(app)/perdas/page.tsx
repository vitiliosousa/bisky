"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { formatQty } from "@/lib/cost";
import { dataCurta } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Ingrediente, Perda, Produto, Unidade } from "@/lib/types";
import { usePagination } from "@/lib/usePagination";
import {
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function nomePerda(
  p: Perda,
  ingredientes: { id: string; nome: string }[],
  produtos: { id: string; nome: string }[],
) {
  if (p.tipo === "produto") {
    return produtos.find((x) => x.id === p.produtoId)?.nome ?? "Produto removido";
  }
  return (
    ingredientes.find((x) => x.id === p.ingredienteId)?.nome ??
    "Ingrediente removido"
  );
}

function qtyLabel(
  p: Perda,
  ingredientes: Ingrediente[],
) {
  if (p.tipo === "produto") return `${p.quantidade} un`;
  const ing = ingredientes.find((x) => x.id === p.ingredienteId);
  return formatQty(p.quantidade, ing?.unidade as Unidade);
}

function GridPerdas({
  items,
  ingredientes,
  produtos,
}: {
  items: Perda[];
  ingredientes: Ingrediente[];
  produtos: Produto[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
      {items.map((p) => {
        const isProd = p.tipo === "produto";
        const n = nomePerda(p, ingredientes, produtos);
        return (
          <Link
            key={p.id}
            href={`/perdas/${p.id}`}
            className="card group flex flex-col gap-2.5 transition hover:shadow-md sm:gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry sm:size-11">
                {isProd ? (
                  <UtensilsCrossed className="size-4 sm:size-5" strokeWidth={1.75} />
                ) : (
                  <Trash2 className="size-4 sm:size-5" strokeWidth={1.75} />
                )}
              </span>
              <span className="truncate rounded-full bg-[#f4f5f7] px-2.5 py-1 text-[0.7rem] font-medium text-muted sm:px-3 sm:text-xs">
                {isProd ? "Produto" : "Ingrediente"}
              </span>
            </div>

            <p className="truncate text-sm font-semibold text-ink group-hover:text-strawberry sm:text-base">
              {n}
            </p>

            <div className="mt-auto min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
                {qtyLabel(p, ingredientes)}
              </p>
              <p className="mt-0.5 truncate text-[0.7rem] text-muted sm:text-xs">
                {p.motivo} · {dataCurta(p.data)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ListaPerdas({
  items,
  ingredientes,
  produtos,
}: {
  items: Perda[];
  ingredientes: Ingrediente[];
  produtos: Produto[];
}) {
  return (
    <div className="card p-2!">
      <ul className="divide-y divide-line">
        {items.map((p) => {
          const isProd = p.tipo === "produto";
          const n = nomePerda(p, ingredientes, produtos);
          return (
            <li key={p.id}>
              <Link
                href={`/perdas/${p.id}`}
                className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                  {isProd ? (
                    <UtensilsCrossed className="size-5" strokeWidth={1.75} />
                  ) : (
                    <Trash2 className="size-5" strokeWidth={1.75} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                    {n}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {isProd ? "Produto" : "Ingrediente"} · {p.motivo} ·{" "}
                    {dataCurta(p.data)}
                  </span>
                </span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-sm font-semibold text-strawberry">
                    {qtyLabel(p, ingredientes)}
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

export default function PerdasPage() {
  const { ingredientes, produtos, perdas } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "ingrediente" | "produto">(
    "todas",
  );
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return [...perdas]
      .filter((p) => {
        if (filtro !== "todas" && (p.tipo ?? "ingrediente") !== filtro) {
          return false;
        }
        if (!q) return true;
        const nome = nomePerda(p, ingredientes, produtos).toLowerCase();
        return nome.includes(q) || p.motivo.toLowerCase().includes(q);
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [perdas, ingredientes, produtos, busca, filtro]);

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
            placeholder="Pesquisar perda…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) =>
              setFiltro(e.target.value as "todas" | "ingrediente" | "produto")
            }
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar tipo"
          >
            <option value="todas">Todas</option>
            <option value="ingrediente">Ingredientes</option>
            <option value="produto">Produtos</option>
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
            href="/perdas/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Nova perda</span>
            <span className="sm:hidden">Nova</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={
              busca || filtro !== "todas"
                ? "Nenhuma perda encontrada."
                : "Sem perdas registadas."
            }
            hint={
              busca || filtro !== "todas"
                ? undefined
                : "Registe a primeira perda."
            }
          />
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <GridPerdas
              items={pageItems}
              ingredientes={ingredientes}
              produtos={produtos}
            />
          ) : (
            <>
              <div className="sm:hidden">
                <GridPerdas
                  items={pageItems}
                  ingredientes={ingredientes}
                  produtos={produtos}
                />
              </div>
              <div className="hidden sm:block">
                <ListaPerdas
                  items={pageItems}
                  ingredientes={ingredientes}
                  produtos={produtos}
                />
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
