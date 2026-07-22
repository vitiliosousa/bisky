"use client";

import { MovimentoForm, novoMovimentoDraft } from "@/components/MovimentoForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovoMovimentoPage() {
  const router = useRouter();

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/caixa"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Fluxo de caixa
      </Link>

      <MovimentoForm
        initial={novoMovimentoDraft()}
        onDone={() => router.push("/caixa")}
        onCancel={() => router.push("/caixa")}
      />
    </div>
  );
}
