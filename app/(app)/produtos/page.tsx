"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { custoProduto, margemLucro } from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Ingrediente, Material, Produto } from "@/lib/types";
import { usePagination } from "@/lib/usePagination";
import {
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function MargemBadge({ margem }: { margem: number }) {
  if (margem >= 50)
    return (
      <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[0.7rem] font-semibold text-mint sm:px-2.5 sm:text-xs">
        {margem.toFixed(0)}%
      </span>
    );
  if (margem >= 20)
    return (
      <span className="rounded-full bg-caramel-soft px-2 py-0.5 text-[0.7rem] font-semibold text-caramel sm:px-2.5 sm:text-xs">
        {margem.toFixed(0)}%
      </span>
    );
  return (
    <span className="rounded-full bg-strawberry-soft px-2 py-0.5 text-[0.7rem] font-semibold text-strawberry sm:px-2.5 sm:text-xs">
      {margem.toFixed(0)}%
    </span>
  );
}

function GridProdutos({
  produtos,
  ingredientes,
  materiais,
}: {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  materiais: Material[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
      {produtos.map((p) => {
        const custo = custoProduto(p, ingredientes, materiais);
        const margem = margemLucro(p.preco, custo);
        return (
          <Link
            key={p.id}
            href={`/produtos/${p.id}`}
            className="card group flex flex-col gap-2.5 transition hover:shadow-md sm:gap-3"
          >
            {/* Ícone + badge de categoria */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry sm:size-11">
                <UtensilsCrossed className="size-4 sm:size-5" strokeWidth={1.75} />
              </span>
              <span className="truncate rounded-full bg-[#f4f5f7] px-2.5 py-1 text-[0.7rem] font-medium text-muted sm:px-3 sm:text-xs">
                {p.categoria}
              </span>
            </div>

            {/* Nome */}
            <p className="truncate text-sm font-semibold text-ink group-hover:text-strawberry sm:text-base">
              {p.nome}
            </p>

            {/* Preço + margem */}
            <div className="mt-auto flex items-end justify-between gap-1.5">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-ink sm:text-2xl">
                  {mzn(p.preco)}
                </p>
                <p className="mt-0.5 truncate text-[0.7rem] text-muted sm:text-xs">
                  custo ≈ {mzn(Math.round(custo))}
                </p>
              </div>
              <MargemBadge margem={margem} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ListaProdutos({
  produtos,
  ingredientes,
  materiais,
}: {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  materiais: Material[];
}) {
  return (
    <div className="card p-2!">
      <ul className="divide-y divide-line">
        {produtos.map((p) => {
          const custo = custoProduto(p, ingredientes, materiais);
          const margem = margemLucro(p.preco, custo);
          return (
            <li key={p.id}>
              <Link
                href={`/produtos/${p.id}`}
                className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                  <UtensilsCrossed className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                    {p.nome}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {p.categoria} · custo ≈ {mzn(Math.round(custo))}
                  </span>
                </span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <MargemBadge margem={margem} />
                  <span className="hidden text-sm font-semibold text-ink sm:block">
                    {mzn(p.preco)}
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

export default function ProdutosPage() {
  const { produtos, ingredientes, materiais } = useStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const categorias = [...new Set(produtos.map((p) => p.categoria))];

  const filtered = useMemo(
    () =>
      produtos.filter(
        (p) =>
          (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.categoria.toLowerCase().includes(busca.toLowerCase())) &&
          (!categoria || p.categoria === categoria),
      ),
    [produtos, busca, categoria],
  );

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  return (
    <div className="animate-in space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="search-pill w-full min-w-0 sm:flex-1"
          style={{ maxWidth: "none" }}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar produto…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={categoria ?? ""}
            onChange={(e) => setCategoria(e.target.value || null)}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Alternar vista — só em ecrãs maiores */}
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
            href="/produtos/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo produto</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* ── Produtos ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={busca || categoria ? "Nenhum produto encontrado." : "Sem produtos ainda."}
            hint={busca || categoria ? undefined : "Adicione o seu primeiro produto."}
          />
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <GridProdutos
              produtos={pageItems}
              ingredientes={ingredientes}
              materiais={materiais}
            />
          ) : (
            <>
              <div className="sm:hidden">
                <GridProdutos
                  produtos={pageItems}
                  ingredientes={ingredientes}
                  materiais={materiais}
                />
              </div>
              <div className="hidden sm:block">
                <ListaProdutos
                  produtos={pageItems}
                  ingredientes={ingredientes}
                  materiais={materiais}
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
