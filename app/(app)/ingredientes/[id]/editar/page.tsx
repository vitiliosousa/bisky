"use client";

import { IngredienteForm } from "@/components/IngredienteForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarIngredientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ingredientes } = useStore();

  const ingrediente = ingredientes.find((i) => i.id === params.id);

  if (!ingrediente) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Ingrediente não encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <IngredienteForm
        initial={{ ...ingrediente }}
        onDone={() => router.replace(`/ingredientes/${ingrediente.id}`)}
        onCancel={() => router.replace(`/ingredientes/${ingrediente.id}`)}
      />
    </div>
  );
}
