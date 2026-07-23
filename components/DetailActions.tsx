"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Barra desktop: voltar + Editar/Apagar com texto. Oculta no mobile (voltar fica no header). */
export function DetailTopBar({
  backHref,
  backLabel,
  editHref,
  onDelete,
  extra,
}: {
  backHref: string;
  backLabel: string;
  editHref?: string;
  onDelete?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="hidden flex-wrap items-center justify-between gap-3 lg:mb-4 lg:flex">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        {backLabel}
      </Link>
      <div className="flex items-center gap-2">
        {extra}
        {editHref ? (
          <Link
            href={editHref}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f4f5f7] px-4 text-sm font-semibold text-ink-soft transition hover:bg-line"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
            Editar
          </Link>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-strawberry-soft px-4 text-sm font-semibold text-strawberry transition hover:brightness-95"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
            Apagar
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Ícones Editar/Apagar para o card de detalhe — só mobile/tablet. */
export function DetailCardActions({
  editHref,
  onDelete,
}: {
  editHref?: string;
  onDelete?: () => void;
}) {
  if (!editHref && !onDelete) return null;

  return (
    <div className="flex shrink-0 items-center gap-3 lg:hidden">
      {editHref ? (
        <Link
          href={editHref}
          className="text-ink-soft transition hover:text-ink"
          aria-label="Editar"
        >
          <Pencil className="size-4.5" strokeWidth={1.75} />
        </Link>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="text-strawberry transition hover:brightness-90"
          aria-label="Apagar"
        >
          <Trash2 className="size-4.5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
