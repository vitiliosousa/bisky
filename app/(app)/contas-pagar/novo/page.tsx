"use client";

import { ContaForm, novaContaDraft } from "@/components/ContaForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovaContaPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/contas-pagar"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Contas a pagar
      </Link>

      <ContaForm
        initial={novaContaDraft()}
        onDone={() => router.push("/contas-pagar")}
        onCancel={() => router.push("/contas-pagar")}
      />
    </div>
  );
}
