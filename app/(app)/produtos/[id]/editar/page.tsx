"use client";

import { ProdutoForm } from "@/components/ProdutoForm";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { produtos } = useStore();

  const produto = produtos.find((p) => p.id === params.id);

  if (!produto) {
    return (
      <div className="animate-in space-y-4">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Produtos
        </Link>
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Produto não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const voltar = `/produtos/${produto.id}`;

  return (
    <div className="animate-in space-y-5">
      <Link
        href={voltar}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {produto.nome}
      </Link>

      <ProdutoForm
        initial={{ ...produto, receita: produto.receita.map((r) => ({ ...r })) }}
        onDone={() => router.push(voltar)}
        onCancel={() => router.push(voltar)}
      />
    </div>
  );
}
