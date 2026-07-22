"use client";

import { Empty } from "@/components/Empty";
import { toast } from "@/components/ui";
import { formatQty } from "@/lib/cost";
import { HOJE, dataCurta } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Unidade } from "@/lib/types";
import { Trash2 } from "lucide-react";
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

export default function PerdasPage() {
  const { ingredientes, perdas, registarPerda, removePerda } = useStore();

  const [ingId, setIngId] = useState(ingredientes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [data, setData] = useState(HOJE);

  const ing = ingredientes.find((i) => i.id === ingId);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantidade);
    if (!ingId || !qty || qty <= 0) return;
    try {
      await registarPerda({ ingredienteId: ingId, quantidade: qty, motivo, data });
      setQuantidade("");
      toast(
        `Perda de ${formatQty(qty, ing?.unidade as Unidade)} de ${ing?.nome} registada.`,
        "info",
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao registar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Histórico ────────────────────────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Histórico de perdas</h2>
            <p className="text-xs text-muted">{perdas.length} {perdas.length === 1 ? "registo" : "registos"}</p>
          </div>

          {perdas.length === 0 ? (
            <Empty message="Sem perdas registadas." hint="Ótimo sinal!" />
          ) : (
            <ul className="divide-y divide-line">
              {perdas.map((p) => {
                const i = ingredientes.find((x) => x.id === p.ingredienteId);
                return (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {i?.nome ?? "Ingrediente removido"}
                      </p>
                      <p className="text-xs text-muted">
                        {formatQty(p.quantidade, i?.unidade as Unidade)} · {p.motivo} · {dataCurta(p.data)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await removePerda(p.id);
                        } catch (err) {
                          toast(
                            err instanceof Error ? err.message : "Erro ao apagar.",
                            "error",
                          );
                        }
                      }}
                      className="shrink-0 rounded-full p-1.5 text-muted transition hover:text-strawberry"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Formulário ──────────────────────────────────────── */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Registar perda</h2>
            <p className="text-xs text-muted">Baixa manual por desperdício ou dano</p>
          </div>
          <form onSubmit={submeter} className="space-y-3">
            <label className="lbl">
              Ingrediente
              <select
                className="field"
                value={ingId}
                onChange={(e) => setIngId(e.target.value)}
                required
              >
                {ingredientes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} — {formatQty(i.quantidadeAtual, i.unidade)} disponível
                  </option>
                ))}
              </select>
            </label>

            <label className="lbl">
              Quantidade perdida ({ing?.unidade ?? "—"})
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
              Motivo
              <select
                className="field"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              >
                {MOTIVOS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>

            <label className="lbl">
              Data
              <input
                type="date"
                className="field"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="mt-1 w-full rounded-full bg-strawberry py-2.5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110"
            >
              Registar perda
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
