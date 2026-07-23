"use client";

import { labelsEstado } from "@/lib/format";
import type { EstadoPedido } from "@/lib/types";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

/* ── Toast ──────────────────────────────────────────────── */
type ToastType = "success" | "error" | "info";
type ToastItem = { id: string; message: string; type: ToastType };
const _listeners = new Set<(t: ToastItem) => void>();

export function toast(message: string, type: ToastType = "success") {
  const id = Math.random().toString(36).slice(2);
  _listeners.forEach((fn) => fn({ id, message, type }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fn = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    };
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  if (!mounted || items.length === 0) return null;

  const colors: Record<ToastType, string> = {
    success: "bg-ink text-white",
    error:   "bg-strawberry text-white",
    info:    "bg-blueberry text-white",
  };

  return createPortal(
    <div className="fixed bottom-20 left-1/2 z-400 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-6">
      {items.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium shadow-lg ${colors[t.type]}`}
          style={{ animation: "fade-up 0.2s ease-out both" }}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex w-full flex-wrap gap-2 sm:w-auto">{action}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn" | "good" | "berry" | "caramel" | "blueberry";
  icon?: ReactNode;
}) {
  const tones = {
    default: { text: "text-ink", bg: "bg-line", dot: "bg-muted" },
    warn:    { text: "text-caramel", bg: "bg-caramel-soft", dot: "bg-caramel" },
    good:    { text: "text-mint", bg: "bg-mint-soft", dot: "bg-mint" },
    berry:   { text: "text-strawberry", bg: "bg-strawberry-soft", dot: "bg-strawberry" },
    caramel: { text: "text-caramel", bg: "bg-caramel-soft", dot: "bg-caramel" },
    blueberry: { text: "text-blueberry", bg: "bg-blueberry-soft", dot: "bg-blueberry" },
  };
  const t = tones[tone];
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && (
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${t.bg} ${t.text}`}>
            {icon}
          </span>
        )}
        {!icon && <span className={`mt-1 size-2.5 shrink-0 rounded-full ${t.dot}`} />}
      </div>
      <p className={`text-2xl leading-none sm:text-3xl ${t.text}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted)">{hint}</p>}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {children}
    </section>
  );
}

export function StatusBadge({ estado }: { estado: EstadoPedido }) {
  const aberto =
    estado === "pendente" ||
    estado === "em_producao" ||
    estado === "pronto";
  const cls = aberto
    ? "bg-[var(--caramel-soft)] text-[var(--chocolate)]"
    : estado === "entregue"
      ? "bg-[var(--line)] text-[var(--muted)]"
      : "bg-[var(--strawberry-soft)] text-[var(--strawberry)]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {labelsEstado[estado]}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost" | "mint";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const styles = {
    primary:   "bg-[var(--strawberry)] text-white hover:brightness-110 active:brightness-90",
    secondary: "bg-[var(--strawberry-soft)] text-[var(--strawberry)] hover:brightness-95 active:brightness-90",
    danger:    "bg-[var(--line)] text-[var(--muted)] hover:bg-red-100 hover:text-red-600 active:brightness-90",
    ghost:     "bg-transparent text-[var(--muted)] ring-1 ring-[var(--line)] hover:bg-[var(--line)] active:brightness-90",
    mint:      "bg-[var(--mint)] text-white hover:brightness-110 active:brightness-90",
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 className="size-4 animate-spin" strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: "fade-in 0.2s ease-out both" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        style={{ boxShadow: "var(--shadow-modal)", animation: "slide-up 0.25s ease-out both" }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-line transition"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function FormActions({
  onCancel,
  submitLabel = "Guardar",
  loading = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="mt-6 flex gap-2 sm:flex-row sm:justify-end">
      <Btn variant="ghost" onClick={onCancel} disabled={loading} className="w-full sm:w-auto">Cancelar</Btn>
      <Btn type="submit" loading={loading} className="w-full sm:w-auto">{submitLabel}</Btn>
    </div>
  );
}

function ConfirmDeleteDialog({
  nome,
  onConfirm,
  onCancel,
}: {
  nome: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ zIndex: 300, animation: "fade-in 0.15s ease-out both" }}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div
        role="alertdialog"
        aria-modal
        aria-labelledby="confirm-title"
        className="relative w-full max-w-xs rounded-2xl bg-white p-5"
        style={{ boxShadow: "var(--shadow-modal)", animation: "slide-up 0.2s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-title" className="text-sm font-semibold text-ink">
          Apagar &ldquo;{nome}&rdquo;?
        </p>
        <p className="mt-1 text-sm text-muted">
          Esta ação não pode ser desfeita.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full py-2 text-sm font-semibold text-muted ring-1 ring-line transition hover:bg-line"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-strawberry py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useConfirmDelete() {
  const [state, setState] = useState<{ nome: string; resolve: (ok: boolean) => void } | null>(null);

  function confirm(nome: string) {
    return new Promise<boolean>((resolve) => {
      setState({ nome, resolve });
    });
  }

  const dialog = state ? (
    <ConfirmDeleteDialog
      nome={state.nome}
      onConfirm={() => { state.resolve(true); setState(null); }}
      onCancel={() => { state.resolve(false); setState(null); }}
    />
  ) : null;

  return { confirm, dialog };
}

export type FormSubmit = FormEvent<HTMLFormElement>;
