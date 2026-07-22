"use client";

import { ProdutoForm, novoProdutoDraft } from "@/components/ProdutoForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoProdutoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/produtos"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Produtos
      </Link>

      <ProdutoForm
        initial={novoProdutoDraft()}
        onDone={() => router.push("/produtos")}
        onCancel={() => router.push("/produtos")}
      />
    </div>
  );
}
