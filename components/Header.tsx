"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
} from "lucide-react";
import { getAlertas } from "@/lib/alerts";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { BiskyLogo } from "./BiskyLogo";

export function Header({
  pageTitle,
  pageSubtitle,
  showBack = false,
  showLogo = false,
}: {
  pageTitle: string;
  pageSubtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
}) {
  const router = useRouter();
  const { ingredientes, contasPagar } = useStore();

  const alertCount = getAlertas(ingredientes, contasPagar).urgentes.length;

  return (
    <header className="sticky top-0 z-20 bg-page">
      <div className="flex h-(--header-h) items-center gap-2.5 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 text-muted transition hover:text-ink lg:hidden"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </button>
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
        </div>
      </div>
    </header>
  );
}
