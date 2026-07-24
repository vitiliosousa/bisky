"use client";

import { ArrowLeft, Plus, Trash2, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { mzn } from "@/lib/format";

type Custo = { nome: string; valor: string };

function custoVazio(): Custo {
  return { nome: "", valor: "" };
}

export default function PontoDeEquilibrioPage() {
  const [custos, setCustos] = useState<Custo[]>([custoVazio()]);
  const [precoVenda, setPrecoVenda] = useState("");
  const [custoProd, setCustoProd] = useState("");

  function atualizar(i: number, campo: keyof Custo, valor: string) {
    setCustos((prev) => prev.map((c, idx) => (idx === i ? { ...c, [campo]: valor } : c)));
  }

  function adicionar() {
    setCustos((prev) => [...prev, custoVazio()]);
  }

  function remover(i: number) {
    setCustos((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totalFixo = custos.reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);
  const preco = parseFloat(precoVenda) || 0;
  const custo = parseFloat(custoProd) || 0;
  const margContrib = preco - custo;
  const pontoEquilibrio =
    margContrib > 0 && totalFixo > 0 ? Math.ceil(totalFixo / margContrib) : null;
  const receitaEquilibrio = pontoEquilibrio !== null ? pontoEquilibrio * preco : null;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/calculadoras"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-muted transition hover:bg-[#ececee] hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Ponto de equilíbrio
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Descobre quantas unidades precisas de vender para não ter prejuízo
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* Custos fixos */}
          <div className="card space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Custos fixos mensais</h2>
              <p className="mt-0.5 text-xs text-muted">
                Despesas que pagas todos os meses independente do que vendes
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_130px_36px] gap-2 px-1">
                <span className="text-xs font-medium text-muted">Descrição</span>
                <span className="text-xs font-medium text-muted">Valor (MT)</span>
                <span />
              </div>

              {custos.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_130px_36px] items-center gap-2">
                  <input
                    type="text"
                    placeholder="ex: Aluguer, luz…"
                    value={c.nome}
                    onChange={(e) => atualizar(i, "nome", e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-caramel focus:bg-white"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={c.valor}
                    onChange={(e) => atualizar(i, "valor", e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-caramel focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    disabled={custos.length === 1}
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
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-caramel transition hover:bg-caramel-soft"
            >
              <Plus className="size-4" strokeWidth={2} />
              Adicionar custo
            </button>

            {totalFixo > 0 && (
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-medium text-muted">Total fixo mensal</span>
                <span className="text-base font-semibold text-ink">{mzn(totalFixo)}</span>
              </div>
            )}
          </div>

          {/* Produto */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Dados do produto</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Preço de venda por unidade (MT)
                </label>
                <input
                  type="number"
                  placeholder="ex: 300"
                  min="0"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-caramel focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Custo de produção por unidade (MT)
                </label>
                <input
                  type="number"
                  placeholder="ex: 120"
                  min="0"
                  value={custoProd}
                  onChange={(e) => setCustoProd(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-caramel focus:bg-white"
                />
              </div>
            </div>
            {margContrib > 0 && (
              <p className="text-xs text-muted">
                Margem de contribuição por unidade:{" "}
                <span className="font-semibold text-ink">{mzn(margContrib)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-3">
          <div className={`card space-y-4 ${pontoEquilibrio !== null ? "ring-2 ring-caramel/25" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-caramel-soft text-caramel">
                <Target className="size-4" strokeWidth={1.75} />
              </span>
              <h2 className="text-sm font-semibold text-ink">Resultado</h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Custos fixos / mês</span>
                <span className="text-sm font-semibold text-ink">
                  {totalFixo > 0 ? mzn(totalFixo) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Margem por unidade</span>
                <span className="text-sm font-semibold text-ink">
                  {margContrib > 0 ? mzn(margContrib) : "—"}
                </span>
              </div>
              <div className="border-t border-line pt-2.5 space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-ink">Unidades mínimas</span>
                  {pontoEquilibrio !== null ? (
                    <span className="text-2xl font-semibold tracking-tight text-caramel">
                      {pontoEquilibrio} un.
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>
                {receitaEquilibrio !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Receita mínima</span>
                    <span className="text-sm font-semibold text-ink">
                      {mzn(receitaEquilibrio)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pontoEquilibrio !== null && (
            <div className="card bg-caramel-soft/40">
              <p className="text-xs leading-relaxed text-ink">
                Precisas de vender pelo menos{" "}
                <span className="font-semibold text-caramel">{pontoEquilibrio} unidades</span>{" "}
                por mês para cobrir os custos fixos. Acima disso, começas a ter lucro.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
