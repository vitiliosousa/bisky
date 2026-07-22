"use client";

import { HOJE, dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const DIAS_SEM = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CalendarioPage() {
  const { pedidos, clientes, produtos } = useStore();
  const hojeDate = new Date(HOJE + "T12:00:00");
  const [ano, setAno] = useState(hojeDate.getFullYear());
  const [mes, setMes] = useState(hojeDate.getMonth());
  const [diaSel, setDiaSel] = useState(HOJE);

  const total = daysInMonth(ano, mes);
  const offset = (() => {
    const d = new Date(ano, mes, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const pedidosAtivos = useMemo(
    () => pedidos.filter((p) => p.estado !== "cancelado"),
    [pedidos],
  );

  const porDia = useMemo(() => {
    const map = new Map<string, typeof pedidosAtivos>();
    for (const p of pedidosAtivos) {
      const list = map.get(p.dataEntrega) ?? [];
      list.push(p);
      map.set(p.dataEntrega, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
    }
    return map;
  }, [pedidosAtivos]);

  const doDia = porDia.get(diaSel) ?? [];

  function prevMonth() {
    if (mes === 0) { setMes(11); setAno(ano - 1); }
    else setMes(mes - 1);
  }

  function nextMonth() {
    if (mes === 11) { setMes(0); setAno(ano + 1); }
    else setMes(mes + 1);
  }

  function irParaHoje() {
    setAno(hojeDate.getFullYear());
    setMes(hojeDate.getMonth());
    setDiaSel(HOJE);
  }

  const mesLabel = new Date(ano, mes, 1).toLocaleDateString("pt-MZ", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-in space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex size-10 items-center justify-center rounded-full bg-[#f4f5f7] text-ink-soft transition hover:bg-line"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </button>
          <p className="min-w-0 px-1 text-center text-sm font-semibold capitalize text-ink sm:min-w-40 sm:text-base">
            {mesLabel}
          </p>
          <button
            type="button"
            onClick={nextMonth}
            className="flex size-10 items-center justify-center rounded-full bg-[#f4f5f7] text-ink-soft transition hover:bg-line"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={irParaHoje}
          className="inline-flex h-10 items-center rounded-full bg-[#f4f5f7] px-4 text-sm font-semibold text-ink-soft transition hover:bg-line"
        >
          Hoje
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Grelha do mês ────────────────────────────────── */}
        <div className="card">
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS_SEM.map((d) => (
              <div
                key={d}
                className="py-1.5 text-[0.65rem] font-semibold text-muted sm:text-xs"
              >
                {d}
              </div>
            ))}

            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {Array.from({ length: total }).map((_, i) => {
              const day = i + 1;
              const iso = isoDate(ano, mes, day);
              const list = porDia.get(iso) ?? [];
              const isHoje = iso === HOJE;
              const ativo = iso === diaSel;

              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => setDiaSel(iso)}
                  className={`flex min-h-11 flex-col items-center rounded-2xl p-1 transition sm:min-h-16 sm:items-stretch sm:p-1.5 ${
                    ativo
                      ? "bg-strawberry text-white shadow-sm shadow-strawberry/25"
                      : isHoje
                        ? "bg-caramel-soft text-ink ring-1 ring-caramel/40"
                        : "bg-[#f8f8f9] text-ink hover:bg-[#ececee]"
                  }`}
                >
                  <span
                    className={`text-xs font-bold sm:text-sm ${ativo ? "text-white" : ""}`}
                  >
                    {day}
                  </span>
                  {list.length > 0 && (
                    <>
                      {/* ponto no mobile */}
                      <span
                        className={`mt-1 size-1.5 rounded-full sm:hidden ${
                          ativo ? "bg-white" : "bg-strawberry"
                        }`}
                      />
                      {/* pílulas no desktop */}
                      <ul className="mt-1.5 hidden space-y-1 sm:block">
                        {list.slice(0, 2).map((p) => {
                          const c = clientes.find((x) => x.id === p.clienteId);
                          return (
                            <li
                              key={p.id}
                              className={`truncate rounded-md px-1 py-0.5 text-[9px] leading-tight ${
                                ativo
                                  ? "bg-white/20 text-white"
                                  : "bg-blueberry-soft text-blueberry"
                              }`}
                            >
                              {c?.nome.split(" ")[0] ?? "—"}
                            </li>
                          );
                        })}
                        {list.length > 2 && (
                          <li
                            className={`text-[9px] ${
                              ativo ? "text-white/80" : "text-muted"
                            }`}
                          >
                            +{list.length - 2}
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Pedidos do dia ───────────────────────────────── */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">
              {dataCurta(diaSel)}
            </h2>
            <p className="text-xs text-muted">
              {doDia.length === 0
                ? "Sem pedidos"
                : `${doDia.length} ${doDia.length === 1 ? "pedido" : "pedidos"}`}
            </p>
          </div>

          {doDia.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
              Nenhum pedido para este dia.
            </p>
          ) : (
            <ul className="space-y-3">
              {doDia.map((p) => {
                const c = clientes.find((x) => x.id === p.clienteId);
                const falta = p.valor - p.pago;
                return (
                  <li key={p.id}>
                    <Link
                      href="/pedidos"
                      className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blueberry text-xs font-bold text-white">
                        {initials(c?.nome ?? "?")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                          {c?.nome ?? "—"}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {p.hora}
                          {p.itens.length > 0
                            ? ` · ${p.itens
                                .map((i) => {
                                  const pr = produtos.find(
                                    (x) => x.id === i.produtoId,
                                  );
                                  return `${i.quantidade}× ${pr?.nome ?? "?"}`;
                                })
                                .join(", ")}`
                            : ""}
                        </span>
                      </span>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-ink">
                          {mzn(p.valor)}
                        </p>
                        {falta > 0 && (
                          <p className="text-[0.65rem] font-semibold text-strawberry">
                            falta {mzn(falta)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
