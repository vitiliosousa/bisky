"use client";

import { toast, type FormSubmit } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { hoje } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ContaPagar } from "@/lib/types";
import { useState } from "react";

export type ContaDraft = Omit<ContaPagar, "id"> & { id?: string };

export function novaContaDraft(): ContaDraft {
  return {
    fornecedor: "",
    descricao: "",
    valor: 0,
    vencimento: hoje(),
    paga: false,
    recorrente: false,
  };
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
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.fornecedor.trim()) return;
    setLoading(true);
    try {
      await upsertContaPagar({ ...edit, valor: Number(edit.valor) || 0 });
      toast(edit.id ? "Conta actualizada." : "Conta adicionada.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    } finally {
      setLoading(false);
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
          <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(edit.recorrente)}
              onChange={(e) =>
                setEdit({ ...edit, recorrente: e.target.checked })
              }
              className="mt-0.5 size-4 accent-strawberry"
            />
            <span>
              Conta recorrente
              <span className="mt-0.5 block text-xs font-normal text-muted">
                Ao pagar, cria automaticamente a do mês seguinte
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex h-10 items-center rounded-full bg-[#f4f5f7] px-5 text-sm font-semibold text-ink-soft transition hover:bg-line disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" strokeWidth={2} />}
          {edit.id ? "Guardar" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
