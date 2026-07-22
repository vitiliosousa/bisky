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
  nome: "Adélia Machava",
  email: "adelia@email.com",
  telefone: "+258 84 123 4567",
  endereco: "Maputo, Moçambique",
  negocio: "Confeitaria Bisky",
  papel: "Confeiteira",
  bio: "Bolos, doces e encomendas feitas com carinho.",
};

const STORAGE_KEY = "bisky_profile";

export function getPerfil(): PerfilUtilizador {
  if (typeof window === "undefined") return PERFIL_PADRAO;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const perfil: PerfilUtilizador = raw
      ? { ...PERFIL_PADRAO, ...JSON.parse(raw) }
      : { ...PERFIL_PADRAO };

    const nomeLogin = localStorage.getItem("cakescontrol_user");
    if (nomeLogin?.trim()) perfil.nome = nomeLogin.trim();

    return perfil;
  } catch {
    return { ...PERFIL_PADRAO };
  }
}

export function savePerfil(perfil: PerfilUtilizador) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
  localStorage.setItem("cakescontrol_user", perfil.nome.trim());
  window.dispatchEvent(new CustomEvent("bisky:profile-updated"));
}
