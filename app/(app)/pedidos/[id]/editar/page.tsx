"use client";

import { PedidoForm } from "@/components/PedidoForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarPedidoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pedidos } = useStore();

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
          itens: pedido.itens,
          dataEntrega: pedido.dataEntrega,
          hora: pedido.hora,
          valor: pedido.valor,
          pago: pedido.pago,
          estado: pedido.estado,
          estoqueConsumido: pedido.estoqueConsumido,
        }}
        onDone={() => router.replace(`/pedidos/${pedido.id}`)}
        onCancel={() => router.replace(`/pedidos/${pedido.id}`)}
      />
    </div>
  );
}
