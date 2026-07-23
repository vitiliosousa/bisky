"use client";

import { IngredienteForm, novoIngredienteDraft } from "@/components/IngredienteForm";
import { useRouter } from "next/navigation";

export default function NovoIngredientePage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <IngredienteForm
        initial={novoIngredienteDraft()}
        onDone={() => router.replace("/ingredientes")}
        onCancel={() => router.replace("/ingredientes")}
      />
    </div>
  );
}
