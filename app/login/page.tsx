"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Loader2, Mail } from "lucide-react";
import { ApiError } from "@/lib/api";
import { login, register } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "register">("login");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const pass = String(data.get("pass") ?? "");
    const nome = String(data.get("nome") ?? "").trim();

    try {
      if (modo === "login") {
        await login(email, pass);
      } else {
        await register(email, pass, nome || undefined);
      }
      router.replace("/dashboard");
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden flex-col lg:flex-row">
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[46%] xl:w-[44%] items-center justify-center"
        style={{
          background:
            "linear-gradient(150deg, #e63e5c 0%, #c72a47 50%, #9e1e37 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <img
            src="/logobisky.svg"
            alt="Bisky"
            className="relative h-16 w-auto xl:h-20"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 sm:px-8">
        <div className="w-full max-w-84">
          <div className="mb-10 flex justify-center lg:hidden">
            <img src="/Bisky Logo.svg" alt="Bisky" className="h-11 w-auto" />
          </div>

          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {modo === "login" ? "Bem-vinda de volta" : "Criar conta"}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {modo === "login"
                ? "Entre na sua conta para continuar."
                : "Registe-se para começar a usar o Bisky."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {modo === "register" && (
              <label className="lbl">
                Nome
                <span className="mt-1.5 flex h-10 items-center gap-2.5 rounded-full border border-line bg-[#f8f8f9] px-4 transition-all focus-within:border-strawberry focus-within:bg-white focus-within:ring-2 focus-within:ring-strawberry/15">
                  <input
                    name="nome"
                    placeholder="O seu nome"
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/50"
                  />
                </span>
              </label>
            )}

            <label className="lbl">
              Email
              <span className="mt-1.5 flex h-10 items-center gap-2.5 rounded-full border border-line bg-[#f8f8f9] px-4 transition-all focus-within:border-strawberry focus-within:bg-white focus-within:ring-2 focus-within:ring-strawberry/15">
                <Mail className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="email@exemplo.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/50"
                />
              </span>
            </label>

            <label className="lbl">
              Senha
              <span className="mt-1.5 flex h-10 items-center gap-2.5 rounded-full border border-line bg-[#f8f8f9] px-4 transition-all focus-within:border-strawberry focus-within:bg-white focus-within:ring-2 focus-within:ring-strawberry/15">
                <Lock className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                <input
                  name="pass"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={
                    modo === "login" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="shrink-0 text-muted transition hover:text-ink"
                  aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <EyeOff className="size-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.75} />
                  )}
                </button>
              </span>
            </label>

            {erro && (
              <p
                className="rounded-full bg-strawberry-soft px-4 py-2.5 text-sm font-medium text-strawberry"
                role="alert"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-strawberry text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  {modo === "login" ? "A entrar…" : "A criar conta…"}
                </>
              ) : modo === "login" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            {modo === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setModo("register");
                    setErro("");
                    setMostrarSenha(false);
                  }}
                  className="font-semibold text-strawberry hover:underline"
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setModo("login");
                    setErro("");
                    setMostrarSenha(false);
                  }}
                  className="font-semibold text-strawberry hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
