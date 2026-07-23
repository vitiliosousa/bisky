"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Ingrediente, Unidade } from "@/lib/types";
import { useState } from "react";

const UNIDADES: Unidade[] = ["kg", "g", "l", "ml", "un"];

export type IngredienteDraft = Omit<Ingrediente, "id"> & { id?: string };

export function novoIngredienteDraft(): IngredienteDraft {
  return {
    nome: "",
    quantidadeAtual: 0,
    unidade: "kg",
    precoCompra: 0,
    quantidadeCompra: 1,
    estoqueMinimo: 0,
  };
}

export function IngredienteForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: IngredienteDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { upsertIngrediente } = useStore();
  const [edit, setEdit] = useState<IngredienteDraft>(initial);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.nome.trim()) return;
    setLoading(true);
    try {
      await upsertIngrediente({
        ...edit,
        quantidadeAtual: Number(edit.quantidadeAtual) || 0,
        precoCompra: Number(edit.precoCompra) || 0,
        quantidadeCompra: Number(edit.quantidadeCompra) || 1,
        estoqueMinimo: Number(edit.estoqueMinimo) || 0,
      });
      toast(edit.id ? "Ingrediente atualizado." : "Ingrediente adicionado.");
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
          <h2 className="text-base font-semibold text-ink">Dados do ingrediente</h2>
          <p className="text-xs text-muted">Nome, quantidade e unidade</p>
        </div>
        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl sm:col-span-2">
            Nome
            <input
              className="field"
              required
              placeholder="Ex.: Farinha de trigo"
              value={edit.nome}
              onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
            />
          </label>
          <label className="lbl">
            Quantidade actual
            <input
              type="number"
              step="any"
              min={0}
              className="field"
              value={edit.quantidadeAtual || ""}
              onChange={(e) =>
                setEdit({ ...edit, quantidadeAtual: Number(e.target.value) })
              }
            />
          </label>
          <label className="lbl">
            Unidade
            <select
              className="field"
              value={edit.unidade}
              onChange={(e) =>
                setEdit({ ...edit, unidade: e.target.value as Unidade })
              }
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="lbl">
            Estoque mínimo
            <input
              type="number"
              step="any"
              min={0}
              className="field"
              value={edit.estoqueMinimo || ""}
              onChange={(e) =>
                setEdit({ ...edit, estoqueMinimo: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Compra</h2>
          <p className="text-xs text-muted">
            Usado para calcular o custo por unidade
          </p>
        </div>
        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl">
            Qtd. do lote comprado
            <input
              type="number"
              step="any"
              min={0}
              className="field"
              value={edit.quantidadeCompra || ""}
              onChange={(e) =>
                setEdit({ ...edit, quantidadeCompra: Number(e.target.value) })
              }
            />
          </label>
          <label className="lbl">
            Preço do lote (MZN)
            <input
              type="number"
              min={0}
              className="field"
              value={edit.precoCompra || ""}
              onChange={(e) =>
                setEdit({ ...edit, precoCompra: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
