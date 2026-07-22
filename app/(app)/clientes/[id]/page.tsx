"use client";

import { confirmDelete, toast } from "@/components/ui";
import { dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Phone,
  Trash2,
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
  const { clientes, pedidos, produtos, gastoExtra, removeCliente } = useStore();

  const cliente = clientes.find((c) => c.id === params.id);

  const historico = useMemo(() => {
    if (!cliente) return [];
    return pedidos
      .filter((p) => p.clienteId === cliente.id)
      .sort((a, b) => b.dataEntrega.localeCompare(a.dataEntrega));
  }, [cliente, pedidos]);

  const stats = useMemo(() => {
    if (!cliente) return { totalPedidos: 0, totalGasto: 0, aReceber: 0 };
    const ativos = historico.filter((p) => p.estado !== "cancelado");
    const extra = gastoExtra[cliente.id] ?? { pedidos: 0, gasto: 0 };
    return {
      totalPedidos: extra.pedidos + ativos.length,
      totalGasto: extra.gasto + ativos.reduce((s, p) => s + p.valor, 0),
      aReceber: ativos.reduce((s, p) => s + Math.max(0, p.valor - p.pago), 0),
    };
  }, [cliente, historico, gastoExtra]);

  if (!cliente) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Voltar aos clientes
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Cliente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  async function apagar() {
    if (!confirmDelete(cliente!.nome)) return;
    try {
      await removeCliente(cliente!.id);
      toast("Cliente apagado.", "info");
      router.push("/clientes");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-5">
      {/* ── Topo: voltar + ações ───────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Clientes
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/clientes/${cliente.id}/editar`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f4f5f7] px-3.5 text-sm font-semibold text-ink-soft transition hover:bg-line sm:h-10 sm:gap-2 sm:px-4"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
            Editar
          </Link>
          <button
            type="button"
            onClick={apagar}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-strawberry-soft px-3.5 text-sm font-semibold text-strawberry transition hover:brightness-95 sm:h-10 sm:gap-2 sm:px-4"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
            Apagar
          </button>
        </div>
      </div>

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className="card flex items-center gap-3 sm:items-start sm:gap-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white sm:size-16 sm:text-base">
          {initials(cliente.nome)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink sm:text-3xl sm:whitespace-normal">
            {cliente.nome}
          </h1>
          <div className="mt-1 flex flex-col gap-1 text-xs text-muted sm:mt-2 sm:gap-1.5 sm:text-sm">
            {cliente.telefone && (
              <a
                href={`tel:${cliente.telefone}`}
                className="inline-flex items-center gap-1.5 transition hover:text-strawberry"
              >
                <Phone className="size-3.5 shrink-0" strokeWidth={1.75} />
                {cliente.telefone}
              </a>
            )}
            {cliente.endereco && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{cliente.endereco}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Total de pedidos
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {stats.totalPedidos}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Total gasto
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {mzn(stats.totalGasto)}
          </p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            A receber
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
            {mzn(stats.aReceber)}
          </p>
        </div>
      </div>

      {/* ── Histórico ──────────────────────────────────────── */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-ink">Histórico de pedidos</h2>
          <p className="text-xs text-muted">Encomendas deste cliente</p>
        </div>

        {historico.length === 0 ? (
          <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
            Ainda sem pedidos registados.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {historico.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2.5 py-3.5 first:pt-0 last:pb-0 sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.itens
                      .map((i) => {
                        const pr = produtos.find((x) => x.id === i.produtoId);
                        return `${i.quantidade}× ${pr?.nome ?? "?"}`;
                      })
                      .join(", ")}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    Entrega {dataCurta(p.dataEntrega)}
                    {p.hora ? ` · ${p.hora}` : ""}
                    {p.pago < p.valor
                      ? ` · falta ${mzn(p.valor - p.pago)}`
                      : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-ink">
                    {mzn(p.valor)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
