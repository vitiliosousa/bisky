import type { ContaPagar, Ingrediente } from "./types";
import { hoje, maisDias } from "./format";

export type AlertaEstoque = {
  tipo: "estoque";
  id: string;
  ingrediente: Ingrediente;
};

export type AlertaConta = {
  tipo: "conta_atrasada" | "conta_proxima";
  id: string;
  conta: ContaPagar;
};

export type Alerta = AlertaEstoque | AlertaConta;

export function getAlertas(
  ingredientes: Ingrediente[],
  contasPagar: ContaPagar[],
) {
  const hojeISO = hoje();
  const limite = maisDias(hojeISO, 7);

  const estoque = ingredientes
    .filter((i) => i.quantidadeAtual < i.estoqueMinimo)
    .map(
      (ingrediente): AlertaEstoque => ({
        tipo: "estoque",
        id: `estoque-${ingrediente.id}`,
        ingrediente,
      }),
    );

  const atrasadas = contasPagar
    .filter((c) => !c.paga && c.vencimento < hojeISO)
    .map(
      (conta): AlertaConta => ({
        tipo: "conta_atrasada",
        id: `atrasada-${conta.id}`,
        conta,
      }),
    );

  const proximas = contasPagar
    .filter(
      (c) => !c.paga && c.vencimento >= hojeISO && c.vencimento <= limite,
    )
    .map(
      (conta): AlertaConta => ({
        tipo: "conta_proxima",
        id: `proxima-${conta.id}`,
        conta,
      }),
    );

  return {
    estoque,
    atrasadas,
    proximas,
    /** Alertas urgentes (badge do sino). */
    urgentes: [...estoque, ...atrasadas],
    /** Todos os alertas (página de notificações). */
    todos: [...estoque, ...atrasadas, ...proximas],
  };
}
