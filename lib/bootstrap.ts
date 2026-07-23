import type {
  Cliente,
  ContaPagar,
  EventoCalendario,
  Ingrediente,
  Material,
  MovimentoCaixa,
  Pedido,
  Perda,
  Produto,
} from "./types";
import type { PerfilUtilizador } from "./profile";

export type BootstrapData = {
  clientes: Cliente[];
  produtos: Produto[];
  ingredientes: Ingrediente[];
  pedidos: Pedido[];
  contasPagar: ContaPagar[];
  movimentos: MovimentoCaixa[];
  eventos: EventoCalendario[];
  perdas: Perda[];
  materiais: Material[];
  profile: {
    nome: string;
    telefone: string;
    endereco: string;
    negocio: string;
    papel: string;
    bio: string;
  } | null;
  gastoExtra: Record<string, { pedidos: number; gasto: number }>;
};

export function mapBootstrap(data: BootstrapData) {
  return {
    clientes: data.clientes,
    produtos: data.produtos.map(mapProduto),
    ingredientes: data.ingredientes,
    pedidos: data.pedidos.map(mapPedido),
    contasPagar: data.contasPagar.map((c) => ({
      ...c,
      recorrente: Boolean(c.recorrente),
    })),
    movimentos: data.movimentos,
    eventos: data.eventos,
    perdas: data.perdas.map((p) => ({
      ...p,
      tipo: p.tipo ?? (p.produtoId ? "produto" : "ingrediente"),
    })),
    materiais: data.materiais,
    gastoExtra: data.gastoExtra ?? {},
  };
}

/** Prisma Json / seed com JSON.stringify pode vir como array ou string. */
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapProduto(p: Produto): Produto {
  return {
    ...p,
    receita: asArray(p.receita),
    modoPreparo: asArray(p.modoPreparo),
    materiaisNecessarios: asArray(p.materiaisNecessarios),
  };
}

export function mapPedido(p: Pedido): Pedido {
  return {
    ...p,
    itens: asArray(p.itens),
    estoqueConsumido: Boolean(p.estoqueConsumido),
  };
}

export function profileFromBootstrap(
  profile: BootstrapData["profile"],
  email?: string,
): PerfilUtilizador {
  return {
    nome: profile?.nome ?? "Utilizador",
    email: email ?? "",
    telefone: profile?.telefone ?? "",
    endereco: profile?.endereco ?? "",
    negocio: profile?.negocio ?? "",
    papel: profile?.papel ?? "Confeiteira",
    bio: profile?.bio ?? "",
  };
}
