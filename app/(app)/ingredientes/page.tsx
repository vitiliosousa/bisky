"use client";

import { Empty } from "@/components/Empty";
import { confirmDelete, toast } from "@/components/ui";
import { custoUnitario, formatQty } from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function IngredientesPage() {
  const { ingredientes, upsertIngrediente, removeIngrediente } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "falta">("todos");
  const [sel, setSel] = useState(ingredientes[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [entradaQty, setEntradaQty] = useState("");
  const [entradaPreco, setEntradaPreco] = useState("");

  const falta = ingredientes.filter((i) => i.quantidadeAtual < i.estoqueMinimo);

  const filtered = useMemo(() => {
    return ingredientes
      .filter((i) => {
        const matchBusca =
          !busca || i.nome.toLowerCase().includes(busca.toLowerCase());
        const matchFiltro =
          filtro === "todos" || i.quantidadeAtual < i.estoqueMinimo;
        return matchBusca && matchFiltro;
      })
      .sort((a, b) => {
        const aFalta = a.quantidadeAtual < a.estoqueMinimo;
        const bFalta = b.quantidadeAtual < b.estoqueMinimo;
        if (aFalta !== bFalta) return aFalta ? -1 : 1;
        return a.nome.localeCompare(b.nome, "pt");
      });
  }, [ingredientes, busca, filtro]);

  const ing =
    ingredientes.find((i) => i.id === sel) ?? filtered[0] ?? undefined;

  function selectIng(id: string) {
    setSel(id);
    setEntradaQty("");
    setEntradaPreco("");
    setMobileDetail(true);
  }

  async function apagar() {
    if (!ing) return;
    if (!confirmDelete(ing.nome)) return;
    try {
      await removeIngrediente(ing.id);
      setSel(ingredientes.find((i) => i.id !== ing.id)?.id ?? "");
      setMobileDetail(false);
      toast("Ingrediente removido.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const lista = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="search-pill w-full min-w-0 sm:flex-1"
          style={{ maxWidth: "none" }}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar ingrediente…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "todos" | "falta")}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar estoque"
          >
            <option value="todos">Todos</option>
            <option value="falta">
              Em falta{falta.length > 0 ? ` (${falta.length})` : ""}
            </option>
          </select>
          <Link
            href="/ingredientes/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={busca || filtro !== "todos" ? "Nenhum ingrediente encontrado." : "Sem ingredientes ainda."}
            hint={busca || filtro !== "todos" ? undefined : "Adicione o seu primeiro ingrediente."}
          />
        </div>
      ) : (
        <div className="card p-2!">
          <ul className="space-y-0.5">
            {filtered.map((i) => {
              const baixo = i.quantidadeAtual < i.estoqueMinimo;
              const isActive = ing?.id === i.id;
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => selectIng(i.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${
                      isActive ? "bg-strawberry-soft" : "hover:bg-[#f8f8f9]"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        baixo
                          ? "bg-strawberry-soft text-strawberry"
                          : "bg-blueberry text-white"
                      }`}
                    >
                      {baixo ? (
                        <AlertTriangle className="size-4" strokeWidth={1.75} />
                      ) : (
                        <Package className="size-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          isActive
                            ? "text-strawberry"
                            : baixo
                              ? "text-strawberry"
                              : "text-ink group-hover:text-strawberry"
                        }`}
                      >
                        {i.nome}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        mín. {i.estoqueMinimo} {i.unidade}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        baixo ? "text-strawberry" : "text-ink"
                      }`}
                    >
                      {i.quantidadeAtual}{" "}
                      <span className="text-xs font-normal text-muted">
                        {i.unidade}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const detalhe = ing && (() => {
    const baixo = ing.quantidadeAtual < ing.estoqueMinimo;
    const unitario = custoUnitario(ing);
    const valorStock = ing.quantidadeAtual * unitario;

    return (
      <div className="flex flex-col gap-5">
        <div className="card flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDetail(false)}
            className="shrink-0 text-muted transition hover:text-ink lg:hidden"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
              baixo
                ? "bg-strawberry-soft text-strawberry"
                : "bg-blueberry text-white"
            }`}
          >
            {baixo ? (
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            ) : (
              <Package className="size-5" strokeWidth={1.75} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            {baixo && (
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-strawberry">
                Abaixo do mínimo
              </p>
            )}
            <p className="truncate text-lg font-semibold text-ink">{ing.nome}</p>
            <p className="text-xs text-muted">
              {formatQty(ing.quantidadeAtual, ing.unidade)} em stock
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/ingredientes/${ing.id}/editar`}
              className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-[#f4f5f7] hover:text-ink"
              aria-label="Editar"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={apagar}
              className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-strawberry-soft hover:text-strawberry"
              aria-label="Apagar"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
            <p
              className={`mt-0.5 text-base font-semibold ${
                baixo ? "text-strawberry" : "text-ink"
              }`}
            >
              {formatQty(ing.quantidadeAtual, ing.unidade)}
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Mínimo</p>
            <p className="mt-0.5 text-base font-semibold text-ink">
              {formatQty(ing.estoqueMinimo, ing.unidade)}
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Custo unitário</p>
            <p className="mt-0.5 text-base font-semibold text-ink">
              {mzn(Math.round(unitario))}
              <span className="text-xs font-normal text-muted">/{ing.unidade}</span>
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Valor em stock</p>
            <p className="mt-0.5 text-base font-semibold text-caramel">
              {mzn(Math.round(valorStock))}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-ink">Última compra</h2>
            <p className="text-xs text-muted">Preço e tamanho do lote</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[0.7rem] font-medium text-muted">Preço do lote</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {mzn(ing.precoCompra)}
              </p>
            </div>
            <div>
              <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {formatQty(ing.quantidadeCompra, ing.unidade)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-2.5">
            <p className="text-sm font-semibold text-ink">Registrar compra</p>
            <p className="text-xs text-muted">
              Adiciona ao stock e actualiza o custo unitário
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="number"
              min="0"
              step="any"
              placeholder={`Qtd. (${ing.unidade})`}
              value={entradaQty}
              onChange={(e) => setEntradaQty(e.target.value)}
              className="field min-w-0 flex-1"
            />
            <input
              type="number"
              min="0"
              placeholder="Preço do lote (MZN)"
              value={entradaPreco}
              onChange={(e) => setEntradaPreco(e.target.value)}
              className="field min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={async () => {
                const qty = Number(entradaQty);
                const preco = Number(entradaPreco);
                if (!qty || qty <= 0) {
                  toast("Indique a quantidade comprada.", "error");
                  return;
                }
                if (!preco || preco <= 0) {
                  toast("Indique o preço do lote.", "error");
                  return;
                }
                try {
                  await upsertIngrediente({
                    ...ing,
                    quantidadeAtual: ing.quantidadeAtual + qty,
                    quantidadeCompra: qty,
                    precoCompra: preco,
                  });
                  setEntradaQty("");
                  setEntradaPreco("");
                  toast(`Compra registada: +${qty} ${ing.unidade}.`, "success");
                } catch (err) {
                  toast(
                    err instanceof Error ? err.message : "Erro ao actualizar.",
                    "error",
                  );
                }
              }}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Check className="size-4" strokeWidth={2} />
              Registrar
            </button>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div className="animate-in">
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:h-[calc(100dvh-8rem)] lg:overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">{lista}</div>
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">
          {detalhe ?? (
            <div className="card flex items-center justify-center py-16 text-sm text-muted">
              Selecione um ingrediente para ver os detalhes.
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        {mobileDetail && ing ? detalhe : lista}
      </div>
    </div>
  );
}
