"use client";

import { ProdutoForm, novoProdutoDraft } from "@/components/ProdutoForm";
import { useRouter } from "next/navigation";

export default function NovoProdutoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <ProdutoForm
        initial={novoProdutoDraft()}
        onDone={() => router.push("/produtos")}
        onCancel={() => router.push("/produtos")}
      />
    </div>
  );
}
