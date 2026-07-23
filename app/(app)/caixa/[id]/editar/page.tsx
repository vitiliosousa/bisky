"use client";

import { MovimentoForm } from "@/components/MovimentoForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarMovimentoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { movimentos } = useStore();
  const mov = movimentos.find((m) => m.id === params.id);

  if (!mov) {
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

  return (
    <div className="animate-in space-y-5">
      <MovimentoForm
        initial={mov}
        onDone={() => router.replace(`/caixa/${mov.id}`)}
        onCancel={() => router.replace(`/caixa/${mov.id}`)}
      />
    </div>
  );
}
