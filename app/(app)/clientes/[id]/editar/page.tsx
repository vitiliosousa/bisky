"use client";

import { ClienteForm } from "@/components/ClienteForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { clientes } = useStore();
  const cliente = clientes.find((c) => c.id === params.id);

  if (!cliente) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Cliente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <ClienteForm
        initial={cliente}
        onDone={() => router.replace(`/clientes/${cliente.id}`)}
        onCancel={() => router.replace(`/clientes/${cliente.id}`)}
      />
    </div>
  );
}
