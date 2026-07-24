"use client";

import { ArrowLeft, Plus, Trash2, Calculator, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { custoItemReceita } from "@/lib/cost";
import type { ItemReceita, Unidade } from "@/lib/types";

const UNIDADES: Unidade[] = ["g", "kg", "ml", "l", "un"];

export default function CustoPorUnidadePage() {
  const { ingredientes } = useStore();
  const [linhas, setLinhas] = useState<ItemReceita[]>([]);
  const [unidades, setUnidades] = useState("");
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

  const custoTotal = linhas.reduce(
    (soma, l) => soma + custoItemReceita(l, ingredientes),
    0,
  );

  const qtd = parseInt(unidades) || 0;
  const custoPorUnidade = qtd > 0 ? custoTotal / qtd : null;

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
            Custo por unidade
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Descobre quanto custa produzir 1 unidade
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Ingredientes usados</h2>
            <p className="mt-0.5 text-xs text-muted">
              Adiciona os ingredientes e as quantidades usadas nesta receita
            </p>
          </div>

          {/* Linhas de ingredientes */}
          {linhas.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_100px_80px_36px] gap-2 px-1">
                <span className="text-xs font-medium text-muted">Ingrediente</span>
                <span className="text-xs font-medium text-muted">Quantidade</span>
                <span className="text-xs font-medium text-muted">Unidade</span>
                <span />
              </div>
              {linhas.map((linha, i) => {
                const ing = ingredientes.find((x) => x.id === linha.ingredienteId);
                const custo = custoItemReceita(linha, ingredientes);
                return (
                  <div key={i} className="grid grid-cols-[1fr_100px_80px_36px] items-center gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-ink">
                        {ing?.nome ?? "—"}
                      </span>
                      <span className="text-[0.7rem] text-muted">
                        custo ≈ {mzn(Math.round(custo))}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={linha.quantidade || ""}
                      onChange={(e) =>
                        setLinha(i, { quantidade: parseFloat(e.target.value) || 0 })
                      }
                      className="h-10 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink outline-none transition focus:border-strawberry focus:bg-white"
                    />
                    <select
                      value={linha.unidade}
                      onChange={(e) => setLinha(i, { unidade: e.target.value as Unidade })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-line bg-[#f8f8f9] px-2 text-sm text-ink outline-none transition focus:border-strawberry focus:bg-white"
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
                      {mzn(ing.precoCompra)} / {ing.quantidadeCompra} {ing.unidade}
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

        {/* Painel resultado */}
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
                <span className="text-sm font-semibold text-ink">{mzn(Math.round(custoTotal))}</span>
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
