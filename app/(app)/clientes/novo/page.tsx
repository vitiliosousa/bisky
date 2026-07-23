"use client";

import { ClienteForm, novoClienteDraft } from "@/components/ClienteForm";
import { useRouter } from "next/navigation";

export default function NovoClientePage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <ClienteForm
        initial={novoClienteDraft()}
        onDone={() => router.push("/clientes")}
        onCancel={() => router.push("/clientes")}
      />
    </div>
  );
}
