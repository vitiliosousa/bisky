"use client";

import { Empty } from "@/components/Empty";
import { confirmDelete, toast } from "@/components/ui";
import { hoje, dataCurta, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  Check,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filtro = "todas" | "abertas" | "atrasadas" | "pagas";

export default function ContasPagarPage() {
  const { contasPagar, upsertContaPagar, removeContaPagar, upsertMovimento } =
    useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [sel, setSel] = useState(contasPagar[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);

  const hojeISO = hoje();
  const abertas = contasPagar.filter((c) => !c.paga);
  const atrasadas = abertas.filter((c) => c.vencimento < hojeISO);
  const totalAberto = abertas.reduce((s, c) => s + c.valor, 0);

  const filtered = useMemo(() => {
    const q = busca.toLowerCase();
    return contasPagar
      .filter((c) => {
        if (filtro === "abertas" && c.paga) return false;
        if (filtro === "atrasadas" && (c.paga || c.vencimento >= hojeISO))
          return false;
        if (filtro === "pagas" && !c.paga) return false;
        return (
          !q ||
          c.fornecedor.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aAtrasada = !a.paga && a.vencimento < hojeISO;
        const bAtrasada = !b.paga && b.vencimento < hojeISO;
        if (aAtrasada !== bAtrasada) return aAtrasada ? -1 : 1;
        if (a.paga !== b.paga) return a.paga ? 1 : -1;
        return a.vencimento.localeCompare(b.vencimento);
      });
  }, [contasPagar, busca, filtro, hojeISO]);

  const conta = contasPagar.find((c) => c.id === sel) ?? filtered[0];

  function selectConta(id: string) {
    setSel(id);
    setMobileDetail(true);
  }

  async function marcarPaga() {
    if (!conta) return;
    try {
      await upsertContaPagar({ ...conta, paga: true });
      await upsertMovimento({
        tipo: "saida",
        descricao: conta.descricao
          ? `${conta.fornecedor} — ${conta.descricao}`
          : conta.fornecedor,
        valor: conta.valor,
        data: hojeISO,
        categoria: "Fornecedores",
      });
      toast("Marcada como paga.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao marcar.", "error");
    }
  }

  async function apagar() {
    if (!conta) return;
    if (!confirmDelete(conta.fornecedor)) return;
    try {
      await removeContaPagar(conta.id);
      setSel(contasPagar.find((c) => c.id !== conta.id)?.id ?? "");
      setMobileDetail(false);
      toast("Conta apagada.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const lista = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className="search-pill w-full min-w-0 sm:flex-1"
          style={{ maxWidth: "none" }}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar conta…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as Filtro)}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
            aria-label="Filtrar contas"
          >
            <option value="todas">Todas</option>
            <option value="abertas">Em aberto</option>
            <option value="atrasadas">
              Atrasadas{atrasadas.length > 0 ? ` (${atrasadas.length})` : ""}
            </option>
            <option value="pagas">Pagas</option>
          </select>
          <Link
            href="/contas-pagar/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Nova conta</span>
            <span className="sm:hidden">Nova</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={busca || filtro !== "todas" ? "Nenhuma conta encontrada." : "Sem contas a pagar ainda."}
            hint={busca || filtro !== "todas" ? undefined : "Adicione a sua primeira conta."}
          />
        </div>
      ) : (
        <div className="card p-2!">
          <ul className="space-y-0.5">
            {filtered.map((c) => {
              const atrasada = !c.paga && c.vencimento < hojeISO;
              const isActive = conta?.id === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectConta(c.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${
                      isActive ? "bg-strawberry-soft" : "hover:bg-[#f8f8f9]"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        c.paga
                          ? "bg-mint-soft text-mint"
                          : atrasada
                            ? "bg-strawberry-soft text-strawberry"
                            : "bg-caramel-soft text-caramel"
                      }`}
                    >
                      {c.paga ? (
                        <Check className="size-4" strokeWidth={2} />
                      ) : atrasada ? (
                        <AlertTriangle className="size-4" strokeWidth={1.75} />
                      ) : (
                        <Clock className="size-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          isActive
                            ? "text-strawberry"
                            : "text-ink group-hover:text-strawberry"
                        }`}
                      >
                        {c.fornecedor}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        Vence {dataCurta(c.vencimento)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      <span
                        className={`text-sm font-semibold ${
                          c.paga ? "text-muted line-through" : "text-ink"
                        }`}
                      >
                        {mzn(c.valor)}
                      </span>
                      <span
                        className={`text-[0.65rem] font-semibold ${
                          c.paga
                            ? "text-mint"
                            : atrasada
                              ? "text-strawberry"
                              : "text-caramel"
                        }`}
                      >
                        {c.paga ? "Paga" : atrasada ? "Atrasada" : "Em aberto"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const detalhe = conta && (() => {
    const atrasada = !conta.paga && conta.vencimento < hojeISO;

    return (
      <div className="flex flex-col gap-5">
        <div className="card flex items-center gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
              conta.paga
                ? "bg-mint-soft text-mint"
                : atrasada
                  ? "bg-strawberry-soft text-strawberry"
                  : "bg-caramel-soft text-caramel"
            }`}
          >
            {conta.paga ? (
              <Check className="size-5" strokeWidth={2} />
            ) : atrasada ? (
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            ) : (
              <Clock className="size-5" strokeWidth={1.75} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            {atrasada && (
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-strawberry">
                Atrasada
              </p>
            )}
            <p className="truncate text-lg font-semibold text-ink">
              {conta.fornecedor}
            </p>
            {conta.descricao && (
              <p className="truncate text-xs text-muted">{conta.descricao}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/contas-pagar/${conta.id}/editar`}
              className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-[#f4f5f7] hover:text-ink"
              aria-label="Editar"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={apagar}
              className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-strawberry-soft hover:text-strawberry"
              aria-label="Apagar"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Valor</p>
            <p
              className={`mt-0.5 text-base font-semibold ${
                conta.paga ? "text-muted line-through" : "text-ink"
              }`}
            >
              {mzn(conta.valor)}
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Vencimento</p>
            <p
              className={`mt-0.5 text-base font-semibold ${
                atrasada ? "text-strawberry" : "text-ink"
              }`}
            >
              {dataCurta(conta.vencimento)}
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Estado</p>
            <p
              className={`mt-0.5 text-base font-semibold ${
                conta.paga
                  ? "text-mint"
                  : atrasada
                    ? "text-strawberry"
                    : "text-caramel"
              }`}
            >
              {conta.paga ? "Paga" : atrasada ? "Atrasada" : "Em aberto"}
            </p>
          </div>
        </div>

        {!conta.paga && (
          <div className="card">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-ink">Pagamento</h2>
              <p className="text-xs text-muted">
                Marca como paga e regista a saída no fluxo de caixa
              </p>
            </div>
            <button
              type="button"
              onClick={marcarPaga}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-mint py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Check className="size-4" strokeWidth={2} />
              Marcar como paga
            </button>
          </div>
        )}
      </div>
    );
  })();

  return (
    <div className="animate-in">
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:h-[calc(100dvh-8rem)] lg:overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">{lista}</div>
        <div className="lg:h-full lg:overflow-y-auto lg:pb-4">
          {detalhe ?? (
            <div className="card flex items-center justify-center py-16 text-sm text-muted">
              Selecione uma conta para ver os detalhes.
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        {mobileDetail && conta ? detalhe : lista}
      </div>
    </div>
  );
}
