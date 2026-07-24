"use client";

import { ArrowLeft, Trash2, Scale, Search, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { custoItemReceita } from "@/lib/cost";
import { mzn } from "@/lib/format";
import type { ItemReceita, Unidade } from "@/lib/types";

const UNIDADES: Unidade[] = ["g", "kg", "ml", "l", "un"];

export default function EscalarReceitaPage() {
  const { ingredientes } = useStore();
  const [linhas, setLinhas] = useState<ItemReceita[]>([]);
  const [original, setOriginal] = useState("");
  const [desejado, setDesejado] = useState("");
  const [busca, setBusca] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);

  const disponiveis = useMemo(
    () =>
      ingredientes.filter(
        (ing) =>
          !linhas.some((l) => l.ingredienteId === ing.id) &&
          ing.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [ingredientes, linhas, busca],
  );

  function addIngrediente(id: string) {
    const ing = ingredientes.find((i) => i.id === id);
    if (!ing) return;
    setLinhas((prev) => [
      ...prev,
      { ingredienteId: ing.id, quantidade: 0, unidade: ing.unidade },
    ]);
    setBusca("");
    setDropOpen(false);
    buscaRef.current?.focus();
  }

  function setLinha(i: number, patch: Partial<ItemReceita>) {
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function remover(i: number) {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
  }

  const qtdOriginal = parseFloat(original) || 0;
  const qtdDesejada = parseFloat(desejado) || 0;
  const fator = qtdOriginal > 0 && qtdDesejada > 0 ? qtdDesejada / qtdOriginal : null;

  const custoOriginal = linhas.reduce((s, l) => s + custoItemReceita(l, ingredientes), 0);
  const custoEscalado = fator !== null ? custoOriginal * fator : null;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      <Link
        href="/calculadora"
        className="hidden items-center gap-2 text-sm font-medium text-muted transition hover:text-ink lg:inline-flex"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Calculadora
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Ingredientes da receita original</h2>
            <p className="mt-0.5 text-xs text-muted">
              Insere os ingredientes com as quantidades da receita base
            </p>
          </div>

          {linhas.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_76px_60px_28px] gap-2 px-1 sm:grid-cols-[1fr_100px_80px_36px]">
                <span className="text-xs font-medium text-muted">Ingrediente</span>
                <span className="text-xs font-medium text-muted">Quantidade</span>
                <span className="text-xs font-medium text-muted">Unidade</span>
                <span />
              </div>
              {linhas.map((linha, i) => {
                const ing = ingredientes.find((x) => x.id === linha.ingredienteId);
                return (
                  <div key={i} className="grid grid-cols-[1fr_76px_60px_28px] items-center gap-2 sm:grid-cols-[1fr_100px_80px_36px]">
                    <span className="truncate text-sm font-medium text-ink">
                      {ing?.nome ?? "—"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={linha.quantidade || ""}
                      onChange={(e) =>
                        setLinha(i, { quantidade: parseFloat(e.target.value) || 0 })
                      }
                      className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink outline-none transition focus:border-blueberry focus:bg-white"
                    />
                    <select
                      value={linha.unidade}
                      onChange={(e) => setLinha(i, { unidade: e.target.value as Unidade })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-line bg-[#f8f8f9] px-2 text-sm text-ink outline-none transition focus:border-blueberry focus:bg-white"
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remover(i)}
                      className="flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-strawberry-soft hover:text-strawberry"
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dropdown de busca */}
          <div className="relative">
            <label className="search-pill w-full" onClick={() => setDropOpen(true)}>
              <Search className="size-4 shrink-0" strokeWidth={1.75} />
              <input
                ref={buscaRef}
                type="search"
                placeholder="Adicionar ingrediente…"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
              />
              <Plus className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
            </label>
            {dropOpen && disponiveis.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-line bg-white shadow-lg">
                {disponiveis.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    onMouseDown={() => addIngrediente(ing.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                  >
                    <span className="font-medium text-ink">{ing.nome}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {ing.quantidadeAtual} {ing.unidade} em stock
                    </span>
                  </button>
                ))}
              </div>
            )}
            {dropOpen && (
              <div className="fixed inset-0 z-[5]" onClick={() => setDropOpen(false)} />
            )}
          </div>
        </div>

        {/* Painel direito */}
        <div className="space-y-3">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Quantidades</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-muted">
                  Receita original rende (unidades)
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
                  .filter((l) => l.quantidade > 0)
                  .map((l, i) => {
                    const ing = ingredientes.find((x) => x.id === l.ingredienteId);
                    const novaQtd = l.quantidade * fator;
                    const formatado =
                      novaQtd % 1 === 0 ? novaQtd.toFixed(0) : novaQtd.toFixed(2);
                    return (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-ink">{ing?.nome ?? "—"}</span>
                        <span className="shrink-0 text-sm font-semibold text-ink">
                          {formatado} {l.unidade}
                        </span>
                      </li>
                    );
                  })}
                {linhas.filter((l) => l.quantidade > 0).length === 0 && (
                  <li className="text-xs text-muted">Preenche as quantidades para ver o resultado.</li>
                )}
              </ul>
              {custoEscalado !== null && custoEscalado > 0 && (
                <div className="border-t border-line pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Custo estimado</span>
                    <span className="text-sm font-semibold text-blueberry">
                      {mzn(Math.round(custoEscalado))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
