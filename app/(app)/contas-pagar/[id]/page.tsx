"use client";

import { DetailCardActions, DetailTopBar } from "@/components/DetailActions";
import { useConfirmDelete, toast } from "@/components/ui";
import { dataCurta, hoje, maisMeses, mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertTriangle, Check, Clock, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ContaDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { contasPagar, upsertContaPagar, removeContaPagar, upsertMovimento } =
    useStore();
  const { confirm, dialog } = useConfirmDelete();

  const conta = contasPagar.find((c) => c.id === params.id);
  const hojeISO = hoje();

  if (!conta) {
    return (
      <div className="animate-in">
        <div className="card">
          <p className="px-4 py-10 text-center text-sm text-muted">
            Conta não encontrada.
          </p>
        </div>
      </div>
    );
  }

  const atrasada = !conta.paga && conta.vencimento < hojeISO;

  async function marcarPaga() {
    try {
      await upsertContaPagar({ ...conta!, paga: true });
      await upsertMovimento({
        tipo: "saida",
        descricao: conta!.descricao
          ? `${conta!.fornecedor} — ${conta!.descricao}`
          : conta!.fornecedor,
        valor: conta!.valor,
        data: hojeISO,
        categoria: "Fornecedores",
      });
      if (conta!.recorrente) {
        await upsertContaPagar({
          fornecedor: conta!.fornecedor,
          descricao: conta!.descricao,
          valor: conta!.valor,
          vencimento: maisMeses(conta!.vencimento, 1),
          paga: false,
          recorrente: true,
        });
        toast("Paga. Conta do mês seguinte criada.", "success");
      } else {
        toast("Marcada como paga.", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao marcar.", "error");
    }
  }

  async function apagar() {
    if (!await confirm(conta!.fornecedor)) return;
    try {
      await removeContaPagar(conta!.id);
      toast("Conta apagada.", "info");
      router.replace("/contas-pagar");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const editHref = `/contas-pagar/${conta.id}/editar`;

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {dialog}
      <DetailTopBar
        backHref="/contas-pagar"
        backLabel="Contas a pagar"
        editHref={editHref}
        onDelete={apagar}
      />

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
          <p className="truncate text-lg font-semibold text-ink sm:text-xl">
            {conta.fornecedor}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {conta.descricao ? (
              <p className="truncate text-xs text-muted">{conta.descricao}</p>
            ) : null}
            {conta.recorrente ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blueberry">
                <RefreshCw className="size-3" strokeWidth={2} />
                Mensal
              </span>
            ) : null}
          </div>
        </div>
        <DetailCardActions editHref={editHref} onDelete={apagar} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Valor</p>
          <p
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
              conta.paga ? "text-muted line-through" : "text-ink"
            }`}
          >
            {mzn(conta.valor)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Vencimento</p>
          <p
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
              atrasada ? "text-strawberry" : "text-ink"
            }`}
          >
            {dataCurta(conta.vencimento)}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted">Estado</p>
          <p
            className={`mt-0.5 text-base font-semibold sm:text-lg ${
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
              {conta.recorrente
                ? "Marca como paga, regista no caixa e cria a conta do mês seguinte"
                : "Marca como paga e regista a saída no fluxo de caixa"}
            </p>
          </div>
          <button
            type="button"
            onClick={marcarPaga}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-mint py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Check className="size-4" strokeWidth={2} />
            Marcar como paga
          </button>
        </div>
      )}
    </div>
  );
}
