"use client";

import { Empty } from "@/components/Empty";
import { HOJE, dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import Link from "next/link";

export default function NotificacoesPage() {
  const { ingredientes, contasPagar } = useStore();

  const falta = ingredientes.filter((i) => i.quantidadeAtual < i.estoqueMinimo);
  const contasAtrasadas = contasPagar.filter(
    (c) => !c.paga && c.vencimento < HOJE,
  );
  const contasProximas = contasPagar.filter(
    (c) =>
      !c.paga &&
      c.vencimento >= HOJE &&
      c.vencimento <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
  );

  const total = falta.length + contasAtrasadas.length + contasProximas.length;

  return (
    <div className="animate-in mx-auto max-w-2xl space-y-3">
      {/* Resumo */}
      <div className="card flex items-center gap-3">
        {total === 0 ? (
          <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint">
              <CheckCircle2 className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Tudo em ordem</p>
              <p className="text-xs text-muted">Sem alertas no momento.</p>
            </div>
          </>
        ) : (
          <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {total} alerta{total === 1 ? "" : "s"} ativo{total === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted">
                Reveja os itens abaixo e tome ação.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Estoque em falta */}
      {falta.length > 0 && (
        <section className="card space-y-1">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">Estoque em falta</h2>
            <p className="text-xs text-muted">
              {falta.length} ingrediente{falta.length === 1 ? "" : "s"} abaixo do mínimo
            </p>
          </div>
          <ul className="divide-y divide-line">
            {falta.map((i) => (
              <li key={i.id}>
                <Link
                  href="/estoque"
                  className="flex items-center gap-3 py-3 transition hover:bg-[#f4f5f7] -mx-4 px-4 first:-mt-1 last:-mb-1"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                    <AlertTriangle className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {i.nome}
                    </span>
                    <span className="block text-xs text-muted">
                      {i.quantidadeAtual} {i.unidade} disponível · mínimo {i.estoqueMinimo} {i.unidade}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-strawberry-soft px-2.5 py-0.5 text-xs font-semibold text-strawberry">
                    Reabastecer
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contas atrasadas */}
      {contasAtrasadas.length > 0 && (
        <section className="card space-y-1">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">Contas atrasadas</h2>
            <p className="text-xs text-muted">
              {contasAtrasadas.length} conta{contasAtrasadas.length === 1 ? "" : "s"} em atraso
            </p>
          </div>
          <ul className="divide-y divide-line">
            {contasAtrasadas.map((c) => (
              <li key={c.id}>
                <Link
                  href="/contas-pagar"
                  className="flex items-center gap-3 py-3 transition hover:bg-[#f4f5f7] -mx-4 px-4 first:-mt-1 last:-mb-1"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-caramel-soft text-caramel">
                    <Wallet className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {c.fornecedor}
                    </span>
                    <span className="block text-xs text-muted">
                      {c.descricao && `${c.descricao} · `}{mzn(c.valor)} · venceu {dataCurta(c.vencimento)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-caramel-soft px-2.5 py-0.5 text-xs font-semibold text-caramel">
                    Atrasada
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contas a vencer esta semana */}
      {contasProximas.length > 0 && (
        <section className="card space-y-1">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">A vencer esta semana</h2>
            <p className="text-xs text-muted">
              {contasProximas.length} conta{contasProximas.length === 1 ? "" : "s"} nos próximos 7 dias
            </p>
          </div>
          <ul className="divide-y divide-line">
            {contasProximas.map((c) => (
              <li key={c.id}>
                <Link
                  href="/contas-pagar"
                  className="flex items-center gap-3 py-3 transition hover:bg-[#f4f5f7] -mx-4 px-4 first:-mt-1 last:-mb-1"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-muted">
                    <Wallet className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {c.fornecedor}
                    </span>
                    <span className="block text-xs text-muted">
                      {c.descricao && `${c.descricao} · `}{mzn(c.valor)} · vence {dataCurta(c.vencimento)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#f4f5f7] px-2.5 py-0.5 text-xs font-semibold text-muted">
                    Em breve
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Estado vazio */}
      {total === 0 && (
        <div className="card">
          <Empty
            message="Sem notificações"
            hint="Quando houver alertas de estoque ou contas, aparecem aqui."
          />
        </div>
      )}
    </div>
  );
}
