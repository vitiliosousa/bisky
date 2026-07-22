"use client";

import { confirmDelete, toast } from "@/components/ui";
import { consumoDoPedido, formatQty } from "@/lib/cost";
import { HOJE, dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  ArrowLeft,
  Box,
  Check,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function PedidosContent() {
  const searchParams = useSearchParams();
  const {
    pedidos,
    clientes,
    produtos,
    ingredientes,
    materiais,
    upsertPedido,
    upsertMovimento,
    consumirPedido,
    removePedido,
  } = useStore();

  const [sel, setSel] = useState(pedidos[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [busca, setBusca] = useState("");
  const [consumoMsg, setConsumoMsg] = useState("");
  const [pagamentoValor, setPagamentoValor] = useState("");
  const [filtroFalta, setFiltroFalta] = useState(
    searchParams.get("falta") === "1",
  );

  const pedidosFiltrados = [...pedidos]
    .filter((p) => {
      if (p.estado === "cancelado") return false;
      if (filtroFalta && p.valor - p.pago <= 0) return false;
      const cliente = clientes.find((c) => c.id === p.clienteId);
      return !busca || cliente?.nome.toLowerCase().includes(busca.toLowerCase());
    })
    .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));

  const pedido =
    pedidos.find((p) => p.id === sel && p.estado !== "cancelado") ??
    pedidosFiltrados[0];
  const cliente = clientes.find((c) => c.id === pedido?.clienteId);
  const consumo = pedido ? consumoDoPedido(pedido, produtos, ingredientes) : [];

  const consumoMateriais = pedido
    ? Object.values(
        pedido.itens.reduce<Record<string, { materialId: string; nome: string; quantidade: number; unidade: string }>>((acc, item) => {
          const prod = produtos.find((p) => p.id === item.produtoId);
          for (const m of prod?.materiaisNecessarios ?? []) {
            const mat = materiais.find((x) => x.id === m.materialId);
            if (!mat) continue;
            if (acc[m.materialId]) {
              acc[m.materialId].quantidade += m.quantidade * item.quantidade;
            } else {
              acc[m.materialId] = {
                materialId: m.materialId,
                nome: mat.nome,
                quantidade: m.quantidade * item.quantidade,
                unidade: mat.unidade,
              };
            }
          }
          return acc;
        }, {}),
      )
    : [];

  function selectPedido(id: string) {
    setSel(id);
    setConsumoMsg("");
    setPagamentoValor("");
    setMobileDetail(true);
  }

  const lista = (
    <div className="flex flex-col gap-3">
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
        <button
          type="button"
          onClick={() => setFiltroFalta(!filtroFalta)}
          className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition ${
            filtroFalta
              ? "bg-strawberry text-white shadow-sm shadow-strawberry/30"
              : "bg-[#f4f5f7] text-ink-soft hover:bg-line"
          }`}
        >
          A receber
        </button>
        <Link
          href="/pedidos/novo"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-end rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:self-auto sm:px-5"
        >
          <Plus className="size-4" strokeWidth={2.25} />
          <span className="hidden sm:inline">Novo pedido</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="card">
          <p className="py-10 text-center text-sm text-muted">
            Nenhum pedido encontrado.
          </p>
        </div>
      ) : (
        <div className="card p-2!">
          <ul className="space-y-0.5">
            {pedidosFiltrados.map((p) => {
              const c = clientes.find((x) => x.id === p.clienteId);
              const falta = p.valor - p.pago;
              const isHoje = p.dataEntrega === HOJE;
              const isActive = pedido?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectPedido(p.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${
                      isActive ? "bg-strawberry-soft" : "hover:bg-[#f8f8f9]"
                    }`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blueberry text-xs font-bold text-white">
                      {initials(c?.nome ?? "?")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          isActive
                            ? "text-strawberry"
                            : "text-ink group-hover:text-strawberry"
                        }`}
                      >
                        {c?.nome ?? "—"}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {p.itens
                          .map((i) => {
                            const pr = produtos.find((x) => x.id === i.produtoId);
                            return `${i.quantidade}× ${pr?.nome ?? "?"}`;
                          })
                          .join(", ")}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {isHoje && (
                        <span className="rounded-full bg-caramel-soft px-2 py-0.5 text-[0.65rem] font-bold text-caramel">
                          Hoje
                        </span>
                      )}
                      <span className="text-xs font-semibold text-ink">
                        {mzn(p.valor)}
                      </span>
                      {falta > 0 && (
                        <span className="text-[0.65rem] font-semibold text-strawberry">
                          falta {mzn(falta)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const detalhe = pedido && (
    <div className="flex flex-col gap-5">
      {/* ── Ações ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMobileDetail(false)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink lg:hidden"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Pedidos
        </button>
        <div className="flex items-center gap-2 lg:ml-auto">
          <Link
            href={`/pedidos/${pedido.id}/editar`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f4f5f7] px-3.5 text-sm font-semibold text-ink-soft transition hover:bg-line"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
            Editar
          </Link>
          <button
            type="button"
            onClick={() => {
              if (!confirmDelete(cliente?.nome ?? pedido.id)) return;
              removePedido(pedido.id);
              setSel(
                pedidos.find(
                  (p) => p.id !== pedido.id && p.estado !== "cancelado",
                )?.id ?? "",
              );
              setMobileDetail(false);
              toast("Pedido apagado.", "info");
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-strawberry-soft px-3.5 text-sm font-semibold text-strawberry transition hover:brightness-95"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
            Apagar
          </button>
        </div>
      </div>

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blueberry text-sm font-bold text-white">
          {initials(cliente?.nome ?? "?")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">
            {cliente?.nome ?? "—"}
          </p>
          <p className="text-xs text-muted">
            {dataCurta(pedido.dataEntrega)} · {pedido.hora}
          </p>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor</p>
          <p className="mt-0.5 text-base font-semibold text-ink">
            {mzn(pedido.valor)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-mint">Pago</p>
          <p className="mt-0.5 text-base font-semibold text-mint">
            {mzn(pedido.pago)}
          </p>
        </div>
        <div className="card">
          <p
            className={`text-[0.7rem] font-medium ${
              pedido.valor - pedido.pago > 0 ? "text-strawberry" : "text-muted"
            }`}
          >
            Falta
          </p>
          <p
            className={`mt-0.5 text-base font-semibold ${
              pedido.valor - pedido.pago > 0 ? "text-strawberry" : "text-ink"
            }`}
          >
            {mzn(Math.max(0, pedido.valor - pedido.pago))}
          </p>
        </div>
      </div>

      {/* ── Registar pagamento ─────────────────────────────── */}
      {pedido.valor - pedido.pago > 0 && (
        <div className="card">
          <p className="mb-2.5 text-sm font-semibold text-ink">Registar pagamento</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Máx. ${mzn(pedido.valor - pedido.pago)}`}
              value={pagamentoValor}
              onChange={(e) => setPagamentoValor(e.target.value)}
              className="field min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const val = Number(pagamentoValor);
                if (!val || val <= 0) return;
                upsertPedido({
                  ...pedido,
                  pago: Math.min(pedido.valor, pedido.pago + val),
                });
                upsertMovimento({
                  tipo: "entrada",
                  descricao: `Pagamento — ${cliente?.nome ?? "cliente"}`,
                  valor: val,
                  data: HOJE,
                  categoria: "Pedidos",
                });
                setPagamentoValor("");
                toast("Pagamento registado.", "success");
              }}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Check className="size-4" strokeWidth={2} />
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* ── Produtos ───────────────────────────────────────── */}
      <div className="card">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">Produtos</h2>
          <p className="text-xs text-muted">Itens deste pedido</p>
        </div>
        <ul className="space-y-1.5">
          {pedido.itens.map((i) => {
            const pr = produtos.find((p) => p.id === i.produtoId);
            return (
              <li key={i.produtoId} className="flex items-center gap-2.5 text-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7]">
                  <Package className="size-3.5 text-muted" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink">
                  {pr?.nome ?? "?"}
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  ×{i.quantidade}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Consumo de ingredientes + materiais ───────────── */}
      {(consumo.length > 0 || consumoMateriais.length > 0) && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Consumo do pedido</h2>
            <p className="text-xs text-muted">Ingredientes e materiais que saem com este pedido</p>
          </div>

          {consumo.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Ingredientes</p>
              <ul className="space-y-1">
                {consumo.map((c) => (
                  <li key={c.ingredienteId} className="flex items-center gap-2 text-xs text-mint">
                    <Package className="size-3 shrink-0" strokeWidth={1.75} />
                    − {formatQty(c.quantidade, c.unidade)} {c.nome.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consumoMateriais.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Materiais</p>
              <ul className="space-y-1">
                {consumoMateriais.map((m) => (
                  <li key={m.materialId} className="flex items-center gap-2 text-xs text-blueberry">
                    <Box className="size-3 shrink-0" strokeWidth={1.75} />
                    − {m.quantidade % 1 === 0 ? m.quantidade : m.quantidade.toFixed(2)} {m.unidade} {m.nome.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pedido.estoqueConsumido ? (
            <p className="flex items-center justify-center gap-1.5 rounded-full bg-mint-soft py-2 text-sm font-semibold text-mint">
              <Check className="size-4" strokeWidth={2} />
              Aplicado ao estoque e materiais
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConsumoMsg(consumirPedido(pedido.id).msg)}
                className="w-full rounded-full bg-mint py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Aplicar ao estoque e materiais
              </button>
              {consumoMsg && (
                <p className="text-xs text-mint" role="status">
                  {consumoMsg}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in">
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:h-[calc(100dvh-8rem)] lg:overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">{lista}</div>
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">
          {detalhe ?? (
            <div className="card flex items-center justify-center py-16 text-sm text-muted">
              Selecione um pedido para ver os detalhes.
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        {mobileDetail && pedido ? detalhe : lista}
      </div>
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
