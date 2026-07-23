"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: Props) {
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <p className="text-xs text-muted">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex size-9 items-center justify-center rounded-full bg-[#f4f5f7] text-ink-soft transition hover:bg-line disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
        </button>
        <span className="min-w-12 text-center text-xs font-semibold text-ink-soft">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex size-9 items-center justify-center rounded-full bg-[#f4f5f7] text-ink-soft transition hover:bg-line disabled:opacity-40"
          aria-label="Página seguinte"
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
