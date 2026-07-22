"use client";

import { PerfilForm } from "@/components/PerfilForm";
import { fetchMe, profileFromUser } from "@/lib/auth";
import type { PerfilUtilizador } from "@/lib/profile";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarPerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUtilizador | null>(null);

  useEffect(() => {
    fetchMe()
      .then((me) => setPerfil(profileFromUser(me)))
      .catch(() => setPerfil(null));
  }, []);

  if (!perfil) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted">
        A carregar…
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Perfil
      </Link>

      <PerfilForm
        initial={perfil}
        onDone={() => router.push("/perfil")}
        onCancel={() => router.push("/perfil")}
      />
    </div>
  );
}
