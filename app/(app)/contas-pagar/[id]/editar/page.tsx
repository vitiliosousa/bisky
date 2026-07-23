"use client";

import { ContaForm, novaContaDraft } from "@/components/ContaForm";
import { useRouter } from "next/navigation";

export default function NovaContaPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <ContaForm
        initial={novaContaDraft()}
        onDone={() => router.replace("/contas-pagar")}
        onCancel={() => router.replace("/contas-pagar")}
      />
    </div>
  );
}
