"use client";

import { Empty } from "@/components/Empty";
import { confirmDelete, toast } from "@/components/ui";
import { formatQty } from "@/lib/cost";
import { dataCurta } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Perda, Unidade } from "@/lib/types";
import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function nomePerda(
  p: Perda,
  ingredientes: { id: string; nome: string }[],
  produtos: { id: string; nome: string }[],
) {
  if (p.tipo === "produto") {
    return produtos.find((x) => x.id === p.produtoId)?.nome ?? "Produto removido";
  }
  return (
    ingredientes.find((x) => x.id === p.ingredienteId)?.nome ??
    "Ingrediente removido"
  );
}

export default function PerdasPage() {
  const { ingredientes, produtos, perdas, removePerda } = useStore();
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState(perdas[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return [...perdas]
      .filter((p) => {
        if (!q) return true;
        const nome = nomePerda(p, ingredientes, produtos).toLowerCase();
        return nome.includes(q) || p.motivo.toLowerCase().includes(q);
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [perdas, ingredientes, produtos, busca]);

  const perda = perdas.find((p) => p.id === sel) ?? filtered[0];
  const ing =
    perda?.tipo !== "produto" && perda?.ingredienteId
      ? ingredientes.find((i) => i.id === perda.ingredienteId)
      : undefined;
  const prod =
    perda?.tipo === "produto" && perda?.produtoId
      ? produtos.find((p) => p.id === perda.produtoId)
      : undefined;
  const nome = perda ? nomePerda(perda, ingredientes, produtos) : "";

  function selectPerda(id: string) {
    setSel(id);
    setMobileDetail(true);
  }

  async function apagar() {
    if (!perda) return;
    if (!confirmDelete(nome || "esta perda")) return;
    try {
      await removePerda(perda.id);
      setSel(perdas.find((p) => p.id !== perda.id)?.id ?? "");
      setMobileDetail(false);
      toast("Perda apagada.", "info");
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
            placeholder="Pesquisar perda…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <Link
          href="/perdas/novo"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/25 transition hover:brightness-110"
        >
          <Plus className="size-4" strokeWidth={2} />
          Nova perda
        </Link>
      </div>

      <div className="card p-2!">
        {filtered.length === 0 ? (
          <Empty
            message={busca ? "Nenhuma perda encontrada." : "Sem perdas registadas."}
            hint={busca ? undefined : "Registe a primeira perda."}
          />
        ) : (
          <ul>
            {filtered.map((p) => {
              const n = nomePerda(p, ingredientes, produtos);
              const active = perda?.id === p.id;
              const isProd = p.tipo === "produto";
              const qtyLabel = isProd
                ? `${p.quantidade} un`
                : formatQty(
                    p.quantidade,
                    ingredientes.find((x) => x.id === p.ingredienteId)
                      ?.unidade as Unidade,
                  );
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectPerda(p.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      active ? "bg-strawberry-soft" : "hover:bg-[#f4f5f7]"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? "bg-strawberry text-white"
                          : "bg-strawberry-soft text-strawberry"
                      }`}
                    >
                      {isProd ? (
                        <UtensilsCrossed className="size-4" strokeWidth={1.75} />
                      ) : (
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-ink">
                          {n}
                        </span>
                        <span className="shrink-0 rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[0.65rem] font-semibold text-muted">
                          {isProd ? "Produto" : "Ingrediente"}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {qtyLabel} · {p.motivo} · {dataCurta(p.data)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const detalhe = perda && (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMobileDetail(false)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink lg:hidden"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Perdas
        </button>
        <div className="flex items-center gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={apagar}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-strawberry-soft px-3.5 text-sm font-semibold text-strawberry transition hover:brightness-95"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
            Apagar
          </button>
        </div>
      </div>

      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
          {perda.tipo === "produto" ? (
            <UtensilsCrossed className="size-5" strokeWidth={1.75} />
          ) : (
            <Trash2 className="size-5" strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">{nome}</p>
          <p className="text-xs text-muted">
            {perda.tipo === "produto" ? "Produto" : "Ingrediente"} ·{" "}
            {dataCurta(perda.data)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Quantidade
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
            {perda.tipo === "produto"
              ? `${perda.quantidade} un`
              : formatQty(perda.quantidade, ing?.unidade as Unidade)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Unidade
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {perda.tipo === "produto" ? "un" : (ing?.unidade ?? "—")}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">Motivo</h2>
          <p className="text-xs text-muted">Porque saiu do estoque</p>
        </div>
        <p className="rounded-2xl bg-[#f4f5f7] px-4 py-3 text-sm font-medium text-ink">
          {perda.motivo}
        </p>
      </div>

      {ing && (
        <div className="card flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blueberry-soft text-blueberry">
            <Package className="size-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Stock actual</p>
            <p className="text-xs text-muted">
              {formatQty(ing.quantidadeAtual, ing.unidade)} disponíveis
            </p>
          </div>
          <Link
            href="/ingredientes"
            className="text-xs font-semibold text-strawberry hover:underline"
          >
            Ver ingredientes
          </Link>
        </div>
      )}

      {prod && (
        <div className="card flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blueberry-soft text-blueberry">
            <UtensilsCrossed className="size-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{prod.nome}</p>
            <p className="text-xs text-muted">
              Baixa da receita e materiais deste produto
            </p>
          </div>
          <Link
            href={`/produtos/${prod.id}`}
            className="text-xs font-semibold text-strawberry hover:underline"
          >
            Ver produto
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in">
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-4">
        {lista}
        {detalhe ?? (
          <div className="card flex items-center justify-center py-16 text-sm text-muted">
            Selecione uma perda para ver os detalhes.
          </div>
        )}
      </div>
      <div className="lg:hidden">{mobileDetail && perda ? detalhe : lista}</div>
    </div>
  );
}
