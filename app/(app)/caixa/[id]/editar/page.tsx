"use client";

import { MovimentoForm } from "@/components/MovimentoForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarMovimentoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { movimentos } = useStore();

  const movimento = movimentos.find((m) => m.id === params.id);

  if (!movimento) {
    return (
      <div className="animate-in">
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
      <MovimentoForm
        initial={{ ...movimento }}
        onDone={() => router.push(voltar)}
        onCancel={() => router.push(voltar)}
      />
    </div>
  );
}
