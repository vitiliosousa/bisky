"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { savePerfil, type PerfilUtilizador } from "@/lib/profile";
import { useState } from "react";

export function PerfilForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: PerfilUtilizador;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [edit, setEdit] = useState<PerfilUtilizador>(initial);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.nome.trim()) return;
    try {
      await savePerfil({
        ...edit,
        nome: edit.nome.trim(),
        email: edit.email.trim(),
        telefone: edit.telefone.trim(),
        endereco: edit.endereco.trim(),
        negocio: edit.negocio.trim(),
        papel: edit.papel.trim(),
        bio: edit.bio.trim(),
      });
      toast("Perfil atualizado.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados pessoais</h2>
          <p className="text-xs text-muted">Nome e função na confeitaria</p>
        </div>
        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl sm:col-span-2">
            Nome
            <input
              className="field"
              required
              placeholder="O seu nome"
              value={edit.nome}
              onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
            />
          </label>
          <label className="lbl">
            Função
            <input
              className="field"
              placeholder="Ex.: Confeiteira"
              value={edit.papel}
              onChange={(e) => setEdit({ ...edit, papel: e.target.value })}
            />
          </label>
          <label className="lbl sm:col-span-2">
            Sobre
            <textarea
              className="field min-h-24 resize-y"
              placeholder="Uma breve descrição sobre si ou o negócio…"
              value={edit.bio}
              onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Contactos</h2>
          <p className="text-xs text-muted">Email, telefone e endereço</p>
        </div>
        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <label className="lbl">
            Email
            <input
              className="field"
              type="email"
              readOnly
              placeholder="email@exemplo.com"
              value={edit.email}
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
          <label className="lbl sm:col-span-2">
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

      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Negócio</h2>
          <p className="text-xs text-muted">Nome da confeitaria</p>
        </div>
        <label className="lbl">
          Nome do negócio
          <input
            className="field"
            placeholder="Ex.: Confeitaria Bisky"
            value={edit.negocio}
            onChange={(e) => setEdit({ ...edit, negocio: e.target.value })}
          />
        </label>
      </div>

      <FormActions onCancel={onCancel} submitLabel="Guardar alterações" />
    </form>
  );
}
