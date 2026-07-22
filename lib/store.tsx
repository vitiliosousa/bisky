"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { consumoDoPedido } from "./cost";
import {
  clientes as clientesSeed,
  contasPagar as contasPagarSeed,
  eventos as eventosSeed,
  gastoHistoricoExtra,
  ingredientes as ingredientesSeed,
  materiais as materiaisSeed,
  movimentosCaixa as movimentosSeed,
  pedidos as pedidosSeed,
  perdas as perdasSeed,
  produtos as produtosSeed,
} from "./mock-data";
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

function nid(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

type Store = {
  clientes: Cliente[];
  produtos: Produto[];
  ingredientes: Ingrediente[];
  pedidos: Pedido[];
  contasPagar: ContaPagar[];
  movimentos: MovimentoCaixa[];
  eventos: EventoCalendario[];
  perdas: Perda[];
  materiais: Material[];
  gastoExtra: Record<string, { pedidos: number; gasto: number }>;
  // clientes
  upsertCliente: (c: Omit<Cliente, "id"> & { id?: string }) => void;
  removeCliente: (id: string) => void;
  // produtos
  upsertProduto: (p: Omit<Produto, "id"> & { id?: string }) => void;
  removeProduto: (id: string) => void;
  // ingredientes
  upsertIngrediente: (i: Omit<Ingrediente, "id"> & { id?: string }) => void;
  removeIngrediente: (id: string) => void;
  // pedidos
  upsertPedido: (p: Omit<Pedido, "id" | "criadoEm"> & { id?: string; criadoEm?: string }) => void;
  removePedido: (id: string) => void;
  atualizarEstado: (pedidoId: string, estado: Pedido["estado"]) => void;
  consumirPedido: (pedidoId: string) => { ok: boolean; msg: string };
  // caixa
  upsertMovimento: (m: Omit<MovimentoCaixa, "id"> & { id?: string }) => void;
  removeMovimento: (id: string) => void;
  // contas pagar
  upsertContaPagar: (c: Omit<ContaPagar, "id"> & { id?: string }) => void;
  removeContaPagar: (id: string) => void;
  // eventos
  upsertEvento: (e: Omit<EventoCalendario, "id"> & { id?: string }) => void;
  removeEvento: (id: string) => void;
  // perdas
  registarPerda: (p: Omit<Perda, "id">) => void;
  removePerda: (id: string) => void;
  // materiais
  upsertMaterial: (m: Omit<Material, "id"> & { id?: string }) => void;
  removeMaterial: (id: string) => void;
};

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState(clientesSeed);
  const [produtos, setProdutos] = useState(produtosSeed);
  const [ingredientes, setIngredientes] = useState(ingredientesSeed);
  const [pedidos, setPedidos] = useState(pedidosSeed);
  const [contasPagar, setContasPagar] = useState(contasPagarSeed);
  const [movimentos, setMovimentos] = useState(movimentosSeed);
  const [eventos, setEventos] = useState(eventosSeed);
  const [perdas, setPerdas] = useState<Perda[]>(perdasSeed);
  const [materiais, setMateriais] = useState<Material[]>(materiaisSeed);
  const [gastoExtra] = useState(gastoHistoricoExtra);

  const upsertCliente = useCallback(
    (c: Omit<Cliente, "id"> & { id?: string }) => {
      setClientes((prev) => {
        if (c.id) return prev.map((x) => (x.id === c.id ? { ...x, ...c, id: c.id } : x));
        return [...prev, { ...c, id: nid("c") }];
      });
    },
    [],
  );
  const removeCliente = useCallback((id: string) => {
    setClientes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertProduto = useCallback(
    (p: Omit<Produto, "id"> & { id?: string }) => {
      setProdutos((prev) => {
        if (p.id) return prev.map((x) => (x.id === p.id ? { ...x, ...p, id: p.id } : x));
        return [...prev, { ...p, id: nid("p") }];
      });
    },
    [],
  );
  const removeProduto = useCallback((id: string) => {
    setProdutos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertIngrediente = useCallback(
    (i: Omit<Ingrediente, "id"> & { id?: string }) => {
      setIngredientes((prev) => {
        if (i.id) return prev.map((x) => (x.id === i.id ? { ...x, ...i, id: i.id } : x));
        return [...prev, { ...i, id: nid("i") }];
      });
    },
    [],
  );
  const removeIngrediente = useCallback((id: string) => {
    setIngredientes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertPedido = useCallback(
    (p: Omit<Pedido, "id" | "criadoEm"> & { id?: string; criadoEm?: string }) => {
      setPedidos((prev) => {
        if (p.id)
          return prev.map((x) =>
            x.id === p.id ? { ...x, ...p, id: p.id, criadoEm: x.criadoEm } : x,
          );
        return [
          ...prev,
          {
            ...p,
            id: nid("ped"),
            criadoEm: p.criadoEm ?? new Date().toISOString().slice(0, 10),
          },
        ];
      });
    },
    [],
  );
  const removePedido = useCallback((id: string) => {
    setPedidos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const atualizarEstado = useCallback(
    (pedidoId: string, estado: Pedido["estado"]) => {
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado } : p)),
      );
    },
    [],
  );

  const consumirPedido = useCallback(
    (pedidoId: string) => {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      if (!pedido) return { ok: false, msg: "Pedido não encontrado." };
      if (pedido.estado === "cancelado")
        return { ok: false, msg: "Pedido cancelado — sem consumo." };
      if (pedido.estoqueConsumido)
        return { ok: false, msg: "O estoque já foi aplicado a este pedido." };

      const consumo = consumoDoPedido(pedido, produtos, ingredientes);
      const insuf = consumo.find((c) => {
        const ing = ingredientes.find((i) => i.id === c.ingredienteId)!;
        return ing.quantidadeAtual < c.quantidade;
      });
      if (insuf) {
        return { ok: false, msg: `Estoque insuficiente de ${insuf.nome}.` };
      }

      setIngredientes((prev) =>
        prev.map((ing) => {
          const c = consumo.find((x) => x.ingredienteId === ing.id);
          if (!c) return ing;
          return {
            ...ing,
            quantidadeAtual:
              Math.round((ing.quantidadeAtual - c.quantidade) * 1000) / 1000,
          };
        }),
      );

      setMateriais((prev) =>
        prev.map((mat) => {
          let total = 0;
          for (const item of pedido.itens) {
            const prod = produtos.find((p) => p.id === item.produtoId);
            const matNec = prod?.materiaisNecessarios?.find((m) => m.materialId === mat.id);
            if (matNec) total += matNec.quantidade * item.quantidade;
          }
          if (total === 0) return mat;
          return { ...mat, quantidade: Math.max(0, Math.round((mat.quantidade - total) * 1000) / 1000) };
        }),
      );

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, estoqueConsumido: true } : p,
        ),
      );
      return { ok: true, msg: "Estoque e materiais actualizados com o consumo do pedido." };
    },
    [ingredientes, pedidos, produtos],
  );

  const upsertMovimento = useCallback(
    (m: Omit<MovimentoCaixa, "id"> & { id?: string }) => {
      setMovimentos((prev) => {
        if (m.id) return prev.map((x) => (x.id === m.id ? { ...x, ...m, id: m.id } : x));
        return [...prev, { ...m, id: nid("m") }];
      });
    },
    [],
  );
  const removeMovimento = useCallback((id: string) => {
    setMovimentos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertContaPagar = useCallback(
    (c: Omit<ContaPagar, "id"> & { id?: string }) => {
      setContasPagar((prev) => {
        if (c.id) return prev.map((x) => (x.id === c.id ? { ...x, ...c, id: c.id } : x));
        return [...prev, { ...c, id: nid("cp") }];
      });
    },
    [],
  );
  const removeContaPagar = useCallback((id: string) => {
    setContasPagar((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const registarPerda = useCallback(
    (p: Omit<Perda, "id">) => {
      const perda: Perda = { ...p, id: nid("per") };
      setPerdas((prev) => [perda, ...prev]);
      setIngredientes((prev) =>
        prev.map((ing) =>
          ing.id === p.ingredienteId
            ? { ...ing, quantidadeAtual: Math.max(0, Math.round((ing.quantidadeAtual - p.quantidade) * 1000) / 1000) }
            : ing,
        ),
      );
    },
    [],
  );
  const removePerda = useCallback((id: string) => {
    setPerdas((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertMaterial = useCallback(
    (m: Omit<Material, "id"> & { id?: string }) => {
      setMateriais((prev) => {
        if (m.id) return prev.map((x) => (x.id === m.id ? { ...x, ...m, id: m.id } : x));
        return [...prev, { ...m, id: nid("mat") }];
      });
    },
    [],
  );
  const removeMaterial = useCallback((id: string) => {
    setMateriais((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertEvento = useCallback(
    (e: Omit<EventoCalendario, "id"> & { id?: string }) => {
      setEventos((prev) => {
        if (e.id) return prev.map((x) => (x.id === e.id ? { ...x, ...e, id: e.id } : x));
        return [...prev, { ...e, id: nid("e") }];
      });
    },
    [],
  );
  const removeEvento = useCallback((id: string) => {
    setEventos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      clientes,
      produtos,
      ingredientes,
      pedidos,
      contasPagar,
      movimentos,
      eventos,
      perdas,
      materiais,
      gastoExtra,
      upsertCliente,
      removeCliente,
      upsertProduto,
      removeProduto,
      upsertIngrediente,
      removeIngrediente,
      upsertPedido,
      removePedido,
      atualizarEstado,
      consumirPedido,
      upsertMovimento,
      removeMovimento,
      upsertContaPagar,
      removeContaPagar,
      upsertEvento,
      removeEvento,
      registarPerda,
      removePerda,
      upsertMaterial,
      removeMaterial,
    }),
    [
      clientes,
      produtos,
      ingredientes,
      pedidos,
      contasPagar,
      movimentos,
      eventos,
      perdas,
      materiais,
      gastoExtra,
      upsertCliente,
      removeCliente,
      upsertProduto,
      removeProduto,
      upsertIngrediente,
      removeIngrediente,
      upsertPedido,
      removePedido,
      atualizarEstado,
      consumirPedido,
      upsertMovimento,
      removeMovimento,
      upsertContaPagar,
      removeContaPagar,
      upsertEvento,
      removeEvento,
      registarPerda,
      removePerda,
      upsertMaterial,
      removeMaterial,
    ],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore fora do StoreProvider");
  return ctx;
}
