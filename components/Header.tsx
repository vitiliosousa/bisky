"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";
import { getAlertas } from "@/lib/alerts";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { BiskyLogo } from "./BiskyLogo";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header({
  pageTitle,
  pageSubtitle,
  showBack = false,
  backHref,
  showLogo = false,
  user = "",
  papel = "",
  onSair,
}: {
  pageTitle: string;
  pageSubtitle?: string;
  showBack?: boolean;
  backHref?: string;
  showLogo?: boolean;
  user?: string;
  papel?: string;
  onSair?: () => void;
}) {
  const router = useRouter();
  const { ingredientes, contasPagar } = useStore();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const alertCount = getAlertas(ingredientes, contasPagar).urgentes.length;

  useEffect(() => {
    if (!userOpen) return;
    function onClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUserOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  return (
    <header className="sticky top-0 z-20 bg-page">
      <div className="flex h-(--header-h) items-center gap-2.5 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className="shrink-0 text-muted transition hover:text-ink lg:hidden"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="shrink-0 text-muted transition hover:text-ink lg:hidden"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </button>
          )
        )}

        {showLogo ? (
          <>
            <div className="min-w-0 flex-1 lg:hidden">
              <BiskyLogo className="h-8" />
            </div>
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate font-semibold leading-tight text-ink text-xl">
                {pageTitle}
              </p>
              {pageSubtitle && (
                <p className="truncate text-xs text-muted">{pageSubtitle}</p>
              )}
            </div>
          </>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight text-ink text-base sm:text-lg lg:text-xl">
              {pageTitle}
            </p>
            {pageSubtitle && (
              <p className="hidden truncate text-xs text-muted lg:block">
                {pageSubtitle}
              </p>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {/* Sino */}
          <Link
            href="/notificacoes"
            className="relative flex size-10 items-center justify-center rounded-full bg-[#f4f5f7] text-muted transition hover:text-ink"
            aria-label="Notificações"
          >
            <Bell className="size-4.5" strokeWidth={1.75} />
            {alertCount > 0 && (
              <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-strawberry text-[0.6rem] font-bold text-white ring-2 ring-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Link>

          {/* User avatar — só desktop */}
          {user && (
            <div className="relative hidden lg:block" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full bg-[#f4f5f7] py-1.5 h-10 pl-1.5 pr-3 transition hover:bg-[#eceef1]"
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white">
                  {initials(user)}
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold leading-tight text-ink">
                    {user}
                  </p>
                  <p className="text-[0.65rem] text-muted">{papel}</p>
                </div>
                <ChevronDown
                  className={`size-4 text-muted transition ${userOpen ? "rotate-180" : ""}`}
                  strokeWidth={1.75}
                />
              </button>

              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)"
                >
                  <Link
                    href="/perfil"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-[#f4f5f7]"
                    onClick={() => setUserOpen(false)}
                  >
                    <UserRound className="size-4 text-muted" strokeWidth={1.75} />
                    Perfil
                  </Link>
                  <div className="my-1 border-t border-line" />
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-strawberry hover:bg-strawberry-soft"
                    onClick={() => { setUserOpen(false); onSair?.(); }}
                  >
                    <LogOut className="size-4" strokeWidth={1.75} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
