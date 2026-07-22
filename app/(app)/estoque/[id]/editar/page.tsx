"use client";

import { IngredienteForm } from "@/components/IngredienteForm";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditarIngredientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ingredientes } = useStore();

  const ingrediente = ingredientes.find((i) => i.id === params.id);

  if (!ingrediente) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/estoque"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Estoque
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Ingrediente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const voltar = "/estoque";

  return (
    <div className="animate-in space-y-5">
      <Link
        href={voltar}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {ingrediente.nome}
      </Link>

      <IngredienteForm
        initial={{ ...ingrediente }}
        onDone={() => router.push(voltar)}
        onCancel={() => router.push(voltar)}
      />
    </div>
  );
}
