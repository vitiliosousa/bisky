"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/ui";
import { dataCurta, hoje, mzn, pedidoAberto } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { EstadoPedido } from "@/lib/types";
import { usePagination } from "@/lib/usePagination";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Filtro = "todos" | "hoje" | "a_receber" | "abertos" | "levados";

function PedidosContent() {
  const searchParams = useSearchParams();
  const { pedidos, clientes, produtos } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>(
    searchParams.get("falta") === "1" ? "a_receber" : "todos",
  );

  const hojeISO = hoje();
  const activos = pedidos.filter((p) => pedidoAberto(p.estado));
  const aReceber = pedidos
    .filter((p) => p.estado !== "cancelado" && p.pago < p.valor)
    .reduce((s, p) => s + (p.valor - p.pago), 0);
  const entregasHoje = pedidos.filter(
    (p) => pedidoAberto(p.estado) && p.dataEntrega === hojeISO,
  ).length;

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return [...pedidos]
      .filter((p) => {
        if (p.estado === "cancelado") return false;
        if (filtro === "hoje" && p.dataEntrega !== hojeISO) return false;
        if (filtro === "a_receber" && p.valor - p.pago <= 0) return false;
        if (filtro === "abertos" && !pedidoAberto(p.estado)) return false;
        if (filtro === "levados" && p.estado !== "entregue") return false;
        const cliente = clientes.find((c) => c.id === p.clienteId);
        return !q || (cliente?.nome.toLowerCase().includes(q) ?? false);
      })
      .sort((a, b) => {
        const aEntregue = a.estado === "entregue";
        const bEntregue = b.estado === "entregue";
        if (aEntregue !== bEntregue) return aEntregue ? 1 : -1;
        if (a.dataEntrega !== b.dataEntrega) {
          return a.dataEntrega.localeCompare(b.dataEntrega);
        }
        return (a.hora ?? "").localeCompare(b.hora ?? "");
      });
  }, [pedidos, clientes, busca, filtro, hojeISO]);

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  return (
    <div className="animate-in space-y-4">
      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Activos</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blueberry-soft text-blueberry sm:size-10">
              <ShoppingBag
                className="size-4 sm:size-[1.125rem]"
                strokeWidth={1.75}
              />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:mt-3 sm:text-3xl">
            {activos.length}
          </p>
        </div>
        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">A receber</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry sm:size-10">
              <Wallet className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-strawberry sm:mt-3 sm:text-3xl">
            {mzn(aReceber)}
          </p>
        </div>
        <div className="card col-span-2 flex flex-col justify-between !p-3.5 sm:col-span-1 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">Hoje</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-caramel sm:size-10">
              <CalendarDays
                className="size-4 sm:size-[1.125rem]"
                strokeWidth={1.75}
              />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-caramel sm:mt-3 sm:text-3xl">
            {entregasHoje}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted sm:text-xs">
            {entregasHoje === 1 ? "entrega" : "entregas"}
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
            placeholder="Pesquisar cliente…"
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
            aria-label="Filtrar pedidos"
          >
            <option value="todos">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="a_receber">A receber</option>
            <option value="abertos">Abertos</option>
            <option value="levados">Levados</option>
          </select>

          <Link
            href="/pedidos/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo pedido</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* ── Lista ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={
              busca || filtro !== "todos"
                ? "Nenhum pedido encontrado."
                : "Sem pedidos ainda."
            }
            hint={
              busca || filtro !== "todos"
                ? undefined
                : "Crie o seu primeiro pedido."
            }
          />
        </div>
      ) : (
        <>
          <div className="card p-2!">
            <ul className="divide-y divide-line">
              {pageItems.map((p) => {
                const c = clientes.find((x) => x.id === p.clienteId);
                const falta = p.valor - p.pago;
                const isHoje = p.dataEntrega === hojeISO;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/pedidos/${p.id}`}
                      className="group flex items-center gap-3 px-3 py-3.5 sm:gap-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blueberry text-xs font-bold text-white sm:size-11">
                        {initials(c?.nome ?? "?")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-semibold ${
                            p.estado === "entregue"
                              ? "text-muted"
                              : "text-ink group-hover:text-strawberry"
                          }`}
                        >
                          {c?.nome ?? "—"}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <StatusBadge estado={p.estado as EstadoPedido} />
                          <span className="truncate text-xs text-muted">
                            {dataCurta(p.dataEntrega)}
                            {p.hora ? ` · ${p.hora}` : ""}
                            {" · "}
                            {p.itens
                              .map((i) => {
                                const pr = produtos.find(
                                  (x) => x.id === i.produtoId,
                                );
                                return `${i.quantidade}× ${pr?.nome ?? "?"}`;
                              })
                              .join(", ")}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {isHoje && pedidoAberto(p.estado) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-caramel-soft px-2 py-0.5 text-[0.65rem] font-bold text-caramel">
                            <Clock3 className="size-3" strokeWidth={2} />
                            Hoje
                          </span>
                        )}
                        <span className="text-sm font-semibold text-ink">
                          {mzn(p.valor)}
                        </span>
                        {falta > 0 && (
                          <span className="text-[0.65rem] font-semibold text-strawberry">
                            falta {mzn(falta)}
                          </span>
                        )}
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

export default function PedidosPage() {
  return (
    <Suspense>
      <PedidosContent />
    </Suspense>
  );
}
