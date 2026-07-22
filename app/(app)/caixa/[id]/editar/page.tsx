"use client";

import { MovimentoForm } from "@/components/MovimentoForm";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditarMovimentoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { movimentos } = useStore();

  const movimento = movimentos.find((m) => m.id === params.id);

  if (!movimento) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/caixa"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Fluxo de caixa
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Movimento não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const voltar = `/caixa/${movimento.id}`;

  return (
    <div className="animate-in space-y-5">
      <Link
        href={voltar}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {movimento.descricao}
      </Link>

      <MovimentoForm
        initial={{ ...movimento }}
        onDone={() => router.push(voltar)}
        onCancel={() => router.push(voltar)}
      />
    </div>
  );
}
