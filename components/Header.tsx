"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { HOJE, dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";

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
  user,
  papel,
  onSair,
}: {
  pageTitle: string;
  pageSubtitle?: string;
  user: string;
  papel: string;
  onSair: () => void;
}) {
  const { ingredientes, contasPagar } = useStore();
  const [userOpen, setUserOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  const falta = ingredientes.filter((i) => i.quantidadeAtual < i.estoqueMinimo);
  const contasAtrasadas = contasPagar.filter(
    (c) => !c.paga && c.vencimento < HOJE,
  );
  const contasProximas = contasPagar.filter(
    (c) => !c.paga && c.vencimento >= HOJE,
  );
  const alertCount = falta.length + contasAtrasadas.length;

  useEffect(() => {
    if (!userOpen && !notiOpen) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (notiRef.current && !notiRef.current.contains(t)) setNotiOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen, notiOpen]);

  return (
    <header className="sticky top-0 z-20 bg-page">
      <div className="flex h-(--header-h) items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo — mobile only */}
        <img
          src="/bisky.svg"
          alt="Bisky"
          className="h-7 w-auto shrink-0 lg:hidden"
        />

        {/* Título + subtítulo — mobile e desktop */}
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight text-ink text-sm lg:text-xl">
            {pageTitle}
          </p>
          {pageSubtitle && (
            <p className="truncate text-[0.65rem] text-muted lg:text-xs">{pageSubtitle}</p>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Sino de notificações */}
          <div className="relative" ref={notiRef}>
            <button
              type="button"
              onClick={() => {
                setNotiOpen((v) => !v);
                setUserOpen(false);
              }}
              className="relative flex size-10 items-center justify-center rounded-full bg-[#f4f5f7] text-muted transition hover:text-ink"
              aria-label="Notificações"
              aria-expanded={notiOpen}
            >
              <Bell className="size-4.5" strokeWidth={1.75} />
              {alertCount > 0 && (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-strawberry text-[0.6rem] font-bold text-white ring-2 ring-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>

            {notiOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-modal)">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold text-ink">Notificações</p>
                  <p className="text-xs text-muted">
                    {alertCount === 0
                      ? "Tudo em ordem"
                      : `${alertCount} alerta${alertCount === 1 ? "" : "s"}`}
                  </p>
                </div>
                <ul className="max-h-72 overflow-y-auto py-1">
                  {alertCount === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted">
                      Sem alertas no momento.
                    </li>
                  )}
                  {falta.map((i) => (
                    <li key={i.id}>
                      <Link
                        href="/estoque"
                        onClick={() => setNotiOpen(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-[#f4f5f7]"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                          <AlertTriangle className="size-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">
                            Falta {i.nome.toLowerCase()}
                          </span>
                          <span className="block text-xs text-muted">
                            {i.quantidadeAtual} {i.unidade} · mín. {i.estoqueMinimo}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  {contasAtrasadas.map((c) => (
                    <li key={c.id}>
                      <Link
                        href="/contas-pagar"
                        onClick={() => setNotiOpen(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-[#f4f5f7]"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-caramel">
                          <Wallet className="size-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">
                            Conta atrasada
                          </span>
                          <span className="block text-xs text-muted">
                            {c.fornecedor} · {mzn(c.valor)} · venceu{" "}
                            {dataCurta(c.vencimento)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  {contasAtrasadas.length === 0 &&
                    contasProximas.slice(0, 2).map((c) => (
                      <li key={c.id}>
                        <Link
                          href="/contas-pagar"
                          onClick={() => setNotiOpen(false)}
                          className="flex gap-3 px-4 py-3 hover:bg-[#f4f5f7]"
                        >
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-muted">
                            <Wallet className="size-4" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">
                              A vencer
                            </span>
                            <span className="block text-xs text-muted">
                              {c.fornecedor} · {mzn(c.valor)} ·{" "}
                              {dataCurta(c.vencimento)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* User — só Perfil e Sair */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => {
                setUserOpen((v) => !v);
                setNotiOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-full bg-[#f4f5f7] py-1.5 h-10 pl-1.5 pr-3 transition hover:bg-[#eceef1]"
              aria-expanded={userOpen}
              aria-haspopup="menu"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white">
                {initials(user)}
              </div>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-xs font-semibold leading-tight text-ink">
                  {user}
                </p>
                <p className="text-[0.65rem] text-muted">{papel}</p>
              </div>
              <ChevronDown
                className={`hidden size-4 text-muted sm:block transition ${userOpen ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>

            {userOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)"
              >
                <div className="border-b border-line px-3.5 py-2.5 sm:hidden">
                  <p className="text-sm font-semibold text-ink">{user}</p>
                  <p className="text-xs text-muted">{papel}</p>
                </div>
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
                  onClick={() => {
                    setUserOpen(false);
                    onSair();
                  }}
                >
                  <LogOut className="size-4" strokeWidth={1.75} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
