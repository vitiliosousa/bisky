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

/** Só usamos Aberto / Levado na UI; estados antigos do enum mapeiam para Aberto. */
export const labelsEstado: Record<EstadoPedido, string> = {
  pendente: "Aberto",
  em_producao: "Aberto",
  pronto: "Aberto",
  entregue: "Levado",
  cancelado: "Cancelado",
};

export function pedidoAberto(estado: EstadoPedido): boolean {
  return estado !== "entregue" && estado !== "cancelado";
}

export const labelsEvento: Record<TipoEvento, string> = {
  pedido: "Pedido",
  casamento: "Casamento",
  festa: "Festa",
  aniversario: "Aniversário",
};

/** Data local de hoje no formato YYYY-MM-DD. */
export function hoje(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Soma dias a uma data ISO (YYYY-MM-DD). */
export function maisDias(iso: string, dias: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Soma meses a uma data ISO (YYYY-MM-DD). */
export function maisMeses(iso: string, meses: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setMonth(d.getMonth() + meses);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
