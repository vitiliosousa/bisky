"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Antigo hub mobile — redireciona para /mais. */
export default function FinancasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mais");
  }, [router]);
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-muted">
      A redirecionar…
    </div>
  );
}
