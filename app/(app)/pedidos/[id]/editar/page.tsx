"use client";

import { PedidoForm } from "@/components/PedidoForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarPedidoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pedidos, clientes } = useStore();

  const pedido = pedidos.find((p) => p.id === params.id);

  if (!pedido) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Pedido não encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <PedidoForm
        initial={{
          id: pedido.id,
          clienteId: pedido.clienteId,
          itens: pedido.itens.map((i) => ({
            ...i,
            receitaAjustada: i.receitaAjustada?.map((r) => ({ ...r })),
          })),
          dataEntrega: pedido.dataEntrega,
          hora: pedido.hora,
          valor: pedido.valor,
          pago: pedido.pago,
          estado: pedido.estado,
        }}
        onDone={() => router.push("/pedidos")}
        onCancel={() => router.push("/pedidos")}
      />
    </div>
  );
}
