"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, StatusBadge, toast } from "@/components/ui";
import { dataCurta, mzn, pedidoAberto } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { EstadoPedido } from "@/lib/types";
import {
  ChevronRight,
  MapPin,
  Phone,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ClienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { clientes, pedidos, produtos, removeCliente } = useStore();
  const { confirm, dialog } = useConfirmDelete();

  const cliente = clientes.find((c) => c.id === params.id);

  const pedidosCliente = useMemo(() => {
    if (!cliente) return [];
    return [...pedidos]
      .filter((p) => p.clienteId === cliente.id && p.estado !== "cancelado")
      .sort((a, b) => b.dataEntrega.localeCompare(a.dataEntrega));
  }, [pedidos, cliente]);

  if (!cliente) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Cliente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const totalPedidos = pedidosCliente.length;
  const totalGasto = pedidosCliente.reduce((s, p) => s + p.pago, 0);
  const aReceber = pedidosCliente.reduce(
    (s, p) => s + Math.max(0, p.valor - p.pago),
    0,
  );
  const abertos = pedidosCliente.filter((p) => pedidoAberto(p.estado)).length;

  async function apagar() {
    if (!await confirm(cliente!.nome)) return;
    try {
      await removeCliente(cliente!.id);
      toast("Cliente apagado.", "info");
      router.replace("/clientes");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/clientes/${cliente.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/clientes"
        backLabel="Clientes"
        editHref={editHref}
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-strawberry text-sm font-bold text-white">
          {initials(cliente.nome)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {cliente.nome}
          </p>
          <div className="mt-1 space-y-0.5">
            {cliente.telefone ? (
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Phone className="size-3 shrink-0" strokeWidth={1.75} />
                {cliente.telefone}
              </p>
            ) : null}
            {cliente.endereco ? (
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="size-3 shrink-0" strokeWidth={1.75} />
                {cliente.endereco}
              </p>
            ) : null}
            {!cliente.telefone && !cliente.endereco ? (
              <p className="text-xs text-muted">Sem contacto registado</p>
            ) : null}
          </div>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Pedidos</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {totalPedidos}
          </p>
          {abertos > 0 && (
            <p className="mt-0.5 text-[0.65rem] text-caramel">
              {abertos} aberto{abertos === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-mint">Pago</p>
          <p className="mt-0.5 text-base font-semibold text-mint sm:text-lg">
            {mzn(totalGasto)}
          </p>
        </div>
        <div className="card col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p
                className={`text-[0.7rem] font-medium ${
                  aReceber > 0 ? "text-strawberry" : "text-muted"
                }`}
              >
                A receber
              </p>
              <p
                className={`mt-0.5 text-base font-semibold sm:text-lg ${
                  aReceber > 0 ? "text-strawberry" : "text-ink"
                }`}
              >
                {mzn(aReceber)}
              </p>
            </div>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                aReceber > 0
                  ? "bg-strawberry-soft text-strawberry"
                  : "bg-[#f4f5f7] text-muted"
              }`}
            >
              {aReceber > 0 ? (
                <Wallet className="size-4" strokeWidth={1.75} />
              ) : (
                <ShoppingBag className="size-4" strokeWidth={1.75} />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-ink">Pedidos</h2>
            <p className="text-xs text-muted">Histórico deste cliente</p>
          </div>
          <Link
            href="/pedidos/novo"
            className="text-xs font-semibold text-strawberry transition hover:brightness-110"
          >
            Novo pedido
          </Link>
        </div>

        {pedidosCliente.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Ainda sem pedidos.
          </p>
        ) : (
          <ul className="-mx-1 divide-y divide-line">
            {pedidosCliente.map((p) => {
              const falta = p.valor - p.pago;
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="group flex items-center gap-3 px-1 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge estado={p.estado as EstadoPedido} />
                        <span className="text-xs text-muted">
                          {dataCurta(p.dataEntrega)}
                          {p.hora ? ` · ${p.hora}` : ""}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-ink group-hover:text-strawberry">
                        {p.itens
                          .map((i) => {
                            const pr = produtos.find((x) => x.id === i.produtoId);
                            return `${i.quantidade}× ${pr?.nome ?? "?"}`;
                          })
                          .join(", ")}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
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
        )}
      </div>
    </div>
  );
}
