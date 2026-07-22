"use client";

import { ClienteForm, novoClienteDraft } from "@/components/ClienteForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoClientePage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Clientes
      </Link>

      <ClienteForm
        initial={novoClienteDraft()}
        onDone={() => router.push("/clientes")}
        onCancel={() => router.push("/clientes")}
      />
    </div>
  );
}
