"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, StatusBadge, toast } from "@/components/ui";
import { consumoDoPedido, formatQty } from "@/lib/cost";
import { dataCurta, hoje, mzn, pedidoAberto } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Box, Check, Loader2, Package, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PedidoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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

  const { confirm, dialog } = useConfirmDelete();
  const [consumoMsg, setConsumoMsg] = useState("");
  const [consumoLoading, setConsumoLoading] = useState(false);
  const [entregaLoading, setEntregaLoading] = useState(false);
  const [pagamentoValor, setPagamentoValor] = useState("");

  const pedido = pedidos.find((p) => p.id === params.id);

  if (!pedido || pedido.estado === "cancelado") {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Pedido não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const consumo = consumoDoPedido(pedido, produtos, ingredientes);
  const consumoMateriais = Object.values(
    pedido.itens.reduce<
      Record<
        string,
        { materialId: string; nome: string; quantidade: number; unidade: string }
      >
    >((acc, item) => {
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
  );

  async function apagar() {
    if (!await confirm(cliente?.nome ?? pedido!.id)) return;
    try {
      await removePedido(pedido!.id);
      toast("Pedido apagado.", "info");
      router.replace("/pedidos");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/pedidos/${pedido.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/pedidos"
        backLabel="Pedidos"
        editHref={editHref}
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blueberry text-sm font-bold text-white">
          {initials(cliente?.nome ?? "?")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {cliente?.nome ?? "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge estado={pedido.estado} />
            <p className="text-xs text-muted">
              {dataCurta(pedido.dataEntrega)} · {pedido.hora}
            </p>
          </div>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {mzn(pedido.valor)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-mint">Pago</p>
          <p className="mt-0.5 text-base font-semibold text-mint sm:text-lg">
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
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
              pedido.valor - pedido.pago > 0 ? "text-strawberry" : "text-ink"
            }`}
          >
            {mzn(Math.max(0, pedido.valor - pedido.pago))}
          </p>
        </div>
      </div>

      {(pedidoAberto(pedido.estado) || pedido.valor - pedido.pago > 0) && (
        <div className="card space-y-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Actualizar pedido</h2>
            <p className="text-xs text-muted">
              {pedidoAberto(pedido.estado)
                ? "Regista um pagamento ou marca que o cliente levou o produto"
                : "Ainda há valor em falta neste pedido"}
            </p>
          </div>

          {pedido.valor - pedido.pago > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Registar pagamento
              </p>
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
                  onClick={async () => {
                    const val = Number(pagamentoValor);
                    if (!val || val <= 0) return;
                    try {
                      await upsertPedido({
                        ...pedido,
                        pago: Math.min(pedido.valor, pedido.pago + val),
                      });
                      await upsertMovimento({
                        tipo: "entrada",
                        descricao: `Pagamento — ${cliente?.nome ?? "cliente"}`,
                        valor: val,
                        data: hoje(),
                        categoria: "Pedidos",
                      });
                      setPagamentoValor("");
                      toast("Pagamento registado.", "success");
                    } catch (err) {
                      toast(
                        err instanceof Error
                          ? err.message
                          : "Erro ao registar.",
                        "error",
                      );
                    }
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Check className="size-4" strokeWidth={2} />
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {pedidoAberto(pedido.estado) && (
            <button
              type="button"
              disabled={entregaLoading}
              onClick={async () => {
                setEntregaLoading(true);
                try {
                  await upsertPedido({
                    ...pedido,
                    estado: "entregue",
                  });
                  toast("Produto marcado como levado.", "success");
                } catch (err) {
                  toast(
                    err instanceof Error ? err.message : "Erro ao actualizar.",
                    "error",
                  );
                } finally {
                  setEntregaLoading(false);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blueberry py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {entregaLoading ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <Truck className="size-4" strokeWidth={1.75} />
              )}
              Produto levado
            </button>
          )}
        </div>
      )}

      {pedido.estado === "entregue" && pedido.valor - pedido.pago <= 0 && (
        <p className="flex items-center justify-center gap-1.5 rounded-full bg-[#f4f5f7] py-2.5 text-sm font-semibold text-muted">
          <Truck className="size-4" strokeWidth={1.75} />
          Cliente levou o produto
        </p>
      )}

      {pedido.estado === "entregue" && pedido.valor - pedido.pago > 0 && (
        <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
          <Truck className="size-3.5" strokeWidth={1.75} />
          Cliente já levou · falta pagar {mzn(pedido.valor - pedido.pago)}
        </p>
      )}

      <div className="card">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">Produtos</h2>
          <p className="text-xs text-muted">Itens deste pedido</p>
        </div>
        <ul className="space-y-1.5">
          {pedido.itens.map((i) => {
            const pr = produtos.find((p) => p.id === i.produtoId);
            return (
              <li
                key={`${i.produtoId}-${i.quantidade}`}
                className="flex items-center gap-2.5 text-sm"
              >
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

      {(consumo.length > 0 || consumoMateriais.length > 0) && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Insumos</h2>
            <p className="text-xs text-muted">
              Ingredientes e materiais deste pedido
            </p>
          </div>

          {consumo.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Ingredientes
              </p>
              <ul className="space-y-1">
                {consumo.map((c) => (
                  <li
                    key={c.ingredienteId}
                    className="flex items-center gap-2 text-xs text-mint"
                  >
                    <Package className="size-3 shrink-0" strokeWidth={1.75} />
                    − {formatQty(c.quantidade, c.unidade)} {c.nome.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consumoMateriais.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Materiais
              </p>
              <ul className="space-y-1">
                {consumoMateriais.map((m) => (
                  <li
                    key={m.materialId}
                    className="flex items-center gap-2 text-xs text-blueberry"
                  >
                    <Box className="size-3 shrink-0" strokeWidth={1.75} />
                    −{" "}
                    {m.quantidade % 1 === 0
                      ? m.quantidade
                      : m.quantidade.toFixed(2)}{" "}
                    {m.unidade} {m.nome.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pedido.estoqueConsumido ? (
            <p className="flex items-center justify-center gap-1.5 rounded-full bg-mint-soft py-2 text-sm font-semibold text-mint">
              <Check className="size-4" strokeWidth={2} />
              Já aplicado ao estoque
            </p>
          ) : (
            <>
              <button
                type="button"
                disabled={consumoLoading}
                onClick={async () => {
                  setConsumoLoading(true);
                  try {
                    const result = await consumirPedido(pedido.id);
                    setConsumoMsg(result.msg);
                    if (result.ok) {
                      await upsertPedido({
                        ...pedido,
                        estoqueConsumido: true,
                      });
                      toast("Estoque actualizado.", "success");
                    } else {
                      toast(result.msg || "Erro ao aplicar estoque.", "error");
                    }
                  } finally {
                    setConsumoLoading(false);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-mint py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {consumoLoading && (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                )}
                Aplicar ao estoque
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
}
