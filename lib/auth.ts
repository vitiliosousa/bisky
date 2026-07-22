import { api } from "./api";
import type { PerfilUtilizador } from "./profile";

const TOKEN_KEY = "bisky_token";

export type AuthUser = {
  id: string;
  email: string;
  profile: {
    id: string;
    userId: string;
    nome: string;
    telefone: string;
    endereco: string;
    negocio: string;
    papel: string;
    bio: string;
  } | null;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("cakescontrol_auth");
  localStorage.removeItem("cakescontrol_user");
  localStorage.removeItem("bisky_profile");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function login(email: string, password: string) {
  const res = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res.user;
}

export async function register(
  email: string,
  password: string,
  nome?: string,
) {
  const res = await api<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nome }),
  });
  setToken(res.token);
  return res.user;
}

export async function fetchMe() {
  return api<AuthUser>("/auth/me");
}

export function profileFromUser(user: AuthUser): PerfilUtilizador {
  const p = user.profile;
  return {
    nome: p?.nome ?? user.email.split("@")[0],
    email: user.email,
    telefone: p?.telefone ?? "",
    endereco: p?.endereco ?? "",
    negocio: p?.negocio ?? "",
    papel: p?.papel ?? "Confeiteira",
    bio: p?.bio ?? "",
  };
}
