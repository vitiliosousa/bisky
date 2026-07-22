"use client";

import { IngredienteForm, novoIngredienteDraft } from "@/components/IngredienteForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoIngredientePage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/estoque"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Estoque
      </Link>

      <IngredienteForm
        initial={novoIngredienteDraft()}
        onDone={() => router.push("/estoque")}
        onCancel={() => router.push("/estoque")}
      />
    </div>
  );
}
