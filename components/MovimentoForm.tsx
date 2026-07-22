"use client";

import { toast, type FormSubmit } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { MovimentoCaixa } from "@/lib/types";
import { useMemo, useState } from "react";

const CATEGORIAS_ENTRADA = ["Pedidos", "Venda", "Outro"];
const CATEGORIAS_SAIDA = ["Fornecedores", "Ingredientes", "Utilidades", "Transporte", "Outro"];

export type MovimentoDraft = Omit<MovimentoCaixa, "id"> & { id?: string };

export function novoMovimentoDraft(): MovimentoDraft {
  return {
    tipo: "entrada",
    descricao: "",
    valor: 0,
    data: new Date().toISOString().slice(0, 10),
    categoria: "Venda",
  };
}

export function MovimentoForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: MovimentoDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { movimentos, upsertMovimento } = useStore();
  const [edit, setEdit] = useState<MovimentoDraft>(initial);

  const categorias = useMemo(() => {
    const base = edit.tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
    const extras = movimentos
      .filter((m) => m.tipo === edit.tipo)
      .map((m) => m.categoria);
    const set = new Set([...base, ...extras, edit.categoria].filter(Boolean));
    return [...set];
  }, [movimentos, edit.tipo, edit.categoria]);

  function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.descricao.trim()) return;
    upsertMovimento({
      ...edit,
      valor: Number(edit.valor) || 0,
    });
    toast(edit.id ? "Movimento atualizado." : "Movimento registado.");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados do movimento</h2>
          <p className="text-xs text-muted">Tipo, valor, data e categoria</p>
        </div>

        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl">
            Tipo
            <select
              className="field"
              value={edit.tipo}
              onChange={(e) => {
                const tipo = e.target.value as "entrada" | "saida";
                setEdit({
                  ...edit,
                  tipo,
                  categoria: tipo === "entrada" ? "Venda" : "Ingredientes",
                });
              }}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
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
          <label className="lbl sm:col-span-2">
            Descrição
            <textarea
              className="field"
              required
              rows={3}
              placeholder={
                edit.tipo === "entrada"
                  ? "Ex.: Venda — pedido ped6"
                  : "Ex.: Compra de farinha"
              }
              value={edit.descricao}
              onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
            />
          </label>
          <label className="lbl">
            Data
            <input
              type="date"
              className="field"
              required
              value={edit.data}
              onChange={(e) => setEdit({ ...edit, data: e.target.value })}
            />
          </label>
          <label className="lbl">
            Categoria
            <select
              className="field"
              value={edit.categoria}
              onChange={(e) => setEdit({ ...edit, categoria: e.target.value })}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
          {edit.id ? "Guardar" : "Registar"}
        </button>
      </div>
    </form>
  );
}
