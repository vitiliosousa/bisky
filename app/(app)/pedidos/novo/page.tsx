"use client";

import { PedidoForm, novoPedidoDraft } from "@/components/PedidoForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoPedidoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/pedidos"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Pedidos
      </Link>

      <PedidoForm
        initial={novoPedidoDraft()}
        onDone={() => router.push("/pedidos")}
        onCancel={() => router.push("/pedidos")}
      />
    </div>
  );
}
