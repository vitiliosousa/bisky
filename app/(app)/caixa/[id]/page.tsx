"use client";

import { confirmDelete, toast } from "@/components/ui";
import { dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function MovimentoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { movimentos, removeMovimento } = useStore();

  const movimento = movimentos.find((m) => m.id === params.id);

  if (!movimento) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/caixa"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Voltar ao fluxo de caixa
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Movimento não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const isEntrada = movimento.tipo === "entrada";

  async function apagar() {
    if (!confirmDelete(movimento!.descricao)) return;
    try {
      await removeMovimento(movimento!.id);
      toast("Movimento apagado.", "info");
      router.push("/caixa");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-5">
      {/* ── Topo ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/caixa"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Fluxo de caixa
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/caixa/${movimento.id}/editar`}
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
      <div className="card flex items-center gap-3 sm:gap-5">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full sm:size-16 ${
            isEntrada ? "bg-mint-soft text-mint" : "bg-caramel-soft text-caramel"
          }`}
        >
          {isEntrada ? (
            <ArrowUpRight className="size-5 sm:size-8" strokeWidth={2} />
          ) : (
            <ArrowDownLeft className="size-5 sm:size-8" strokeWidth={2} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted sm:text-xs">
            {isEntrada ? "Entrada" : "Saída"} · {movimento.categoria}
          </p>
          <h1 className="mt-0.5 truncate font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink sm:mt-1 sm:text-3xl sm:whitespace-normal">
            {movimento.descricao}
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            {dataCurta(movimento.data)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">Valor</p>
          <p
            className={`mt-0.5 text-lg font-semibold tracking-tight sm:text-3xl ${
              isEntrada ? "text-mint" : "text-caramel"
            }`}
          >
            {isEntrada ? "+" : "−"}
            {mzn(movimento.valor)}
          </p>
        </div>
      </div>

      {/* ── Detalhes ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">Tipo</p>
          <p className="mt-1 text-base font-semibold text-ink sm:text-lg">
            {isEntrada ? "Entrada" : "Saída"}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">Categoria</p>
          <p className="mt-1 text-base font-semibold text-ink sm:text-lg">
            {movimento.categoria}
          </p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">Data</p>
          <p className="mt-1 text-base font-semibold text-ink sm:text-lg">
            {dataCurta(movimento.data)}
          </p>
        </div>
      </div>
    </div>
  );
}
