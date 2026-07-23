"use client";

import { PerfilForm } from "@/components/PerfilForm";
import { fetchMe, profileFromUser } from "@/lib/auth";
import type { PerfilUtilizador } from "@/lib/profile";
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
      <PerfilForm
        initial={perfil}
        onDone={() => router.push("/perfil")}
        onCancel={() => router.push("/perfil")}
      />
    </div>
  );
}
