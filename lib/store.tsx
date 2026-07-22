"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";
import type { BootstrapData } from "./bootstrap";
import { mapBootstrap, mapPedido, mapProduto } from "./bootstrap";
import { getToken } from "./auth";
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

type Store = {
  loading: boolean;
  ready: boolean;
  reload: () => Promise<void>;
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
  upsertCliente: (c: Omit<Cliente, "id"> & { id?: string }) => Promise<void>;
  removeCliente: (id: string) => Promise<void>;
  upsertProduto: (p: Omit<Produto, "id"> & { id?: string }) => Promise<void>;
  removeProduto: (id: string) => Promise<void>;
  upsertIngrediente: (i: Omit<Ingrediente, "id"> & { id?: string }) => Promise<void>;
  removeIngrediente: (id: string) => Promise<void>;
  upsertPedido: (
    p: Omit<Pedido, "id" | "criadoEm"> & { id?: string; criadoEm?: string },
  ) => Promise<void>;
  removePedido: (id: string) => Promise<void>;
  atualizarEstado: (pedidoId: string, estado: Pedido["estado"]) => Promise<void>;
  consumirPedido: (pedidoId: string) => Promise<{ ok: boolean; msg: string }>;
  upsertMovimento: (m: Omit<MovimentoCaixa, "id"> & { id?: string }) => Promise<void>;
  removeMovimento: (id: string) => Promise<void>;
  upsertContaPagar: (c: Omit<ContaPagar, "id"> & { id?: string }) => Promise<void>;
  removeContaPagar: (id: string) => Promise<void>;
  upsertEvento: (e: Omit<EventoCalendario, "id"> & { id?: string }) => Promise<void>;
  removeEvento: (id: string) => Promise<void>;
  registarPerda: (p: Omit<Perda, "id">) => Promise<void>;
  removePerda: (id: string) => Promise<void>;
  upsertMaterial: (m: Omit<Material, "id"> & { id?: string }) => Promise<void>;
  removeMaterial: (id: string) => Promise<void>;
};

const StoreCtx = createContext<Store | null>(null);

const emptyGasto: Record<string, { pedidos: number; gasto: number }> = {};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [gastoExtra] = useState(emptyGasto);

  const applyBootstrap = useCallback((data: BootstrapData) => {
    const mapped = mapBootstrap(data);
    setClientes(mapped.clientes);
    setProdutos(mapped.produtos);
    setIngredientes(mapped.ingredientes);
    setPedidos(mapped.pedidos);
    setContasPagar(mapped.contasPagar);
    setMovimentos(mapped.movimentos);
    setEventos(mapped.eventos);
    setPerdas(mapped.perdas);
    setMateriais(mapped.materiais);
  }, []);

  const reload = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      setReady(true);
      return;
    }
    setLoading(true);
    try {
      const data = await api<BootstrapData>("/api/bootstrap");
      applyBootstrap(data);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, [applyBootstrap]);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsertCliente = useCallback(
    async (c: Omit<Cliente, "id"> & { id?: string }) => {
      if (c.id) {
        const updated = await api<Cliente>(`/api/clientes/${c.id}`, {
          method: "PUT",
          body: JSON.stringify(c),
        });
        setClientes((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
      } else {
        const created = await api<Cliente>("/api/clientes", {
          method: "POST",
          body: JSON.stringify(c),
        });
        setClientes((prev) => [...prev, created]);
      }
    },
    [],
  );

  const removeCliente = useCallback(async (id: string) => {
    await api(`/api/clientes/${id}`, { method: "DELETE" });
    setClientes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertProduto = useCallback(
    async (p: Omit<Produto, "id"> & { id?: string }) => {
      const body = {
        nome: p.nome,
        categoria: p.categoria,
        preco: p.preco,
        receita: p.receita,
        modoPreparo: p.modoPreparo ?? [],
        materiaisNecessarios: p.materiaisNecessarios ?? [],
      };
      if (p.id) {
        const updated = await api<Produto>(`/api/produtos/${p.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setProdutos((prev) =>
          prev.map((x) => (x.id === p.id ? mapProduto(updated) : x)),
        );
      } else {
        const created = await api<Produto>("/api/produtos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setProdutos((prev) => [...prev, mapProduto(created)]);
      }
    },
    [],
  );

  const removeProduto = useCallback(async (id: string) => {
    await api(`/api/produtos/${id}`, { method: "DELETE" });
    setProdutos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertIngrediente = useCallback(
    async (i: Omit<Ingrediente, "id"> & { id?: string }) => {
      if (i.id) {
        const updated = await api<Ingrediente>(`/api/ingredientes/${i.id}`, {
          method: "PUT",
          body: JSON.stringify(i),
        });
        setIngredientes((prev) => prev.map((x) => (x.id === i.id ? updated : x)));
      } else {
        const created = await api<Ingrediente>("/api/ingredientes", {
          method: "POST",
          body: JSON.stringify(i),
        });
        setIngredientes((prev) => [...prev, created]);
      }
    },
    [],
  );

  const removeIngrediente = useCallback(async (id: string) => {
    await api(`/api/ingredientes/${id}`, { method: "DELETE" });
    setIngredientes((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertPedido = useCallback(
    async (
      p: Omit<Pedido, "id" | "criadoEm"> & { id?: string; criadoEm?: string },
    ) => {
      const body = {
        clienteId: p.clienteId,
        itens: p.itens,
        dataEntrega: p.dataEntrega,
        hora: p.hora,
        valor: p.valor,
        pago: p.pago,
        estado: p.estado,
        estoqueConsumido: p.estoqueConsumido,
      };
      if (p.id) {
        const updated = await api<Pedido>(`/api/pedidos/${p.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setPedidos((prev) =>
          prev.map((x) => (x.id === p.id ? mapPedido(updated) : x)),
        );
      } else {
        const created = await api<Pedido>("/api/pedidos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setPedidos((prev) => [...prev, mapPedido(created)]);
      }
    },
    [],
  );

  const removePedido = useCallback(async (id: string) => {
    await api(`/api/pedidos/${id}`, { method: "DELETE" });
    setPedidos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const atualizarEstado = useCallback(
    async (pedidoId: string, estado: Pedido["estado"]) => {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      if (!pedido) return;
      await upsertPedido({ ...pedido, estado });
    },
    [pedidos, upsertPedido],
  );

  const consumirPedido = useCallback(
    async (pedidoId: string) => {
      try {
        const res = await api<{ ok: boolean; msg: string }>(
          `/api/pedidos/${pedidoId}/consumir`,
          { method: "POST" },
        );
        await reload();
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao consumir estoque.";
        return { ok: false, msg };
      }
    },
    [reload],
  );

  const upsertMovimento = useCallback(
    async (m: Omit<MovimentoCaixa, "id"> & { id?: string }) => {
      if (m.id) {
        const updated = await api<MovimentoCaixa>(`/api/movimentos/${m.id}`, {
          method: "PUT",
          body: JSON.stringify(m),
        });
        setMovimentos((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
      } else {
        const created = await api<MovimentoCaixa>("/api/movimentos", {
          method: "POST",
          body: JSON.stringify(m),
        });
        setMovimentos((prev) => [created, ...prev]);
      }
    },
    [],
  );

  const removeMovimento = useCallback(async (id: string) => {
    await api(`/api/movimentos/${id}`, { method: "DELETE" });
    setMovimentos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertContaPagar = useCallback(
    async (c: Omit<ContaPagar, "id"> & { id?: string }) => {
      const body = {
        fornecedor: c.fornecedor,
        descricao: c.descricao,
        valor: c.valor,
        vencimento: c.vencimento,
        paga: c.paga,
      };
      if (c.id) {
        const updated = await api<ContaPagar>(`/api/contas-pagar/${c.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setContasPagar((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
      } else {
        const created = await api<ContaPagar>("/api/contas-pagar", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setContasPagar((prev) => [...prev, created]);
      }
    },
    [],
  );

  const removeContaPagar = useCallback(async (id: string) => {
    await api(`/api/contas-pagar/${id}`, { method: "DELETE" });
    setContasPagar((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertEvento = useCallback(
    async (e: Omit<EventoCalendario, "id"> & { id?: string }) => {
      const body = {
        titulo: e.titulo,
        data: e.data,
        hora: e.hora,
        tipo: e.tipo,
        pedidoId: e.pedidoId,
      };
      if (e.id) {
        const updated = await api<EventoCalendario>(`/api/eventos/${e.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setEventos((prev) => prev.map((x) => (x.id === e.id ? updated : x)));
      } else {
        const created = await api<EventoCalendario>("/api/eventos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setEventos((prev) => [...prev, created]);
      }
    },
    [],
  );

  const removeEvento = useCallback(async (id: string) => {
    await api(`/api/eventos/${id}`, { method: "DELETE" });
    setEventos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const registarPerda = useCallback(async (p: Omit<Perda, "id">) => {
    const created = await api<Perda>("/api/perdas", {
      method: "POST",
      body: JSON.stringify(p),
    });
    setPerdas((prev) => [created, ...prev]);
    await reload();
  }, [reload]);

  const removePerda = useCallback(async (id: string) => {
    await api(`/api/perdas/${id}`, { method: "DELETE" });
    setPerdas((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertMaterial = useCallback(
    async (m: Omit<Material, "id"> & { id?: string }) => {
      const body = {
        nome: m.nome,
        categoria: m.categoria,
        quantidade: m.quantidade,
        unidade: m.unidade,
        precoUnitario: m.precoUnitario,
        estoqueMinimo: m.estoqueMinimo,
      };
      if (m.id) {
        const updated = await api<Material>(`/api/materiais/${m.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setMateriais((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
      } else {
        const created = await api<Material>("/api/materiais", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setMateriais((prev) => [...prev, created]);
      }
    },
    [],
  );

  const removeMaterial = useCallback(async (id: string) => {
    await api(`/api/materiais/${id}`, { method: "DELETE" });
    setMateriais((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      loading,
      ready,
      reload,
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
      loading,
      ready,
      reload,
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
