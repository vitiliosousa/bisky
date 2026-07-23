"use client";

import { Empty } from "@/components/Empty";
import { Pagination } from "@/components/Pagination";
import { useStore } from "@/lib/store";
import { usePagination } from "@/lib/usePagination";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ClientesPage() {
  const { clientes } = useStore();
  const [busca, setBusca] = useState("");

  const filtered = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return clientes
      .filter(
        (c) =>
          !q ||
          c.nome.toLowerCase().includes(q) ||
          c.telefone.toLowerCase().includes(q),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
  }, [clientes, busca]);

  const { page, setPage, totalPages, pageItems, total, pageSize } =
    usePagination(filtered);

  const grupos = useMemo(() => {
    const map = new Map<string, typeof pageItems>();
    for (const c of pageItems) {
      const letra = c.nome[0]?.toUpperCase() ?? "#";
      if (!map.has(letra)) map.set(letra, []);
      map.get(letra)!.push(c);
    }
    return [...map.entries()];
  }, [pageItems]);

  return (
    <div className="animate-in space-y-4">
      <div className="flex items-center gap-2">
        <label className="search-pill min-w-0 flex-1" style={{ maxWidth: "none" }}>
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Pesquisar cliente…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <Link
          href="/clientes/novo"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-strawberry px-5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110"
        >
          <Plus className="size-4" strokeWidth={2.25} />
          <span className="hidden sm:inline">Novo cliente</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {total === 0 ? (
        <div className="card">
          <Empty
            message={busca ? "Nenhum cliente encontrado." : "Sem clientes ainda."}
            hint={busca ? undefined : "Adicione o seu primeiro cliente."}
          />
        </div>
      ) : (
        <>
          <div className="card p-0! overflow-hidden">
            {grupos.map(([letra, grupo], gi) => (
              <div key={letra}>
                <div
                  className={`bg-[#f8f8f9] px-4 py-1.5 ${gi > 0 ? "border-t border-line" : ""}`}
                >
                  <span className="text-xs font-bold text-strawberry">{letra}</span>
                </div>
                <ul>
                  {grupo.map((c, ci) => (
                    <li key={c.id} className={ci > 0 ? "border-t border-line" : ""}>
                      <Link
                        href={`/clientes/${c.id}`}
                        className="group flex items-center gap-3.5 px-4 py-3 transition hover:bg-[#f8f8f9]"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-strawberry text-xs font-bold text-white">
                          {initials(c.nome)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink group-hover:text-strawberry">
                            {c.nome}
                          </span>
                          {c.telefone && (
                            <span className="block truncate text-xs text-muted">
                              {c.telefone}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
