"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { HOJE, labelsEvento } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { EventoCalendario, TipoEvento } from "@/lib/types";
import { useState } from "react";

const TIPOS: TipoEvento[] = ["pedido", "casamento", "festa", "aniversario"];

export type EventoDraft = Omit<EventoCalendario, "id"> & { id?: string };

export function novoEventoDraft(data = HOJE): EventoDraft {
  return {
    titulo: "",
    data,
    hora: "10:00",
    tipo: "pedido",
  };
}

export function EventoForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: EventoDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { upsertEvento } = useStore();
  const [edit, setEdit] = useState<EventoDraft>(initial);

  function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.titulo.trim()) return;
    upsertEvento({
      ...edit,
      hora: edit.hora || undefined,
    });
    toast(edit.id ? "Evento atualizado." : "Evento criado.");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados do evento</h2>
          <p className="text-xs text-muted">Título, data, hora e tipo</p>
        </div>

        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl sm:col-span-2">
            Título
            <input
              className="field"
              required
              placeholder="Ex.: Entrega Maria José"
              value={edit.titulo}
              onChange={(e) => setEdit({ ...edit, titulo: e.target.value })}
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
            Hora
            <input
              type="time"
              className="field"
              value={edit.hora ?? ""}
              onChange={(e) => setEdit({ ...edit, hora: e.target.value })}
            />
          </label>
          <label className="lbl sm:col-span-2">
            Tipo
            <select
              className="field"
              value={edit.tipo}
              onChange={(e) =>
                setEdit({ ...edit, tipo: e.target.value as TipoEvento })
              }
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {labelsEvento[t]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <FormActions onCancel={onCancel} />
    </form>
  );
}
