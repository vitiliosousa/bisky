"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { confirmDelete, toast } from "@/components/ui";
import { dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function MovimentoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { movimentos, removeMovimento } = useStore();

  const mov = movimentos.find((m) => m.id === params.id);

  if (!mov) {
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

  const isEntrada = mov.tipo === "entrada";
  const editHref = `/caixa/${mov.id}/editar`;

  async function apagar() {
    if (!confirmDelete(mov!.descricao)) return;
    try {
      await removeMovimento(mov!.id);
      toast("Movimento apagado.", "info");
      router.replace("/caixa");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      <DetailTopBar
        backHref="/caixa"
        backLabel="Fluxo de caixa"
        editHref={editHref}
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
            isEntrada
              ? "bg-mint-soft text-mint"
              : "bg-caramel-soft text-caramel"
          }`}
        >
          {isEntrada ? (
            <ArrowUpRight className="size-5" strokeWidth={2} />
          ) : (
            <ArrowDownLeft className="size-5" strokeWidth={2} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
            {isEntrada ? "Entrada" : "Saída"}
          </p>
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {mov.descricao}
          </p>
          <p className="text-xs text-muted">
            {dataCurta(mov.data)} · {mov.categoria}
          </p>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor</p>
          <p
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
              isEntrada ? "text-mint" : "text-caramel"
            }`}
          >
            {isEntrada ? "+" : "−"}
            {mzn(mov.valor)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Data</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {dataCurta(mov.data)}
          </p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <p className="text-[0.7rem] font-medium text-muted">Categoria</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {mov.categoria}
          </p>
        </div>
      </div>
    </div>
  );
}
