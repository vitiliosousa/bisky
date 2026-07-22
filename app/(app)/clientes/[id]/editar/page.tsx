"use client";

import { ClienteForm } from "@/components/ClienteForm";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { clientes } = useStore();

  const cliente = clientes.find((c) => c.id === params.id);

  if (!cliente) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Clientes
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Cliente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const voltar = `/clientes/${cliente.id}`;

  return (
    <div className="animate-in space-y-5">
      <Link
        href={voltar}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {cliente.nome}
      </Link>

      <ClienteForm
        initial={{ ...cliente }}
        onDone={() => router.push(voltar)}
        onCancel={() => router.push(voltar)}
      />
    </div>
  );
}
