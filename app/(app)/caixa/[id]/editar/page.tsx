"use client";

import { MovimentoForm, novoMovimentoDraft } from "@/components/MovimentoForm";
import { useRouter } from "next/navigation";

export default function NovoMovimentoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <MovimentoForm
        initial={novoMovimentoDraft()}
        onDone={() => router.replace("/caixa")}
        onCancel={() => router.replace("/caixa")}
      />
    </div>
  );
}
