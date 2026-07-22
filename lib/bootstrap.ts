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
    contasPagar: data.contasPagar,
    movimentos: data.movimentos,
    eventos: data.eventos,
    perdas: data.perdas,
    materiais: data.materiais,
    gastoExtra: data.gastoExtra ?? {},
  };
}

export function mapProduto(p: Produto): Produto {
  return {
    ...p,
    receita: Array.isArray(p.receita) ? p.receita : [],
    modoPreparo: Array.isArray(p.modoPreparo) ? p.modoPreparo : [],
    materiaisNecessarios: Array.isArray(p.materiaisNecessarios)
      ? p.materiaisNecessarios
      : [],
  };
}

export function mapPedido(p: Pedido): Pedido {
  return {
    ...p,
    itens: Array.isArray(p.itens) ? p.itens : [],
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
