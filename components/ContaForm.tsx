"use client";

import { toast, type FormSubmit } from "@/components/ui";
import { HOJE } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ContaPagar } from "@/lib/types";
import { useState } from "react";

export type ContaDraft = Omit<ContaPagar, "id"> & { id?: string };

export function novaContaDraft(): ContaDraft {
  return { fornecedor: "", descricao: "", valor: 0, vencimento: HOJE, paga: false };
}

export function ContaForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: ContaDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { upsertContaPagar } = useStore();
  const [edit, setEdit] = useState<ContaDraft>(initial);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.fornecedor.trim()) return;
    try {
      await upsertContaPagar({ ...edit, valor: Number(edit.valor) || 0 });
      toast(edit.id ? "Conta actualizada." : "Conta adicionada.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados da conta</h2>
          <p className="text-xs text-muted">Fornecedor, valor e vencimento</p>
        </div>

        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl">
            Fornecedor / Origem
            <input
              className="field"
              required
              placeholder="Ex: Fornecedor de farinha"
              value={edit.fornecedor}
              onChange={(e) => setEdit({ ...edit, fornecedor: e.target.value })}
            />
          </label>
          <label className="lbl">
            Descrição
            <input
              className="field"
              placeholder="Opcional"
              value={edit.descricao}
              onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
            />
          </label>
          <label className="lbl">
            Valor (MZN)
            <input
              type="number"
              min={0}
              className="field"
              required
              value={edit.valor || ""}
              onChange={(e) => setEdit({ ...edit, valor: Number(e.target.value) })}
            />
          </label>
          <label className="lbl">
            Vencimento
            <input
              type="date"
              className="field"
              required
              value={edit.vencimento}
              onChange={(e) => setEdit({ ...edit, vencimento: e.target.value })}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm font-medium text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={edit.paga}
              onChange={(e) => setEdit({ ...edit, paga: e.target.checked })}
              className="size-4 accent-mint"
            />
            Já está paga
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-full bg-[#f4f5f7] px-5 text-sm font-semibold text-ink-soft transition hover:bg-line"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110"
        >
          {edit.id ? "Guardar" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
