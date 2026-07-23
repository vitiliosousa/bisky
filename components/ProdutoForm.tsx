"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { custoItemMaterial, custoItemReceita, custoProduto, margemLucro, precoSugerido } from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ItemMaterial, ItemReceita, Produto, Unidade } from "@/lib/types";
import { Plus, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const UNIDADES: Unidade[] = ["g", "kg", "ml", "l", "un"];
const CATEGORIAS_BASE = ["Bolos", "Doces", "Salgados", "Sobremesas"];

export type ProdutoDraft = Omit<Produto, "id"> & { id?: string };

export function novoProdutoDraft(): ProdutoDraft {
  return { nome: "", categoria: "Bolos", preco: 0, receita: [], modoPreparo: [], materiaisNecessarios: [] };
}

export function ProdutoForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: ProdutoDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { produtos, ingredientes, materiais, upsertProduto } = useStore();
  const [edit, setEdit] = useState<ProdutoDraft>(initial);
  const [buscaIng, setBuscaIng] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);
  const [buscaMat, setBuscaMat] = useState("");
  const [dropMatOpen, setDropMatOpen] = useState(false);
  const buscaMatRef = useRef<HTMLInputElement>(null);

  const categorias = useMemo(() => {
    const set = new Set([...CATEGORIAS_BASE, ...produtos.map((p) => p.categoria)]);
    if (edit.categoria) set.add(edit.categoria);
    return [...set];
  }, [produtos, edit.categoria]);

  const stats = useMemo(() => {
    const custo = custoProduto(
      { ...edit, id: edit.id ?? "", preco: Number(edit.preco) || 0 } as Produto,
      ingredientes,
      materiais,
    );
    const preco = Number(edit.preco) || 0;
    const lucro = preco - custo;
    const margem = margemLucro(preco, custo);
    const sugerido = precoSugerido(custo);
    return { custo, lucro, margem, sugerido };
  }, [edit.receita, edit.materiaisNecessarios, edit.preco, ingredientes, materiais]);

  const disponiveis = useMemo(
    () =>
      ingredientes.filter(
        (ing) =>
          !edit.receita.some((r) => r.ingredienteId === ing.id) &&
          ing.nome.toLowerCase().includes(buscaIng.toLowerCase()),
      ),
    [ingredientes, edit.receita, buscaIng],
  );

  const disponiveisMat = useMemo(
    () =>
      materiais.filter(
        (mat) =>
          !(edit.materiaisNecessarios ?? []).some((m) => m.materialId === mat.id) &&
          mat.nome.toLowerCase().includes(buscaMat.toLowerCase()),
      ),
    [materiais, edit.materiaisNecessarios, buscaMat],
  );

  function addIngrediente(id: string) {
    const ing = ingredientes.find((i) => i.id === id);
    if (!ing) return;
    setEdit({
      ...edit,
      receita: [
        ...edit.receita,
        { ingredienteId: ing.id, quantidade: 0, unidade: ing.unidade },
      ],
    });
    setBuscaIng("");
    setDropOpen(false);
    buscaRef.current?.focus();
  }

  function setLinha(i: number, patch: Partial<ItemReceita>) {
    const receita = edit.receita.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setEdit({ ...edit, receita });
  }

  function addMaterial(id: string) {
    const mat = materiais.find((m) => m.id === id);
    if (!mat) return;
    setEdit({
      ...edit,
      materiaisNecessarios: [
        ...(edit.materiaisNecessarios ?? []),
        { materialId: mat.id, quantidade: 1 },
      ],
    });
    setBuscaMat("");
    setDropMatOpen(false);
    buscaMatRef.current?.focus();
  }

  function setLinhamat(i: number, patch: Partial<ItemMaterial>) {
    const mats = (edit.materiaisNecessarios ?? []).map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    setEdit({ ...edit, materiaisNecessarios: mats });
  }

  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    if (!edit.nome.trim()) return;
    setLoading(true);
    try {
      await upsertProduto({
        ...edit,
        preco: Number(edit.preco) || 0,
        receita: edit.receita.filter((r) => r.quantidade > 0),
        modoPreparo: edit.modoPreparo?.filter((s) => s.trim()) || undefined,
        materiaisNecessarios: (edit.materiaisNecessarios ?? []).filter(
          (m) => m.quantidade > 0,
        ),
      });
      toast(edit.id ? "Produto atualizado." : "Produto criado.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* ── Dados básicos ──────────────────────────────────── */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados básicos</h2>
          <p className="text-xs text-muted">Nome, categoria e preço de venda</p>
        </div>
        <div className="form-grid sm:grid-cols-4 sm:gap-x-3">
          <label className="lbl sm:col-span-2">
            Nome
            <input
              className="field"
              required
              placeholder="Ex.: Bolo de Chocolate"
              value={edit.nome}
              onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
            />
          </label>
          <label className="lbl">
            Categoria
            <select
              className="field"
              value={edit.categoria}
              onChange={(e) => setEdit({ ...edit, categoria: e.target.value })}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="lbl">
            Preço (MZN)
            <input
              type="number"
              min={0}
              className="field"
              value={edit.preco || ""}
              onChange={(e) => setEdit({ ...edit, preco: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* ── Receita + Modo de preparo ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ingredientes */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Receita</h2>
            <p className="text-xs text-muted">Ingredientes e quantidades usadas</p>
          </div>

          <div className="relative">
            <label className="search-pill w-full" style={{ maxWidth: "none" }}>
              <Search className="size-4 shrink-0" strokeWidth={1.75} />
              <input
                ref={buscaRef}
                type="search"
                placeholder="Adicionar ingrediente…"
                value={buscaIng}
                onChange={(e) => {
                  setBuscaIng(e.target.value);
                  setDropOpen(true);
                }}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
              />
            </label>
            {dropOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
                {disponiveis.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">
                    {buscaIng
                      ? "Nenhum ingrediente encontrado."
                      : "Todos os ingredientes já foram adicionados."}
                  </p>
                ) : (
                  disponiveis.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addIngrediente(ing.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                    >
                      <span className="font-medium text-ink">{ing.nome}</span>
                      <Plus className="size-3.5 shrink-0 text-strawberry" strokeWidth={2.25} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {edit.receita.length > 0 && (
            <ul className="space-y-2">
              {edit.receita.map((r, i) => {
                const ing = ingredientes.find((x) => x.id === r.ingredienteId);
                const custoLinha = custoItemReceita(r, ingredientes);
                return (
                  <li
                    key={r.ingredienteId}
                    className="grid grid-cols-[minmax(0,1fr)_3.5rem_4.25rem_1.75rem] items-center gap-1 sm:grid-cols-[1fr_5rem_4.5rem_2.5rem] sm:gap-1.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate rounded-full bg-[#f4f5f7] px-3 py-2.5 text-sm font-medium text-ink sm:px-3.5">
                        {ing?.nome ?? "Ingrediente removido"}
                      </span>
                      {custoLinha > 0 && (
                        <span className="mt-0.5 pl-3 text-[0.65rem] text-muted">
                          {mzn(Math.round(custoLinha))}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Qtd"
                      className="field mt-0 px-2! text-center sm:px-3.5! sm:text-left"
                      value={r.quantidade || ""}
                      onChange={(e) => setLinha(i, { quantidade: Number(e.target.value) })}
                    />
                    <select
                      className="field mt-0 pl-2.5! sm:pl-3.5!"
                      style={{ backgroundPosition: "right 0.6rem center" }}
                      value={r.unidade}
                      onChange={(e) => setLinha(i, { unidade: e.target.value as Unidade })}
                    >
                      {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-full text-muted transition hover:text-strawberry"
                      onClick={() =>
                        setEdit({
                          ...edit,
                          receita: edit.receita.filter((_, idx) => idx !== i),
                        })
                      }
                      aria-label="Remover"
                    >
                      <X className="size-4" strokeWidth={1.75} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modo de preparo */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Modo de preparo</h2>
            <p className="text-xs text-muted">Passo a passo da receita</p>
          </div>

          {(edit.modoPreparo ?? []).length > 0 && (
            <ol className="space-y-2">
              {(edit.modoPreparo ?? []).map((passo, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <input
                    className="field mt-0 flex-1"
                    placeholder={`Passo ${i + 1}…`}
                    value={passo}
                    onChange={(e) => {
                      const steps = [...(edit.modoPreparo ?? [])];
                      steps[i] = e.target.value;
                      setEdit({ ...edit, modoPreparo: steps });
                    }}
                  />
                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-strawberry"
                    onClick={() => {
                      const steps = (edit.modoPreparo ?? []).filter((_, idx) => idx !== i);
                      setEdit({ ...edit, modoPreparo: steps });
                    }}
                    aria-label="Remover passo"
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ol>
          )}
        
          <button
            type="button"
            onClick={() => setEdit({ ...edit, modoPreparo: [...(edit.modoPreparo ?? []), ""] })}
            className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-[#f4f5f7] px-4 text-sm font-medium text-ink-soft transition hover:bg-line"
          >
            <Plus className="size-4" strokeWidth={2} />
            Adicionar passo
          </button>
        </div>
      </div>

      {/* ── Materiais de embalagem ────────────────────────── */}
      {materiais.length > 0 && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Materiais de embalagem</h2>
            <p className="text-xs text-muted">Caixas, fitas e outros consumíveis por unidade produzida</p>
          </div>

          <div className="relative">
            <label className="search-pill w-full" style={{ maxWidth: "none" }}>
              <Search className="size-4 shrink-0" strokeWidth={1.75} />
              <input
                ref={buscaMatRef}
                type="search"
                placeholder="Adicionar material…"
                value={buscaMat}
                onChange={(e) => {
                  setBuscaMat(e.target.value);
                  setDropMatOpen(true);
                }}
                onFocus={() => setDropMatOpen(true)}
                onBlur={() => setTimeout(() => setDropMatOpen(false), 150)}
              />
            </label>
            {dropMatOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-48 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
                {disponiveisMat.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">
                    {buscaMat ? "Nenhum material encontrado." : "Todos os materiais já foram adicionados."}
                  </p>
                ) : (
                  disponiveisMat.map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addMaterial(mat.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                    >
                      <span className="font-medium text-ink">{mat.nome}</span>
                      <span className="shrink-0 text-xs text-muted">{mat.unidade}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {(edit.materiaisNecessarios ?? []).length > 0 && (
            <ul className="space-y-2">
              {(edit.materiaisNecessarios ?? []).map((m, i) => {
                const mat = materiais.find((x) => x.id === m.materialId);
                const custoLinha = custoItemMaterial(m, materiais);
                return (
                  <li
                    key={m.materialId}
                    className="grid grid-cols-[minmax(0,1fr)_4.25rem_1.75rem] items-center gap-1 sm:grid-cols-[1fr_5rem_4.5rem_2.5rem] sm:gap-1.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate rounded-full bg-[#f4f5f7] px-3 py-2.5 text-sm font-medium text-ink sm:px-3.5">
                        {mat?.nome ?? "Material removido"}
                      </span>
                      {mat && (
                        <span className="mt-0.5 pl-3 text-[0.65rem] text-muted">{mat.unidade}</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Qtd"
                      className="field mt-0 px-2! text-center sm:px-3.5! sm:text-left"
                      value={m.quantidade || ""}
                      onChange={(e) => setLinhamat(i, { quantidade: Number(e.target.value) })}
                    />
                    <span className="hidden text-right text-xs font-medium text-muted sm:block">
                      {custoLinha > 0 ? mzn(Math.round(custoLinha)) : ""}
                    </span>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-full text-muted transition hover:text-strawberry"
                      onClick={() =>
                        setEdit({
                          ...edit,
                          materiaisNecessarios: (edit.materiaisNecessarios ?? []).filter((_, idx) => idx !== i),
                        })
                      }
                      aria-label="Remover"
                    >
                      <X className="size-4" strokeWidth={1.75} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Estatísticas em tempo real ─────────────────────── */}
      {(stats.custo > 0 || Number(edit.preco) > 0) && (
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Análise financeira</h2>
            <p className="text-xs text-muted">Actualiza em tempo real conforme preenche</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-2xl bg-[#f4f5f7] p-3">
              <p className="text-[0.7rem] font-medium text-muted">Custo de produção</p>
              <p className="mt-1 text-base font-semibold text-ink">
                {mzn(Math.round(stats.custo))}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f7] p-3">
              <p className="text-[0.7rem] font-medium text-muted">Lucro por unidade</p>
              <p className={`mt-1 text-base font-semibold ${stats.lucro >= 0 ? "text-mint" : "text-strawberry"}`}>
                {mzn(Math.round(stats.lucro))}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f7] p-3">
              <p className="text-[0.7rem] font-medium text-muted">Margem de lucro</p>
              <p className={`mt-1 text-base font-semibold ${stats.margem >= 50 ? "text-mint" : stats.margem >= 20 ? "text-caramel" : "text-strawberry"}`}>
                {stats.margem > 0 ? `${Math.round(stats.margem)}%` : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f7] p-3">
              <p className="text-[0.7rem] font-medium text-muted">Preço sugerido</p>
              <p className="mt-1 text-base font-semibold text-blueberry">
                {stats.custo > 0 ? mzn(stats.sugerido) : "—"}
              </p>
            </div>
          </div>
          {stats.custo > 0 && Number(edit.preco) > 0 && (
            <div className="mt-3">
              <div className="mb-1 flex items-baseline justify-between text-xs text-muted">
                <span>Custo</span>
                <span>Preço de venda</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[#ececee]">
                <div
                  className="absolute left-0 h-full rounded-full bg-strawberry"
                  style={{ width: `${Math.min(100, (stats.custo / Number(edit.preco)) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[0.7rem] text-muted">
                {Math.round((stats.custo / Number(edit.preco)) * 100)}% do preço vai para custos
              </p>
            </div>
          )}
        </div>
      )}

      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
