"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { useState } from "react";

export type ClienteDraft = Omit<Cliente, "id"> & { id?: string };

export function novoClienteDraft(): ClienteDraft {
  return { nome: "", telefone: "", endereco: "" };
}

export function ClienteForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: ClienteDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { upsertCliente } = useStore();
  const [edit, setEdit] = useState<ClienteDraft>(initial);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.nome.trim()) return;
    try {
      await upsertCliente(edit);
      toast(edit.id ? "Cliente atualizado." : "Cliente criado.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados do cliente</h2>
          <p className="text-xs text-muted">Nome, contacto e endereço</p>
        </div>
        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl sm:col-span-2">
            Nome
            <input
              className="field"
              required
              placeholder="Ex.: Maria José"
              value={edit.nome}
              onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
            />
          </label>
          <label className="lbl">
            Telefone
            <input
              className="field"
              type="tel"
              placeholder="+258 84 000 0000"
              value={edit.telefone}
              onChange={(e) => setEdit({ ...edit, telefone: e.target.value })}
            />
          </label>
          <label className="lbl">
            Endereço
            <input
              className="field"
              placeholder="Bairro, cidade…"
              value={edit.endereco}
              onChange={(e) => setEdit({ ...edit, endereco: e.target.value })}
            />
          </label>
        </div>
      </div>
      <FormActions onCancel={onCancel} />
    </form>
  );
}
