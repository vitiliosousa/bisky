export type Unidade = "kg" | "g" | "l" | "ml" | "un";

export type EstadoPedido =
  | "pendente"
  | "em_producao"
  | "pronto"
  | "entregue"
  | "cancelado";

export type TipoEvento = "pedido" | "casamento" | "festa" | "aniversario";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  quantidadeAtual: number;
  unidade: Unidade;
  precoCompra: number; // total pago pelo lote
  quantidadeCompra: number; // tamanho do lote na mesma unidade
  estoqueMinimo: number;
}

export interface ItemReceita {
  ingredienteId: string;
  quantidade: number;
  unidade: Unidade;
}

export interface ItemMaterial {
  materialId: string;
  quantidade: number;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  receita: ItemReceita[];
  modoPreparo?: string[];
  materiaisNecessarios?: ItemMaterial[];
}

export interface ItemPedido {
  produtoId: string;
  quantidade: number;
  /** Receita ajustada só para este pedido (ex.: mais chocolate, menos açúcar). */
  receitaAjustada?: ItemReceita[];
}

export interface Pedido {
  id: string;
  clienteId: string;
  itens: ItemPedido[];
  dataEntrega: string; // YYYY-MM-DD
  hora: string;
  valor: number;
  pago: number;
  estado: EstadoPedido;
  criadoEm: string;
  /** True depois de o consumo da receita ser aplicado ao estoque. */
  estoqueConsumido?: boolean;
}

export interface MovimentoCaixa {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  vencimento: string;
  paga: boolean;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo: TipoEvento;
  pedidoId?: string;
}

export interface Perda {
  id: string;
  ingredienteId: string;
  quantidade: number;
  motivo: string;
  data: string;
}

export interface Material {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  estoqueMinimo: number;
}
