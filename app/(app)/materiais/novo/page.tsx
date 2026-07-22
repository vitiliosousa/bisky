"use client";

import { toast } from "@/components/ui";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIAS = ["Embalagem", "Decoração", "Limpeza", "Escritório", "Outro"];
const UNIDADES = ["un", "rolo", "metro", "caixa", "pacote", "par", "folha"];

export default function NovoMaterialPage() {
  const { upsertMaterial } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    categoria: "Embalagem",
    quantidade: "",
    unidade: "un",
    precoUnitario: "",
    estoqueMinimo: "",
  });

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    try {
      await upsertMaterial({
        nome: form.nome.trim(),
        categoria: form.categoria,
        quantidade: Number(form.quantidade) || 0,
        unidade: form.unidade,
        precoUnitario: Number(form.precoUnitario) || 0,
        estoqueMinimo: Number(form.estoqueMinimo) || 0,
      });
      toast("Material criado.");
      router.push("/materiais");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-5">
      <Link href="/materiais" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Materiais
      </Link>

      <form onSubmit={submeter} className="space-y-4">
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Novo material</h2>
            <p className="text-xs text-muted">Caixas, fitas, velas e outros consumíveis</p>
          </div>

          <div className="form-grid sm:cols-2 sm:grid-cols-2 sm:gap-x-3">
            <label className="lbl sm:col-span-2">
              Nome
              <input
                className="field"
                required
                placeholder="Ex.: Caixa de bolo G"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </label>
            <label className="lbl">
              Categoria
              <select className="field" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="lbl">
              Unidade
              <select className="field" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
            <label className="lbl">
              Quantidade actual
              <input
                type="number"
                min={0}
                className="field"
                placeholder="0"
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              />
            </label>
            <label className="lbl">
              Estoque mínimo
              <input
                type="number"
                min={0}
                className="field"
                placeholder="0"
                value={form.estoqueMinimo}
                onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })}
              />
            </label>
            <label className="lbl sm:col-span-2">
              Preço unitário (MZN)
              <input
                type="number"
                min={0}
                className="field"
                placeholder="0"
                value={form.precoUnitario}
                onChange={(e) => setForm({ ...form, precoUnitario: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/materiais" className="inline-flex h-10 items-center rounded-full bg-[#f4f5f7] px-5 text-sm font-semibold text-ink-soft transition hover:bg-line">
            Cancelar
          </Link>
          <button type="submit" className="inline-flex h-10 items-center rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
