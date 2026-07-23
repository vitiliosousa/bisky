"use client";

import { toast, type FormSubmit } from "@/components/ui";
import { formatQty } from "@/lib/cost";
import { HOJE } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Unidade } from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MOTIVOS = [
  "Ovos partidos",
  "Calda que sobrou",
  "Receita de teste",
  "Deterioração",
  "Erro de preparo",
  "Embalagem danificada",
  "Outro",
];

export default function NovaPerdaPage() {
  const router = useRouter();
  const { ingredientes, registarPerda } = useStore();
  const [ingId, setIngId] = useState(ingredientes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [data, setData] = useState(HOJE);
  const [loading, setLoading] = useState(false);

  const ing = ingredientes.find((i) => i.id === ingId);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    const qty = Number(quantidade);
    if (!ingId || !qty || qty <= 0) return;
    setLoading(true);
    try {
      await registarPerda({
        ingredienteId: ingId,
        quantidade: qty,
        motivo,
        data,
      });
      toast(
        `Perda de ${formatQty(qty, ing?.unidade as Unidade)} de ${ing?.nome} registada.`,
        "info",
      );
      router.push("/perdas");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao registar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/perdas"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Perdas
      </Link>

      {ingredientes.length === 0 ? (
        <div className="card py-10 text-center text-sm text-muted">
          Não há ingredientes no estoque para registar perdas.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="card space-y-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Dados da perda</h2>
              <p className="text-xs text-muted">
                Ingrediente, quantidade e motivo
              </p>
            </div>

            <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
              <label className="lbl sm:col-span-2">
                Ingrediente
                <select
                  className="field"
                  value={ingId}
                  onChange={(e) => setIngId(e.target.value)}
                  required
                >
                  {ingredientes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} — {formatQty(i.quantidadeAtual, i.unidade)}{" "}
                      disponível
                    </option>
                  ))}
                </select>
              </label>

              <label className="lbl">
                Quantidade ({ing?.unidade ?? "—"})
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="field"
                  placeholder="Ex.: 0.5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </label>

              <label className="lbl">
                Data
                <input
                  type="date"
                  className="field"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </label>

              <label className="lbl sm:col-span-2">
                Motivo
                <select
                  className="field"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/perdas"
              className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#f4f5f7] px-5 text-sm font-semibold text-ink-soft transition hover:bg-line sm:w-auto"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
            >
              {loading && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              Registar perda
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
