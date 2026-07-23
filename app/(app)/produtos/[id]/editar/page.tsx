"use client";

import { ProdutoForm } from "@/components/ProdutoForm";
import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { produtos } = useStore();

  const produto = produtos.find((p) => p.id === params.id);

  if (!produto) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Produto não encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <ProdutoForm
        initial={{ ...produto }}
        onDone={() => router.replace(`/produtos/${produto.id}`)}
        onCancel={() => router.replace(`/produtos/${produto.id}`)}
      />
    </div>
  );
}
