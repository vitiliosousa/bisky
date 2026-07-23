"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { dataCurta, hoje, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { usePagination } from "@/lib/usePagination";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filtro = "todas" | "abertas" | "atrasadas" | "pagas";

export default function ContasPagarPage() {
  const { contasPagar } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const hojeISO = hoje();
  const abertas = contasPagar.filter((c) => !c.paga);
  const atrasadas = abertas.filter((c) => c.vencimento < hojeISO);
  const totalAberto = abertas.reduce((s, c) => s + c.valor, 0);
  const totalAtrasado = atrasadas.reduce((s, c) => s + c.valor, 0);
  const totalPago = contasPagar
    .filter((c) => c.paga)
    .reduce((s, c) => s + c.valor, 0);

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return [...contasPagar]
      .filter((c) => {
        if (filtro === "abertas" && c.paga) return false;
        if (filtro === "atrasadas" && (c.paga || c.vencimento >= hojeISO))
          return false;
        if (filtro === "pagas" && !c.paga) return false;
        return (
          !q ||
          c.fornecedor.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aAtrasada = !a.paga && a.vencimento < hojeISO;
        const bAtrasada = !b.paga && b.vencimento < hojeISO;
        if (aAtrasada !== bAtrasada) return aAtrasada ? -1 : 1;
        if (a.paga !== b.paga) return a.paga ? 1 : -1;
        return a.vencimento.localeCompare(b.vencimento);
      });
  }, [contasPagar, busca, filtro, hojeISO]);

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  return (
    <div className="animate-in space-y-4">
      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Em aberto</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-caramel sm:size-10">
              <Clock className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-caramel sm:mt-3 sm:text-3xl">
            {mzn(totalAberto)}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted sm:text-xs">
            {abertas.length} conta{abertas.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Atrasadas</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry sm:size-10">
              <AlertTriangle
                className="size-4 sm:size-[1.125rem]"
                strokeWidth={1.75}
              />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-strawberry sm:mt-3 sm:text-3xl">
            {mzn(totalAtrasado)}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted sm:text-xs">
            {atrasadas.length} conta{atrasadas.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="card col-span-2 flex flex-col justify-between !p-3.5 sm:col-span-1 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Pagas</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint sm:size-10">
              <Wallet className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-mint sm:mt-3 sm:text-3xl">
            {mzn(totalPago)}
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
            placeholder="Pesquisar conta…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as Filtro)}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar contas"
          >
            <option value="todas">Todas</option>
            <option value="abertas">Em aberto</option>
            <option value="atrasadas">
              Atrasadas{atrasadas.length > 0 ? ` (${atrasadas.length})` : ""}
            </option>
            <option value="pagas">Pagas</option>
          </select>

          <Link
            href="/contas-pagar/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Nova conta</span>
            <span className="sm:hidden">Nova</span>
          </Link>
        </div>
      </div>

      {/* ── Lista ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={
              busca || filtro !== "todas"
                ? "Nenhuma conta encontrada."
                : "Sem contas a pagar ainda."
            }
            hint={
              busca || filtro !== "todas"
                ? undefined
                : "Adicione a sua primeira conta."
            }
          />
        </div>
      ) : (
        <>
          <div className="card p-2!">
            <ul className="divide-y divide-line">
              {pageItems.map((c) => {
                const atrasada = !c.paga && c.vencimento < hojeISO;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/contas-pagar/${c.id}`}
                      className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 ${
                          c.paga
                            ? "bg-mint-soft text-mint"
                            : atrasada
                              ? "bg-strawberry-soft text-strawberry"
                              : "bg-caramel-soft text-caramel"
                        }`}
                      >
                        {c.paga ? (
                          <Check className="size-4.5" strokeWidth={2} />
                        ) : atrasada ? (
                          <AlertTriangle className="size-4.5" strokeWidth={1.75} />
                        ) : (
                          <Clock className="size-4.5" strokeWidth={1.75} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                          {c.fornecedor}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          Vence {dataCurta(c.vencimento)}
                          {c.recorrente ? " · Mensal" : ""}
                          {c.descricao ? ` · ${c.descricao}` : ""}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        <span
                          className={`text-sm font-semibold ${
                            c.paga ? "text-muted line-through" : "text-ink"
                          }`}
                        >
                          {mzn(c.valor)}
                        </span>
                        <span
                          className={`text-[0.65rem] font-semibold ${
                            c.paga
                              ? "text-mint"
                              : atrasada
                                ? "text-strawberry"
                                : "text-caramel"
                          }`}
                        >
                          {c.paga ? "Paga" : atrasada ? "Atrasada" : "Em aberto"}
                        </span>
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
