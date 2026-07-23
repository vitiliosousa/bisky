"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, toast } from "@/components/ui";
import { custoUnitario, formatQty } from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertTriangle, Check, Package } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function IngredienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ingredientes, upsertIngrediente, removeIngrediente } = useStore();
  const { confirm, dialog } = useConfirmDelete();
  const [entradaQty, setEntradaQty] = useState("");
  const [entradaPreco, setEntradaPreco] = useState("");

  const ing = ingredientes.find((i) => i.id === params.id);

  if (!ing) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Ingrediente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const baixo = ing.quantidadeAtual < ing.estoqueMinimo;
  const unitario = custoUnitario(ing);
  const valorStock = ing.quantidadeAtual * unitario;

  async function apagar() {
    if (!await confirm(ing!.nome)) return;
    try {
      await removeIngrediente(ing!.id);
      toast("Ingrediente removido.", "info");
      router.replace("/ingredientes");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/ingredientes/${ing.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/ingredientes"
        backLabel="Ingredientes"
        editHref={editHref}
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
            baixo
              ? "bg-strawberry-soft text-strawberry"
              : "bg-blueberry text-white"
          }`}
        >
          {baixo ? (
            <AlertTriangle className="size-5" strokeWidth={1.75} />
          ) : (
            <Package className="size-5" strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {baixo && (
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-strawberry">
              Abaixo do mínimo
            </p>
          )}
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {ing.nome}
          </p>
          <p className="text-xs text-muted">
            {formatQty(ing.quantidadeAtual, ing.unidade)} em stock
          </p>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
          <p
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
              baixo ? "text-strawberry" : "text-ink"
            }`}
          >
            {formatQty(ing.quantidadeAtual, ing.unidade)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Mínimo</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {formatQty(ing.estoqueMinimo, ing.unidade)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Custo unitário</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {mzn(Math.round(unitario))}
            <span className="text-xs font-normal text-muted">/{ing.unidade}</span>
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor em stock</p>
          <p className="mt-0.5 text-base font-semibold text-caramel sm:text-lg">
            {mzn(Math.round(valorStock))}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">Última compra</h2>
          <p className="text-xs text-muted">Preço e tamanho do lote</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[0.7rem] font-medium text-muted">Preço do lote</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {mzn(ing.precoCompra)}
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {formatQty(ing.quantidadeCompra, ing.unidade)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-2.5">
          <p className="text-sm font-semibold text-ink">Registrar compra</p>
          <p className="text-xs text-muted">
            Adiciona ao stock e actualiza o custo unitário
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min="0"
            step="any"
            placeholder={`Qtd. (${ing.unidade})`}
            value={entradaQty}
            onChange={(e) => setEntradaQty(e.target.value)}
            className="field min-w-0 flex-1"
          />
          <input
            type="number"
            min="0"
            placeholder="Preço do lote (MZN)"
            value={entradaPreco}
            onChange={(e) => setEntradaPreco(e.target.value)}
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={async () => {
              const qty = Number(entradaQty);
              const preco = Number(entradaPreco);
              if (!qty || qty <= 0) {
                toast("Indique a quantidade comprada.", "error");
                return;
              }
              if (!preco || preco <= 0) {
                toast("Indique o preço do lote.", "error");
                return;
              }
              try {
                await upsertIngrediente({
                  ...ing,
                  quantidadeAtual: ing.quantidadeAtual + qty,
                  quantidadeCompra: qty,
                  precoCompra: preco,
                });
                setEntradaQty("");
                setEntradaPreco("");
                toast(`Compra registada: +${qty} ${ing.unidade}.`, "success");
              } catch (err) {
                toast(
                  err instanceof Error ? err.message : "Erro ao actualizar.",
                  "error",
                );
              }
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Check className="size-4" strokeWidth={2} />
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
