"use client";

import { Empty } from "@/components/Empty";
import { confirmDelete, toast } from "@/components/ui";
import { mzn } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Check,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function MateriaisPage() {
  const { materiais, upsertMaterial, removeMaterial } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "falta">("todos");
  const [sel, setSel] = useState(materiais[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [reporQty, setReporQty] = useState("");

  const falta = materiais.filter((m) => m.quantidade < m.estoqueMinimo);

  const filtered = useMemo(() =>
    materiais
      .filter((m) => {
        const match = !busca || m.nome.toLowerCase().includes(busca.toLowerCase()) || m.categoria.toLowerCase().includes(busca.toLowerCase());
        const matchFiltro = filtro === "todos" || m.quantidade < m.estoqueMinimo;
        return match && matchFiltro;
      })
      .sort((a, b) => {
        const aF = a.quantidade < a.estoqueMinimo;
        const bF = b.quantidade < b.estoqueMinimo;
        if (aF !== bF) return aF ? -1 : 1;
        return a.nome.localeCompare(b.nome, "pt");
      }),
    [materiais, busca, filtro],
  );

  const mat = materiais.find((m) => m.id === sel) ?? filtered[0];

  function selectMat(id: string) {
    setSel(id);
    setReporQty("");
    setMobileDetail(true);
  }

  async function apagar() {
    if (!mat) return;
    if (!confirmDelete(mat.nome)) return;
    try {
      await removeMaterial(mat.id);
      setSel(materiais.find((m) => m.id !== mat.id)?.id ?? "");
      setMobileDetail(false);
      toast("Material removido.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao apagar.", "error");
    }
  }

  const lista = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="search-pill w-full min-w-0 sm:flex-1" style={{ maxWidth: "none" }}>
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar material…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "todos" | "falta")}
            className="h-10 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#f4f5f7] pl-4 pr-9 text-sm font-medium text-ink-soft outline-none transition focus:ring-2 focus:ring-strawberry-soft sm:flex-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
          >
            <option value="todos">Todos</option>
            <option value="falta">Em falta{falta.length > 0 ? ` (${falta.length})` : ""}</option>
          </select>
          <Link
            href="/materiais/novo"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-4 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110 sm:px-5"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            <span className="hidden sm:inline">Novo</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            message={busca || filtro !== "todos" ? "Nenhum material encontrado." : "Sem materiais ainda."}
            hint={busca || filtro !== "todos" ? undefined : "Adicione o seu primeiro material."}
          />
        </div>
      ) : (
        <div className="card p-2!">
          <ul className="space-y-0.5">
            {filtered.map((m) => {
              const baixo = m.quantidade < m.estoqueMinimo;
              const isActive = mat?.id === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => selectMat(m.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${isActive ? "bg-strawberry-soft" : "hover:bg-[#f8f8f9]"}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${baixo ? "bg-strawberry-soft text-strawberry" : "bg-blueberry text-white"}`}>
                      {baixo ? <AlertTriangle className="size-4" strokeWidth={1.75} /> : <Box className="size-4" strokeWidth={1.75} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-semibold ${isActive ? "text-strawberry" : baixo ? "text-strawberry" : "text-ink group-hover:text-strawberry"}`}>
                        {m.nome}
                      </span>
                      <span className="block truncate text-xs text-muted">{m.categoria}</span>
                    </span>
                    <span className={`shrink-0 text-sm font-semibold ${baixo ? "text-strawberry" : "text-ink"}`}>
                      {m.quantidade} <span className="text-xs font-normal text-muted">{m.unidade}</span>
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

  const detalhe = mat && (() => {
    const baixo = mat.quantidade < mat.estoqueMinimo;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMobileDetail(false)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink lg:hidden"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Materiais
          </button>
          <div className="flex items-center gap-2 lg:ml-auto">
            <Link
              href={`/materiais/${mat.id}/editar`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f4f5f7] px-3.5 text-sm font-semibold text-ink-soft transition hover:bg-line"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
              Editar
            </Link>
            <button
              type="button"
              onClick={apagar}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-strawberry-soft px-3.5 text-sm font-semibold text-strawberry transition hover:brightness-95"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
              Apagar
            </button>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${baixo ? "bg-strawberry-soft text-strawberry" : "bg-blueberry text-white"}`}>
            {baixo ? <AlertTriangle className="size-5" strokeWidth={1.75} /> : <Box className="size-5" strokeWidth={1.75} />}
          </span>
          <div className="min-w-0 flex-1">
            {baixo && <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-strawberry">Abaixo do mínimo</p>}
            <p className="truncate text-lg font-semibold text-ink">{mat.nome}</p>
            <p className="text-xs text-muted">{mat.categoria}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Quantidade</p>
            <p className={`mt-0.5 text-base font-semibold ${baixo ? "text-strawberry" : "text-ink"}`}>
              {mat.quantidade} {mat.unidade}
            </p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Mínimo</p>
            <p className="mt-0.5 text-base font-semibold text-ink">{mat.estoqueMinimo} {mat.unidade}</p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Preço unitário</p>
            <p className="mt-0.5 text-base font-semibold text-ink">{mzn(mat.precoUnitario)}</p>
          </div>
          <div className="card">
            <p className="text-[0.7rem] font-medium text-muted">Valor em stock</p>
            <p className="mt-0.5 text-base font-semibold text-caramel">{mzn(Math.round(mat.quantidade * mat.precoUnitario))}</p>
          </div>
        </div>

        <div className="card">
          <p className="mb-2.5 text-sm font-semibold text-ink">Repor material</p>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder={`Quantidade em ${mat.unidade}`}
              value={reporQty}
              onChange={(e) => setReporQty(e.target.value)}
              className="field min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={async () => {
                const qty = Number(reporQty);
                if (!qty || qty <= 0) return;
                try {
                  await upsertMaterial({ ...mat, quantidade: mat.quantidade + qty });
                  setReporQty("");
                  toast(`+${qty} ${mat.unidade} adicionados.`, "success");
                } catch (err) {
                  toast(
                    err instanceof Error ? err.message : "Erro ao actualizar.",
                    "error",
                  );
                }
              }}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Check className="size-4" strokeWidth={2} />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div className="animate-in">
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-4">
        {lista}
        {detalhe ?? (
          <div className="card flex items-center justify-center py-16 text-sm text-muted">
            Selecione um material para ver os detalhes.
          </div>
        )}
      </div>
      <div className="lg:hidden">{mobileDetail && mat ? detalhe : lista}</div>
    </div>
  );
}
