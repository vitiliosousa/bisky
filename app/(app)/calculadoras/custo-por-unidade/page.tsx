"use client";

import { ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { mzn } from "@/lib/format";

type Linha = { nome: string; quantidade: string; precoTotal: string };

function linhaVazia(): Linha {
  return { nome: "", quantidade: "", precoTotal: "" };
}

export default function CustoPorUnidadePage() {
  const [linhas, setLinhas] = useState<Linha[]>([linhaVazia()]);
  const [unidades, setUnidades] = useState("");

  function atualizar(i: number, campo: keyof Linha, valor: string) {
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function adicionar() {
    setLinhas((prev) => [...prev, linhaVazia()]);
  }

  function remover(i: number) {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
  }

  const custoTotal = linhas.reduce((soma, l) => {
    const preco = parseFloat(l.precoTotal) || 0;
    return soma + preco;
  }, 0);

  const qtd = parseInt(unidades) || 0;
  const custoPorUnidade = qtd > 0 ? custoTotal / qtd : null;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/calculadoras"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-muted transition hover:bg-[#ececee] hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Custo por unidade
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Descobre quanto custa produzir 1 unidade
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Ingredientes */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Ingredientes / custos</h2>
            <p className="mt-0.5 text-xs text-muted">
              Adiciona cada ingrediente e o custo total que pagaste por ele
            </p>
          </div>

          <div className="space-y-2">
            {/* Cabeçalho */}
            <div className="grid grid-cols-[1fr_120px_36px] gap-2 px-1">
              <span className="text-xs font-medium text-muted">Ingrediente</span>
              <span className="text-xs font-medium text-muted">Custo (MT)</span>
              <span />
            </div>

            {linhas.map((linha, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_36px] items-center gap-2">
                <input
                  type="text"
                  placeholder="ex: Farinha de trigo"
                  value={linha.nome}
                  onChange={(e) => atualizar(i, "nome", e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-strawberry focus:bg-white"
                />
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={linha.precoTotal}
                  onChange={(e) => atualizar(i, "precoTotal", e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-strawberry focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => remover(i)}
                  disabled={linhas.length === 1}
                  className="flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-strawberry-soft hover:text-strawberry disabled:pointer-events-none disabled:opacity-30"
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={adicionar}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-strawberry transition hover:bg-strawberry-soft"
          >
            <Plus className="size-4" strokeWidth={2} />
            Adicionar ingrediente
          </button>
        </div>

        {/* Painel de resultado */}
        <div className="space-y-3">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Quantidade produzida</h2>
            <div>
              <label className="mb-1.5 block text-xs text-muted">
                Quantas unidades esta receita produz?
              </label>
              <input
                type="number"
                placeholder="ex: 24"
                min="1"
                value={unidades}
                onChange={(e) => setUnidades(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-strawberry focus:bg-white"
              />
            </div>
          </div>

          {/* Resultado */}
          <div className={`card space-y-3 ${custoPorUnidade !== null ? "ring-2 ring-strawberry/20" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                <Calculator className="size-4" strokeWidth={1.75} />
              </span>
              <h2 className="text-sm font-semibold text-ink">Resultado</h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Custo total da receita</span>
                <span className="text-sm font-semibold text-ink">{mzn(custoTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Unidades produzidas</span>
                <span className="text-sm font-semibold text-ink">
                  {qtd > 0 ? `${qtd} un.` : "—"}
                </span>
              </div>
              <div className="border-t border-line pt-2.5">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-ink">Custo por unidade</span>
                  {custoPorUnidade !== null ? (
                    <span className="text-2xl font-semibold tracking-tight text-strawberry">
                      {mzn(Math.round(custoPorUnidade))}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {custoPorUnidade !== null && (
            <div className="card bg-mint-soft/40">
              <p className="text-xs leading-relaxed text-ink">
                Cada unidade custa{" "}
                <span className="font-semibold text-mint">
                  {mzn(Math.round(custoPorUnidade))}
                </span>{" "}
                a produzir. Para ter 60% de margem, vende por{" "}
                <span className="font-semibold text-mint">
                  {mzn(Math.round(custoPorUnidade / 0.4))}
                </span>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
