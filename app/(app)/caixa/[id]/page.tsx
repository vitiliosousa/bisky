"use client";

import { confirmDelete, toast } from "@/components/ui";
import { dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  ArrowDownLeft,
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
      <div className="animate-in">
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
        <div className="flex shrink-0 flex-col items-center gap-1">
          <Link
            href={`/caixa/${movimento.id}/editar`}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-[#f4f5f7] hover:text-ink"
            aria-label="Editar"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={apagar}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-strawberry-soft hover:text-strawberry"
            aria-label="Apagar"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </button>
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
