"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, toast } from "@/components/ui";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertTriangle, Box, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function MaterialDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { materiais, upsertMaterial, removeMaterial } = useStore();
  const { confirm, dialog } = useConfirmDelete();
  const [reporQty, setReporQty] = useState("");
  const [reporPreco, setReporPreco] = useState("");

  const mat = materiais.find((m) => m.id === params.id);

  if (!mat) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Material não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const baixo = mat.quantidade < mat.estoqueMinimo;

  async function apagar() {
    if (!await confirm(mat!.nome)) return;
    try {
      await removeMaterial(mat!.id);
      toast("Material removido.", "info");
      router.replace("/materiais");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/materiais/${mat.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/materiais"
        backLabel="Materiais"
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
            <Box className="size-5" strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {baixo && (
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-strawberry">
              Abaixo do mínimo
            </p>
          )}
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {mat.nome}
          </p>
          <p className="text-xs text-muted">{mat.categoria}</p>
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
            {mat.quantidade} {mat.unidade}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Mínimo</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {mat.estoqueMinimo} {mat.unidade}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Preço unitário</p>
          <p className="mt-0.5 text-base font-semibold text-ink sm:text-lg">
            {mzn(mat.precoUnitario)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor em stock</p>
          <p className="mt-0.5 text-base font-semibold text-caramel sm:text-lg">
            {mzn(Math.round(mat.quantidade * mat.precoUnitario))}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="mb-2.5">
          <p className="text-sm font-semibold text-ink">Registrar compra</p>
          <p className="text-xs text-muted">
            Adiciona ao stock e pode actualizar o preço unitário
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min={0}
            step="any"
            placeholder={`Qtd. (${mat.unidade})`}
            value={reporQty}
            onChange={(e) => setReporQty(e.target.value)}
            className="field min-w-0 flex-1"
          />
          <input
            type="number"
            min={0}
            placeholder={`Preço/${mat.unidade} (opcional)`}
            value={reporPreco}
            onChange={(e) => setReporPreco(e.target.value)}
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={async () => {
              const qty = Number(reporQty);
              if (!qty || qty <= 0) {
                toast("Indique a quantidade.", "error");
                return;
              }
              const preco = Number(reporPreco);
              try {
                await upsertMaterial({
                  ...mat,
                  quantidade: mat.quantidade + qty,
                  precoUnitario:
                    preco > 0 ? preco : mat.precoUnitario,
                });
                setReporQty("");
                setReporPreco("");
                toast(`Compra registada: +${qty} ${mat.unidade}.`, "success");
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
