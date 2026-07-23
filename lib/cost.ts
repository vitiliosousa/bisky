import type {
  Ingrediente,
  ItemMaterial,
  ItemReceita,
  Material,
  Pedido,
  Produto,
  Unidade,
} from "./types";

const toGramsOrMl: Record<Unidade, number> = {
  kg: 1000,
  g: 1,
  l: 1000,
  ml: 1,
  un: 1,
};

/** Converte quantidade para a unidade base do ingrediente (kg/l/un). */
export function paraUnidadeIngrediente(
  quantidade: number,
  de: Unidade,
  para: Unidade,
): number {
  if (de === para) return quantidade;
  if (de === "un" || para === "un") return quantidade;
  const base = quantidade * toGramsOrMl[de];
  return base / toGramsOrMl[para];
}

export function custoUnitario(ing: Ingrediente): number {
  return ing.precoCompra / ing.quantidadeCompra;
}

export function custoItemReceita(
  item: ItemReceita,
  ingredientes: Ingrediente[],
): number {
  const ing = ingredientes.find((i) => i.id === item.ingredienteId);
  if (!ing) return 0;
  const qty = paraUnidadeIngrediente(item.quantidade, item.unidade, ing.unidade);
  return qty * custoUnitario(ing);
}

export function custoItemMaterial(
  item: ItemMaterial,
  materiais: Material[],
): number {
  const mat = materiais.find((m) => m.id === item.materialId);
  if (!mat) return 0;
  return item.quantidade * mat.precoUnitario;
}

export function custoProduto(
  produto: Produto,
  ingredientes: Ingrediente[],
  materiais: Material[] = [],
): number {
  const custoIng = produto.receita.reduce(
    (sum, item) => sum + custoItemReceita(item, ingredientes),
    0,
  );
  const custoMat = (produto.materiaisNecessarios ?? []).reduce(
    (sum, item) => sum + custoItemMaterial(item, materiais),
    0,
  );
  return custoIng + custoMat;
}

export function precoSugerido(custo: number, margem = 0.6): number {
  return Math.ceil(custo / (1 - margem) / 50) * 50;
}

export function margemLucro(preco: number, custo: number): number {
  if (preco <= 0) return 0;
  return ((preco - custo) / preco) * 100;
}

export type ConsumoLinha = {
  ingredienteId: string;
  nome: string;
  quantidade: number;
  unidade: Unidade;
};

export function consumoDoPedido(
  pedido: Pedido,
  produtos: Produto[],
  ingredientes: Ingrediente[],
): ConsumoLinha[] {
  const mapa = new Map<string, ConsumoLinha>();

  for (const item of pedido.itens) {
    const produto = produtos.find((p) => p.id === item.produtoId);
    if (!produto) continue;

    const receita = item.receitaAjustada ?? produto.receita;
    for (const r of receita) {
      const ing = ingredientes.find((i) => i.id === r.ingredienteId);
      if (!ing) continue;
      const qty =
        paraUnidadeIngrediente(r.quantidade, r.unidade, ing.unidade) *
        item.quantidade;
      const prev = mapa.get(ing.id);
      if (prev) {
        prev.quantidade += qty;
      } else {
        mapa.set(ing.id, {
          ingredienteId: ing.id,
          nome: ing.nome,
          quantidade: qty,
          unidade: ing.unidade,
        });
      }
    }
  }

  return [...mapa.values()];
}

export function formatQty(n: number, unidade: Unidade): string {
  const rounded =
    unidade === "un" ? Math.round(n) : Math.round(n * 1000) / 1000;
  return `${rounded} ${unidade}`;
}
