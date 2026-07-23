"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, toast } from "@/components/ui";
import { formatQty } from "@/lib/cost";
import { dataCurta } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Unidade } from "@/lib/types";
import { Package, Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PerdaDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ingredientes, produtos, perdas, removePerda } = useStore();
  const { confirm, dialog } = useConfirmDelete();

  const perda = perdas.find((p) => p.id === params.id);

  if (!perda) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Perda não encontrada.
          </p>
        </div>
      </div>
    );
  }

  const isProd = perda.tipo === "produto";
  const ing =
    !isProd && perda.ingredienteId
      ? ingredientes.find((i) => i.id === perda.ingredienteId)
      : undefined;
  const prod =
    isProd && perda.produtoId
      ? produtos.find((p) => p.id === perda.produtoId)
      : undefined;
  const nome = isProd
    ? (prod?.nome ?? "Produto removido")
    : (ing?.nome ?? "Ingrediente removido");

  async function apagar() {
    if (!await confirm(nome)) return;
    try {
      await removePerda(perda!.id);
      toast("Perda apagada.", "info");
      router.replace("/perdas");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/perdas"
        backLabel="Perdas"
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
          {isProd ? (
            <UtensilsCrossed className="size-5" strokeWidth={1.75} />
          ) : (
            <Trash2 className="size-5" strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {nome}
          </p>
          <p className="text-xs text-muted">
            {isProd ? "Produto" : "Ingrediente"} · {dataCurta(perda.data)}
          </p>
        </div>
        <DetailCardActions onDelete={apagar} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
            {isProd
              ? `${perda.quantidade} un`
              : formatQty(perda.quantidade, ing?.unidade as Unidade)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Unidade</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {isProd ? "un" : (ing?.unidade ?? "—")}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">Motivo</h2>
          <p className="text-xs text-muted">Porque saiu do estoque</p>
        </div>
        <p className="rounded-2xl bg-[#f4f5f7] px-4 py-3 text-sm font-medium text-ink">
          {perda.motivo}
        </p>
      </div>

      {ing && (
        <div className="card flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blueberry-soft text-blueberry">
            <Package className="size-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Stock actual</p>
            <p className="text-xs text-muted">
              {formatQty(ing.quantidadeAtual, ing.unidade)} disponíveis
            </p>
          </div>
          <Link
            href={`/ingredientes/${ing.id}`}
            className="text-xs font-semibold text-strawberry hover:underline"
          >
            Ver ingrediente
          </Link>
        </div>
      )}

      {prod && (
        <div className="card flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blueberry-soft text-blueberry">
            <UtensilsCrossed className="size-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{prod.nome}</p>
            <p className="text-xs text-muted">
              Baixa da receita e materiais deste produto
            </p>
          </div>
          <Link
            href={`/produtos/${prod.id}`}
            className="text-xs font-semibold text-strawberry hover:underline"
          >
            Ver produto
          </Link>
        </div>
      )}
    </div>
  );
}
