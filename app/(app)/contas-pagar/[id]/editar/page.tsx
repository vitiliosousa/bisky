"use client";

import { ContaForm } from "@/components/ContaForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarContaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { contasPagar } = useStore();

  const conta = contasPagar.find((c) => c.id === params.id);

  if (!conta) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Conta não encontrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <ContaForm
        initial={{ ...conta }}
        onDone={() => router.replace(`/contas-pagar/${conta.id}`)}
        onCancel={() => router.replace(`/contas-pagar/${conta.id}`)}
      />
    </div>
  );
}
