"use client";

import { toast, type FormSubmit } from "@/components/ui";
import { formatQty } from "@/lib/cost";
import { hoje } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Unidade } from "@/lib/types";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const MOTIVOS = [
  "Ovos partidos",
  "Calda que sobrou",
  "Receita de teste",
  "Deterioração",
  "Erro de preparo",
  "Embalagem danificada",
  "Produto queimado",
  "Produto danificado",
  "Outro",
];

type TipoPerda = "ingrediente" | "produto";

export default function NovaPerdaPage() {
  const router = useRouter();
  const { ingredientes, produtos, registarPerda } = useStore();
  const [tipo, setTipo] = useState<TipoPerda>("ingrediente");
  const [itemId, setItemId] = useState("");
  const [busca, setBusca] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [data, setData] = useState(hoje());
  const [loading, setLoading] = useState(false);

  const ing = tipo === "ingrediente"
    ? ingredientes.find((i) => i.id === itemId)
    : undefined;
  const prod = tipo === "produto"
    ? produtos.find((p) => p.id === itemId)
    : undefined;

  const ingredientesFiltrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return ingredientes
      .filter((i) => !q || i.nome.toLowerCase().includes(q))
      .slice(0, 12);
  }, [busca, ingredientes]);

  const produtosFiltrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return produtos
      .filter((p) => !q || p.nome.toLowerCase().includes(q))
      .slice(0, 12);
  }, [busca, produtos]);

  const nomeSel = ing?.nome ?? prod?.nome;
  const unidade = (ing?.unidade ?? "un") as Unidade;
  const vazio =
    tipo === "ingrediente" ? ingredientes.length === 0 : produtos.length === 0;

  function mudarTipo(t: TipoPerda) {
    setTipo(t);
    setItemId("");
    setBusca("");
    setDropOpen(false);
  }

  async function onSubmit(e: FormSubmit) {
    e.preventDefault();
    const qty = Number(quantidade);
    if (!itemId || !qty || qty <= 0) {
      toast(
        tipo === "ingrediente"
          ? "Seleccione um ingrediente."
          : "Seleccione um produto.",
        "info",
      );
      return;
    }
    setLoading(true);
    try {
      await registarPerda({
        tipo,
        ingredienteId: tipo === "ingrediente" ? itemId : undefined,
        produtoId: tipo === "produto" ? itemId : undefined,
        quantidade: qty,
        motivo,
        data,
      });
      toast(
        tipo === "ingrediente"
          ? `Perda de ${formatQty(qty, unidade)} de ${nomeSel} registada.`
          : `Perda de ${qty}× ${nomeSel} registada.`,
        "info",
      );
      router.replace("/perdas");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao registar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in space-y-5">
      <Link
        href="/perdas"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Perdas
      </Link>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Dados da perda</h2>
            <p className="text-xs text-muted">
              Tipo, item, quantidade e motivo
            </p>
          </div>

          <div className="form-grid sm:grid-cols-2 sm:gap-x-3">
            <div className="lbl sm:col-span-2">
              Tipo de perda
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(
                  [
                    ["ingrediente", "Ingrediente"],
                    ["produto", "Produto"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => mudarTipo(value)}
                    className={`h-10 rounded-full text-sm font-semibold transition ${
                      tipo === value
                        ? "bg-strawberry text-white shadow-sm shadow-strawberry/25"
                        : "bg-[#f4f5f7] text-ink-soft hover:bg-line"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {vazio ? (
              <p className="sm:col-span-2 rounded-2xl bg-[#f4f5f7] px-4 py-8 text-center text-sm text-muted">
                {tipo === "ingrediente"
                  ? "Não há ingredientes no estoque para registar perdas."
                  : "Não há produtos cadastrados para registar perdas."}
              </p>
            ) : (
              <>
              <div className="lbl sm:col-span-2">
                {tipo === "ingrediente" ? "Ingrediente" : "Produto"}
                <div className="relative mt-1.5">
                  <label className="search-pill w-full" style={{ maxWidth: "none" }}>
                    <Search className="size-4 shrink-0" strokeWidth={1.75} />
                    <input
                      type="search"
                      placeholder={
                        nomeSel
                          ? nomeSel
                          : tipo === "ingrediente"
                            ? "Pesquisar ingrediente…"
                            : "Pesquisar produto…"
                      }
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setDropOpen(true);
                        if (itemId) setItemId("");
                      }}
                      onFocus={() => setDropOpen(true)}
                      onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                    />
                  </label>
                  {dropOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-56 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-(--shadow-modal)">
                      {tipo === "ingrediente" ? (
                        ingredientesFiltrados.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-muted">
                            Nenhum resultado.
                          </p>
                        ) : (
                          ingredientesFiltrados.map((i) => (
                            <button
                              key={i.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setItemId(i.id);
                                setBusca("");
                                setDropOpen(false);
                              }}
                              className={`flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-[#f4f5f7] ${
                                i.id === itemId ? "bg-strawberry-soft" : ""
                              }`}
                            >
                              <span className="text-sm font-medium text-ink">
                                {i.nome}
                              </span>
                              <span className="text-xs text-muted">
                                {formatQty(i.quantidadeAtual, i.unidade)} disponível
                              </span>
                            </button>
                          ))
                        )
                      ) : produtosFiltrados.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted">
                          Nenhum resultado.
                        </p>
                      ) : (
                        produtosFiltrados.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setItemId(p.id);
                              setBusca("");
                              setDropOpen(false);
                            }}
                            className={`flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-[#f4f5f7] ${
                              p.id === itemId ? "bg-strawberry-soft" : ""
                            }`}
                          >
                            <span className="text-sm font-medium text-ink">
                              {p.nome}
                            </span>
                            <span className="text-xs text-muted">{p.categoria}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {nomeSel && (
                  <p className="mt-1.5 text-xs text-muted">
                    Selecionado:{" "}
                    <span className="font-semibold text-ink">{nomeSel}</span>
                  </p>
                )}
              </div>

              <label className="lbl">
                Quantidade ({tipo === "produto" ? "un" : unidade})
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="field"
                  placeholder={tipo === "produto" ? "Ex.: 1" : "Ex.: 0.5"}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </label>

              <label className="lbl">
                Data
                <input
                  type="date"
                  className="field"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </label>

              <label className="lbl sm:col-span-2">
                Motivo
                <select
                  className="field"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              </>
            )}
          </div>

          {!vazio && tipo === "produto" && (
            <p className="rounded-2xl bg-[#f4f5f7] px-4 py-3 text-xs text-muted">
              Ao registar perda de produto, o stock dos ingredientes e materiais
              da receita é baixado automaticamente.
            </p>
          )}
        </div>

        {!vazio && (
          <div className="mt-6 flex gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/perdas"
              className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#f4f5f7] px-5 text-sm font-semibold text-ink-soft transition hover:bg-line sm:w-auto"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
            >
              {loading && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              Registar perda
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
