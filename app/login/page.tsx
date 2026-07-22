"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock, Loader2, UserRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const user = String(data.get("user") ?? "").trim();
    const pass = String(data.get("pass") ?? "");
    setTimeout(() => {
      if (!user || pass !== "bolo123") {
        setErro("Utilizador ou senha incorretos.");
        setLoading(false);
        return;
      }
      localStorage.setItem("cakescontrol_auth", "1");
      localStorage.setItem("cakescontrol_user", user);
      router.replace("/dashboard");
    }, 400);
  }

  return (
    <div className="flex h-dvh overflow-hidden flex-col lg:flex-row">

      {/* ── Painel esquerdo — desktop ────────────────────────── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[46%] xl:w-[44%] items-center justify-center"
        style={{ background: "linear-gradient(150deg, #e63e5c 0%, #c72a47 50%, #9e1e37 100%)" }}
      >
        {/* Padrão de pontos */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Orbs */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-3xl"
          style={{ background: "rgba(255,180,120,0.25)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full blur-3xl"
          style={{ background: "rgba(120,30,60,0.5)" }}
        />

        {/* Anéis decorativos */}
        <div
          className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 size-125 rounded-full"
          style={{ border: "1.5px solid rgba(255,255,255,0.12)" }}
        />
        <div
          className="pointer-events-none absolute -right-48 top-1/2 -translate-y-1/2 size-125 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        />

        {/* Logo centrado */}
        <div className="relative">
          <div
            className="absolute inset-0 -m-12 rounded-full blur-3xl"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <img
            src="/logobisky.svg"
            alt="Bisky"
            className="relative h-16 w-auto xl:h-20"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>

      {/* ── Painel direito — formulário ──────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 sm:px-8">
        <div className="w-full max-w-84">

          {/* Logo — mobile only */}
          <div className="mb-10 flex justify-center lg:hidden">
            <img src="/Bisky Logo.svg" alt="Bisky" className="h-11 w-auto" />
          </div>

          {/* Título */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Bem-vinda de volta
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Entre na sua conta para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="lbl">
              Nome
              <span className="mt-1.5 flex h-10 items-center gap-2.5 rounded-full border border-line bg-[#f8f8f9] px-4 transition-all focus-within:border-strawberry focus-within:bg-white focus-within:ring-2 focus-within:ring-strawberry/15">
                <UserRound className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                <input
                  name="user"
                  required
                  defaultValue="Adélia Machava"
                  autoComplete="username"
                  placeholder="O seu nome"
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
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/50"
                />
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
                  A entrar…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Senha demo:{" "}
            <span className="font-semibold text-ink-soft">bolo123</span>
          </p>
        </div>
      </div>

    </div>
  );
}
