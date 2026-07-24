"use client";

import { ArrowLeft, Plus, Trash2, Scale } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Linha = { nome: string; quantidade: string; unidade: string };

function linhaVazia(): Linha {
  return { nome: "", quantidade: "", unidade: "g" };
}

const UNIDADES = ["g", "kg", "ml", "l", "un", "colher", "xícara"];

export default function EscalarReceitaPage() {
  const [linhas, setLinhas] = useState<Linha[]>([linhaVazia()]);
  const [original, setOriginal] = useState("");
  const [desejado, setDesejado] = useState("");

  function atualizar(i: number, campo: keyof Linha, valor: string) {
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function adicionar() {
    setLinhas((prev) => [...prev, linhaVazia()]);
  }

  function remover(i: number) {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
  }

  const qtdOriginal = parseFloat(original) || 0;
  const qtdDesejada = parseFloat(desejado) || 0;
  const fator = qtdOriginal > 0 && qtdDesejada > 0 ? qtdDesejada / qtdOriginal : null;

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
            Escalar receita
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Ajusta os ingredientes para qualquer quantidade
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Ingredientes */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Ingredientes da receita original</h2>
            <p className="mt-0.5 text-xs text-muted">
              Insere os ingredientes com as quantidades da receita base
            </p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_90px_80px_36px] gap-2 px-1">
              <span className="text-xs font-medium text-muted">Ingrediente</span>
              <span className="text-xs font-medium text-muted">Quantidade</span>
              <span className="text-xs font-medium text-muted">Unidade</span>
              <span />
            </div>

            {linhas.map((linha, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_80px_36px] items-center gap-2">
                <input
                  type="text"
                  placeholder="ex: Farinha"
                  value={linha.nome}
                  onChange={(e) => atualizar(i, "nome", e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-blueberry focus:bg-white"
                />
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={linha.quantidade}
                  onChange={(e) => atualizar(i, "quantidade", e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-blueberry focus:bg-white"
                />
                <select
                  value={linha.unidade}
                  onChange={(e) => atualizar(i, "unidade", e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-xl border border-line bg-[#f8f8f9] px-2 text-sm text-ink outline-none transition focus:border-blueberry focus:bg-white"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-blueberry transition hover:bg-blueberry-soft"
          >
            <Plus className="size-4" strokeWidth={2} />
            Adicionar ingrediente
          </button>
        </div>

        {/* Painel direito */}
        <div className="space-y-3">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Quantidades</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Receita original (unidades)
                </label>
                <input
                  type="number"
                  placeholder="ex: 12"
                  min="1"
                  value={original}
                  onChange={(e) => setOriginal(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-blueberry focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Quantidade desejada (unidades)
                </label>
                <input
                  type="number"
                  placeholder="ex: 40"
                  min="1"
                  value={desejado}
                  onChange={(e) => setDesejado(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-blueberry focus:bg-white"
                />
              </div>
            </div>
            {fator !== null && (
              <p className="rounded-xl bg-blueberry-soft/50 px-3 py-2 text-xs text-blueberry">
                Fator de escala: <span className="font-semibold">×{fator.toFixed(2)}</span>
              </p>
            )}
          </div>

          {/* Resultado */}
          {fator !== null && (
            <div className="card space-y-3 ring-2 ring-blueberry/20">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-blueberry-soft text-blueberry">
                  <Scale className="size-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-sm font-semibold text-ink">
                  Para {qtdDesejada} unidades
                </h2>
              </div>
              <ul className="space-y-2">
                {linhas
                  .filter((l) => l.nome && parseFloat(l.quantidade) > 0)
                  .map((l, i) => {
                    const novaQtd = parseFloat(l.quantidade) * fator;
                    const formatado =
                      novaQtd % 1 === 0 ? novaQtd.toFixed(0) : novaQtd.toFixed(2);
                    return (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-ink">{l.nome}</span>
                        <span className="shrink-0 text-sm font-semibold text-ink">
                          {formatado} {l.unidade}
                        </span>
                      </li>
                    );
                  })}
                {linhas.filter((l) => l.nome && parseFloat(l.quantidade) > 0).length === 0 && (
                  <li className="text-xs text-muted">Preenche os ingredientes para ver o resultado.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
