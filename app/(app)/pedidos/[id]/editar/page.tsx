"use client";

import { PedidoForm, novoPedidoDraft } from "@/components/PedidoForm";
import { useRouter } from "next/navigation";

export default function NovoPedidoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <PedidoForm
        initial={novoPedidoDraft()}
        onDone={() => router.replace("/pedidos")}
        onCancel={() => router.replace("/pedidos")}
      />
    </div>
  );
}
