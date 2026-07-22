"use client";

import { ContaForm } from "@/components/ContaForm";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditarContaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { contasPagar } = useStore();

  const conta = contasPagar.find((c) => c.id === params.id);

  if (!conta) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/contas-pagar"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Contas a pagar
        </Link>
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
      <Link
        href="/contas-pagar"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {conta.fornecedor}
      </Link>

      <ContaForm
        initial={{ ...conta }}
        onDone={() => router.push("/contas-pagar")}
        onCancel={() => router.push("/contas-pagar")}
      />
    </div>
  );
}
