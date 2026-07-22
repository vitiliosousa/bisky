import type { EstadoPedido, TipoEvento } from "./types";

export function mzn(valor: number): string {
  return (
    new Intl.NumberFormat("pt-MZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor) + " MZN"
  );
}

export function dataCurta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function dataExtenso(iso: string): string {
  const date = new Date(iso + "T12:00:00");
  return date.toLocaleDateString("pt-MZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export const labelsEstado: Record<EstadoPedido, string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const labelsEvento: Record<TipoEvento, string> = {
  pedido: "Pedido",
  casamento: "Casamento",
  festa: "Festa",
  aniversario: "Aniversário",
};

export const HOJE = "2026-07-20";
