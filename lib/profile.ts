import { api } from "./api";

export interface PerfilUtilizador {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  negocio: string;
  papel: string;
  bio: string;
}

export const PERFIL_PADRAO: PerfilUtilizador = {
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  negocio: "",
  papel: "Confeiteira",
  bio: "",
};

type ApiProfile = {
  nome: string;
  telefone: string;
  endereco: string;
  negocio: string;
  papel: string;
  bio: string;
};

export async function fetchPerfil(email?: string): Promise<PerfilUtilizador> {
  const profile = await api<ApiProfile>("/api/profile");
  return {
    nome: profile.nome,
    email: email ?? "",
    telefone: profile.telefone,
    endereco: profile.endereco,
    negocio: profile.negocio,
    papel: profile.papel,
    bio: profile.bio,
  };
}

export async function savePerfil(perfil: PerfilUtilizador) {
  await api("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({
      nome: perfil.nome.trim(),
      telefone: perfil.telefone.trim(),
      endereco: perfil.endereco.trim(),
      negocio: perfil.negocio.trim(),
      papel: perfil.papel.trim(),
      bio: perfil.bio.trim(),
    }),
  });
  window.dispatchEvent(new CustomEvent("bisky:profile-updated"));
}

/** @deprecated use fetchPerfil */
export function getPerfil(): PerfilUtilizador {
  return PERFIL_PADRAO;
}
