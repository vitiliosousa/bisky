"use client";

import { confirmDelete, toast } from "@/components/ui";
import {
  custoItemReceita,
  custoProduto,
  formatQty,
  margemLucro,
  precoSugerido,
} from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  Pencil,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProdutoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { produtos, ingredientes, removeProduto } = useStore();

  const produto = produtos.find((p) => p.id === params.id);

  if (!produto) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Produto não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const custo = custoProduto(produto, ingredientes);
  const margem = margemLucro(produto.preco, custo);
  const sugerido = precoSugerido(custo);
  const lucro = produto.preco - custo;

  async function apagar() {
    if (!confirmDelete(produto!.nome)) return;
    try {
      await removeProduto(produto!.id);
      toast("Produto apagado.", "info");
      router.push("/produtos");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  return (
    <div className="animate-in space-y-5">
      {/* ── Cabeçalho do produto ───────────────────────────── */}
      <div className="card flex items-center gap-3 sm:items-start sm:gap-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry sm:size-16">
          <UtensilsCrossed className="size-5 sm:size-8" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted sm:text-xs">
            {produto.categoria}
          </p>
          <h1 className="mt-0.5 truncate font-(family-name:--font-display) text-lg font-semibold tracking-tight text-ink sm:mt-1 sm:text-3xl sm:whitespace-normal">
            {produto.nome}
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Preço de venda
          </p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-ink sm:text-3xl">
            {mzn(produto.preco)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <Link
            href={`/produtos/${produto.id}/editar`}
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

      {/* ── Preços + margem ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Custo de produção
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {mzn(Math.round(custo))}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Lucro por unidade
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-mint sm:text-2xl">
            {mzn(Math.round(lucro))}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Margem de lucro
          </p>
          <p className={`mt-1 text-lg font-semibold tracking-tight sm:text-2xl ${
            margem >= 50 ? "text-mint" : margem >= 20 ? "text-caramel" : "text-strawberry"
          }`}>
            {margem.toFixed(0)}%
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Preço sugerido (60%)
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
            {mzn(sugerido)}
          </p>
        </div>
      </div>

      {/* ── Receita + Modo de preparo ──────────────────────── */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Receita</h2>
            <p className="text-xs text-muted">
              Ingredientes e custo de cada item
            </p>
          </div>

          {produto.receita.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Este produto ainda não tem receita. Edite para adicionar
              ingredientes.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {produto.receita.map((item, i) => {
                const ing = ingredientes.find((x) => x.id === item.ingredienteId);
                const linhaCusto = custoItemReceita(item, ingredientes);
                return (
                  <li
                    key={`${item.ingredienteId}-${i}`}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-xs font-bold text-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {ing?.nome ?? "Ingrediente removido"}
                      </p>
                      <p className="text-xs text-muted">
                        {formatQty(item.quantidade, item.unidade)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ink">
                      {mzn(Math.round(linhaCusto))}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          {produto.receita.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f4f5f7] px-4 py-3">
              <p className="text-sm font-medium text-ink-soft">Custo total</p>
              <p className="text-base font-semibold text-ink">
                {mzn(Math.round(custo))}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Modo de preparo</h2>
            <p className="text-xs text-muted">Passo a passo da receita</p>
          </div>
          {produto.modoPreparo && produto.modoPreparo.length > 0 ? (
            <ol className="space-y-3">
              {produto.modoPreparo.map((passo, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-ink-soft">{passo}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Ainda sem modo de preparo. Edite o produto para adicionar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
