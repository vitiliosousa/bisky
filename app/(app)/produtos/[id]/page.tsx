"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, toast } from "@/components/ui";
import {
  custoItemMaterial,
  custoItemReceita,
  custoProduto,
  formatQty,
  margemLucro,
  precoSugerido,
} from "@/lib/cost";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { UtensilsCrossed } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ProdutoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { produtos, ingredientes, materiais, removeProduto } = useStore();
  const { confirm, dialog } = useConfirmDelete();

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

  const custo = custoProduto(produto, ingredientes, materiais);
  const margem = margemLucro(produto.preco, custo);
  const sugerido = precoSugerido(custo);
  const lucro = produto.preco - custo;
  const mats = produto.materiaisNecessarios ?? [];

  async function apagar() {
    if (!await confirm(produto!.nome)) return;
    try {
      await removeProduto(produto!.id);
      toast("Produto apagado.", "info");
      router.push("/produtos");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/produtos/${produto.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/produtos"
        backLabel="Produtos"
        editHref={editHref}
        onDelete={apagar}
      />

      <div className="card flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
          <UtensilsCrossed className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{produto.categoria}</p>
          <h1 className="truncate text-xl font-semibold text-ink sm:text-2xl">
            {produto.nome}
          </h1>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Preço de venda</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {mzn(produto.preco)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Custo</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {mzn(Math.round(custo))}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Lucro</p>
          <p
            className={`mt-1 text-lg font-semibold tracking-tight sm:text-2xl ${
              lucro >= 0 ? "text-mint" : "text-strawberry"
            }`}
          >
            {mzn(Math.round(lucro))}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Margem</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {margem.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="card">
        <p className="text-[0.7rem] font-medium text-muted">
          Preço sugerido (60%)
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-strawberry sm:text-2xl">
          {mzn(sugerido)}
        </p>
      </div>

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
              <p className="text-sm font-medium text-ink-soft">
                Custo ingredientes
              </p>
              <p className="text-base font-semibold text-ink">
                {mzn(
                  Math.round(
                    produto.receita.reduce(
                      (s, item) => s + custoItemReceita(item, ingredientes),
                      0,
                    ),
                  ),
                )}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Embalagem</h2>
            <p className="text-xs text-muted">Materiais e custo por unidade</p>
          </div>

          {mats.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Sem materiais de embalagem neste produto.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {mats.map((item, i) => {
                const mat = materiais.find((x) => x.id === item.materialId);
                const linhaCusto = custoItemMaterial(item, materiais);
                return (
                  <li
                    key={`${item.materialId}-${i}`}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-xs font-bold text-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {mat?.nome ?? "Material removido"}
                      </p>
                      <p className="text-xs text-muted">
                        {item.quantidade} {mat?.unidade ?? ""}
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

          {mats.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f4f5f7] px-4 py-3">
              <p className="text-sm font-medium text-ink-soft">Custo embalagem</p>
              <p className="text-base font-semibold text-ink">
                {mzn(
                  Math.round(
                    mats.reduce(
                      (s, item) => s + custoItemMaterial(item, materiais),
                      0,
                    ),
                  ),
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Custo total</p>
          <p className="text-xs text-muted">Ingredientes + embalagem</p>
        </div>
        <p className="text-lg font-semibold text-ink">
          {mzn(Math.round(custo))}
        </p>
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
                <p className="pt-0.5 text-sm leading-relaxed text-ink-soft">
                  {passo}
                </p>
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
  );
}
