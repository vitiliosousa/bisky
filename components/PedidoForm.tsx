"use client";

import { FormActions, toast, type FormSubmit } from "@/components/ui";
import { hoje } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ItemPedido, ItemReceita, Pedido, Unidade } from "@/lib/types";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const UNIDADES: Unidade[] = ["g", "kg", "ml", "l", "un"];

export type PedidoDraft = Omit<Pedido, "id" | "criadoEm"> & { id?: string };

export function novoPedidoDraft(): PedidoDraft {
  return {
    clienteId: "",
    itens: [],
    dataEntrega: hoje(),
    hora: "15:00",
    valor: 0,
    pago: 0,
    estado: "pendente",
  };
}

export function PedidoForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: PedidoDraft;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { clientes, produtos, ingredientes, upsertPedido, upsertCliente } =
    useStore();
  const [edit, setEdit] = useState<PedidoDraft>(initial);

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteDropOpen, setClienteDropOpen] = useState(false);
  /** Nome digitado para cliente ainda não cadastrado. */
  const [clienteNovoNome, setClienteNovoNome] = useState("");

  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtoDropOpen, setProdutoDropOpen] = useState(false);

  // Índice do item com o painel de ingredientes aberto
  const [itemAberto, setItemAberto] = useState<number | null>(null);
  const [buscaIng, setBuscaIng] = useState("");
  const [ingDropOpen, setIngDropOpen] = useState(false);

  const clienteSel = clientes.find((c) => c.id === edit.clienteId);
  const nomeClienteLivre = clienteNovoNome.trim();

  const clientesFiltrados = useMemo(
    () =>
      clientes.filter((c) =>
        c.nome.toLowerCase().includes(buscaCliente.toLowerCase()),
      ),
    [clientes, buscaCliente],
  );

  const podeCriarCliente =
    buscaCliente.trim().length > 0 &&
    !clientes.some(
      (c) => c.nome.toLowerCase() === buscaCliente.trim().toLowerCase(),
    );

  const produtosFiltrados = useMemo(
    () =>
      produtos.filter((p) =>
        p.nome.toLowerCase().includes(buscaProduto.toLowerCase()),
      ),
    [produtos, buscaProduto],
  );

  function recalcValor(itens: ItemPedido[]) {
    return itens.reduce((s, i) => {
      const pr = produtos.find((p) => p.id === i.produtoId);
      return s + (pr?.preco ?? 0) * i.quantidade;
    }, 0);
  }

  function setItens(itens: ItemPedido[]) {
    setEdit({ ...edit, itens, valor: recalcValor(itens) });
  }

  function addProduto(produtoId: string) {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;
    const itens = [
      ...edit.itens,
      {
        produtoId,
        quantidade: 1,
        receitaAjustada: produto.receita.map((r) => ({ ...r })),
      },
    ];
    setItens(itens);
    setBuscaProduto("");
    setProdutoDropOpen(false);
    setItemAberto(itens.length - 1);
  }

  function receitaDoItem(item: ItemPedido): ItemReceita[] {
    if (item.receitaAjustada) return item.receitaAjustada;
    const produto = produtos.find((p) => p.id === item.produtoId);
    return produto?.receita.map((r) => ({ ...r })) ?? [];
  }

  function setReceitaDoItem(i: number, receita: ItemReceita[]) {
    const itens = edit.itens.map((item, idx) =>
      idx === i ? { ...item, receitaAjustada: receita } : item,
    );
    setEdit({ ...edit, itens });
  }

  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    let clienteId = edit.clienteId;
    const nomeLivre = (clienteNovoNome || buscaCliente).trim();
    if (!clienteId && nomeLivre) {
      const existente = clientes.find(
        (c) => c.nome.toLowerCase() === nomeLivre.toLowerCase(),
      );
      if (existente) {
        clienteId = existente.id;
      } else {
        try {
          const criado = await upsertCliente({
            nome: nomeLivre,
            telefone: "",
            endereco: "",
          });
          clienteId = criado.id;
        } catch (err) {
          toast(
            err instanceof Error ? err.message : "Erro ao criar cliente.",
            "error",
          );
          return;
        }
      }
    }
    if (!clienteId) {
      toast("Indique o nome do cliente.", "info");
      return;
    }
    const itens = edit.itens.filter((i) => i.quantidade > 0 && i.produtoId);
    if (itens.length === 0) {
      toast("Adicione pelo menos um produto.", "info");
      return;
    }
    setLoading(true);
    try {
      await upsertPedido({
        ...edit,
        clienteId,
        itens: itens.map((i) => ({
          ...i,
          receitaAjustada: i.receitaAjustada?.filter((r) => r.quantidade > 0),
        })),
        valor: Number(edit.valor) || recalcValor(itens),
        pago: Number(edit.pago) || 0,
        estado: edit.id ? edit.estado : "pendente",
      });
      toast(edit.id ? "Pedido atualizado." : "Pedido criado.");
      onDone();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao guardar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* ── Dados do pedido ────────────────────────────────── */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Dados do pedido</h2>
          <p className="text-xs text-muted">Cliente, entrega e pagamento</p>
        </div>

        <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
          <div className="lbl sm:col-span-2">
            Cliente
            <div className="relative mt-1.5">
              <label className="search-pill w-full" style={{ maxWidth: "none" }}>
                <Search className="size-4 shrink-0" strokeWidth={1.75} />
                <input
                  type="search"
                  placeholder={
                    clienteSel
                      ? clienteSel.nome
                      : nomeClienteLivre
                        ? nomeClienteLivre
                        : "Nome do cliente…"
                  }
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    setClienteDropOpen(true);
                    // ao digitar, deixa de forçar o cliente seleccionado
                    if (edit.clienteId) {
                      setEdit({ ...edit, clienteId: "" });
                    }
                    setClienteNovoNome("");
                  }}
                  onFocus={() => setClienteDropOpen(true)}
                  onBlur={() => setTimeout(() => setClienteDropOpen(false), 150)}
                />
              </label>
              {clienteDropOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-56 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
                  {podeCriarCliente && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setClienteNovoNome(buscaCliente.trim());
                        setEdit({ ...edit, clienteId: "" });
                        setBuscaCliente("");
                        setClienteDropOpen(false);
                      }}
                      className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-strawberry transition hover:bg-strawberry-soft"
                    >
                      Usar «{buscaCliente.trim()}» (novo cliente)
                    </button>
                  )}
                  {clientesFiltrados.length === 0 && !podeCriarCliente ? (
                    <p className="px-4 py-3 text-sm text-muted">
                      Escreva o nome do cliente.
                    </p>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setEdit({ ...edit, clienteId: c.id });
                          setClienteNovoNome("");
                          setBuscaCliente("");
                          setClienteDropOpen(false);
                        }}
                        className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7] ${
                          c.id === edit.clienteId
                            ? "bg-strawberry-soft font-semibold text-strawberry"
                            : "text-ink"
                        }`}
                      >
                        {c.nome}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {clienteSel ? (
              <p className="mt-1.5 text-xs text-muted">
                Selecionado:{" "}
                <span className="font-semibold text-ink">{clienteSel.nome}</span>
              </p>
            ) : nomeClienteLivre ? (
              <p className="mt-1.5 text-xs text-muted">
                Novo cliente:{" "}
                <span className="font-semibold text-ink">{nomeClienteLivre}</span>
                {" · "}será cadastrado ao guardar
              </p>
            ) : null}
          </div>

          <label className="lbl">
            Data de entrega
            <input
              type="date"
              className="field"
              required
              value={edit.dataEntrega}
              onChange={(e) => setEdit({ ...edit, dataEntrega: e.target.value })}
            />
          </label>
          <label className="lbl">
            Hora
            <input
              type="time"
              className="field"
              value={edit.hora}
              onChange={(e) => setEdit({ ...edit, hora: e.target.value })}
            />
          </label>
          <label className="lbl">
            Valor (MZN)
            <input
              type="number"
              min={0}
              className="field"
              value={edit.valor || ""}
              onChange={(e) => setEdit({ ...edit, valor: Number(e.target.value) })}
            />
          </label>
          <label className="lbl">
            Já pago (MZN)
            <input
              type="number"
              min={0}
              className="field"
              value={edit.pago || ""}
              onChange={(e) => setEdit({ ...edit, pago: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* ── Produtos ───────────────────────────────────────── */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Produtos</h2>
          <p className="text-xs text-muted">
            Pesquise para adicionar. Toque num produto para ajustar os
            ingredientes deste pedido.
          </p>
        </div>

        <div className="relative">
          <label className="search-pill w-full" style={{ maxWidth: "none" }}>
            <Search className="size-4 shrink-0" strokeWidth={1.75} />
            <input
              type="search"
              placeholder="Pesquisar produto para adicionar…"
              value={buscaProduto}
              onChange={(e) => {
                setBuscaProduto(e.target.value);
                setProdutoDropOpen(true);
              }}
              onFocus={() => setProdutoDropOpen(true)}
              onBlur={() => setTimeout(() => setProdutoDropOpen(false), 150)}
            />
          </label>
          {produtoDropOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-56 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
              {produtosFiltrados.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">
                  Nenhum produto encontrado.
                </p>
              ) : (
                produtosFiltrados.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addProduto(p.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                  >
                    <span className="min-w-0 truncate font-medium text-ink">
                      {p.nome}
                    </span>
                    <Plus className="size-3.5 shrink-0 text-strawberry" strokeWidth={2.25} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {edit.itens.length === 0 ? (
          <p className="rounded-2xl bg-[#f4f5f7] px-4 py-6 text-center text-sm text-muted">
            Ainda sem produtos. Pesquise acima para adicionar.
          </p>
        ) : (
          <ul className="space-y-2">
            {edit.itens.map((item, i) => {
              const produto = produtos.find((p) => p.id === item.produtoId);
              const receita = receitaDoItem(item);
              const aberto = itemAberto === i;
              const ingDisponiveis = ingredientes.filter(
                (ing) =>
                  !receita.some((r) => r.ingredienteId === ing.id) &&
                  ing.nome.toLowerCase().includes(buscaIng.toLowerCase()),
              );
              return (
                <li key={`${item.produtoId}-${i}`} className="rounded-2xl bg-[#f8f8f9]">
                  {/* Linha do produto */}
                  <div className="flex items-center gap-2 p-2.5 sm:gap-3 sm:p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setItemAberto(aberto ? null : i);
                        setBuscaIng("");
                        setIngDropOpen(false);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted transition ${aberto ? "rotate-180" : ""}`}
                        strokeWidth={1.75}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {produto?.nome ?? "?"}
                        </span>
                        <span className="block truncate text-[0.7rem] text-muted">
                          {receita.length}{" "}
                          {receita.length === 1 ? "ingrediente" : "ingredientes"}
                        </span>
                      </span>
                    </button>
                    <input
                      type="number"
                      min={1}
                      aria-label="Quantidade do produto"
                      className="field mt-0! h-9! w-14! shrink-0 px-2! text-center text-sm sm:w-16!"
                      value={item.quantidade || ""}
                      onChange={(e) => {
                        const itens = [...edit.itens];
                        itens[i] = { ...item, quantidade: Number(e.target.value) };
                        setItens(itens);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setItens(edit.itens.filter((_, idx) => idx !== i));
                        if (itemAberto === i) setItemAberto(null);
                        else if (itemAberto !== null && itemAberto > i) {
                          setItemAberto(itemAberto - 1);
                        }
                      }}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-strawberry"
                      aria-label="Remover produto"
                    >
                      <X className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* Ingredientes do item */}
                  {aberto && (
                    <div className="space-y-2 border-t border-line bg-[#f4f5f7]/50 p-2.5 sm:p-3">
                      {receita.length === 0 ? (
                        <p className="rounded-xl bg-white px-3 py-4 text-center text-xs text-muted">
                          Este produto não tem ingredientes definidos.
                        </p>
                      ) : (
                        <ul className="max-w-md space-y-1.5">
                          {receita.map((r, ri) => {
                            const ing = ingredientes.find(
                              (x) => x.id === r.ingredienteId,
                            );
                            return (
                              <li
                                key={r.ingredienteId}
                                className="flex items-center gap-1.5 rounded-2xl bg-white p-1.5 sm:gap-2 sm:p-2"
                              >
                                <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium text-ink sm:px-2.5">
                                  {ing?.nome ?? "Ingrediente removido"}
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  aria-label={`Quantidade de ${ing?.nome ?? "ingrediente"}`}
                                  className="field mt-0! h-9! w-14! shrink-0 bg-[#f4f5f7] px-1.5! text-center text-sm sm:w-16!"
                                  value={r.quantidade || ""}
                                  onChange={(e) => {
                                    const nova = receita.map((x, idx) =>
                                      idx === ri
                                        ? { ...x, quantidade: Number(e.target.value) }
                                        : x,
                                    );
                                    setReceitaDoItem(i, nova);
                                  }}
                                />
                                <select
                                  aria-label={`Unidade de ${ing?.nome ?? "ingrediente"}`}
                                  className="field mt-0! h-9! w-[4.5rem]! shrink-0 bg-[#f4f5f7] pl-2! pr-6! text-sm"
                                  style={{ backgroundPosition: "right 0.45rem center" }}
                                  value={r.unidade}
                                  onChange={(e) => {
                                    const nova = receita.map((x, idx) =>
                                      idx === ri
                                        ? { ...x, unidade: e.target.value as Unidade }
                                        : x,
                                    );
                                    setReceitaDoItem(i, nova);
                                  }}
                                >
                                  {UNIDADES.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReceitaDoItem(
                                      i,
                                      receita.filter((_, idx) => idx !== ri),
                                    )
                                  }
                                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-strawberry"
                                  aria-label="Remover ingrediente"
                                >
                                  <X className="size-4" strokeWidth={1.75} />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Adicionar ingrediente */}
                      <div className="relative max-w-md">
                        <label
                          className="search-pill w-full bg-white"
                          style={{ maxWidth: "none" }}
                        >
                          <Search className="size-4 shrink-0" strokeWidth={1.75} />
                          <input
                            type="search"
                            placeholder="Adicionar ingrediente…"
                            value={buscaIng}
                            onChange={(e) => {
                              setBuscaIng(e.target.value);
                              setIngDropOpen(true);
                            }}
                            onFocus={() => setIngDropOpen(true)}
                            onBlur={() =>
                              setTimeout(() => setIngDropOpen(false), 150)
                            }
                          />
                        </label>
                        {ingDropOpen && (
                          <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-48 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
                            {ingDisponiveis.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-muted">
                                {buscaIng
                                  ? "Nenhum ingrediente encontrado."
                                  : "Todos os ingredientes já foram adicionados."}
                              </p>
                            ) : (
                              ingDisponiveis.map((ing) => (
                                <button
                                  key={ing.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setReceitaDoItem(i, [
                                      ...receita,
                                      {
                                        ingredienteId: ing.id,
                                        quantidade: 0,
                                        unidade: ing.unidade,
                                      },
                                    ]);
                                    setBuscaIng("");
                                    setIngDropOpen(false);
                                  }}
                                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f7]"
                                >
                                  <span className="font-medium text-ink">
                                    {ing.nome}
                                  </span>
                                  <Plus
                                    className="size-3.5 shrink-0 text-strawberry"
                                    strokeWidth={2.25}
                                  />
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <FormActions onCancel={onCancel} loading={loading} />
    </form>
  );
}
