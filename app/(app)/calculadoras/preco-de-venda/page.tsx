"use client";

import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { mzn } from "@/lib/format";

export default function PrecoDeVendaPage() {
  const [custo, setCusto] = useState("");
  const [margem, setMargem] = useState("60");

  const custoNum = parseFloat(custo) || 0;
  const margemNum = parseFloat(margem) || 0;
  const precoVenda = margemNum < 100 && custoNum > 0 ? custoNum / (1 - margemNum / 100) : null;
  const lucroUnidade = precoVenda !== null ? precoVenda - custoNum : null;

  const SUGESTOES = [30, 40, 50, 60, 70];

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/calculadoras"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4f5f7] text-muted transition hover:bg-[#ececee] hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Preço de venda
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Calcula o preço ideal com base no custo e na margem desejada
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Dados do produto</h2>
            <p className="mt-0.5 text-xs text-muted">
              Insere o custo de produção por unidade e a margem de lucro desejada
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Custo por unidade (MT)
              </label>
              <input
                type="number"
                placeholder="ex: 120"
                min="0"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-mint focus:bg-white"
              />
              <p className="mt-1 text-xs text-muted">
                Não sabes o custo? Usa a calculadora{" "}
                <Link href="/calculadoras/custo-por-unidade" className="font-medium text-mint hover:underline">
                  Custo por unidade
                </Link>
                .
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Margem de lucro desejada (%)
              </label>
              <input
                type="number"
                placeholder="ex: 60"
                min="1"
                max="99"
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-[#f8f8f9] px-3 text-sm text-ink placeholder:text-muted/50 outline-none transition focus:border-mint focus:bg-white"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMargem(String(s))}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      margem === String(s)
                        ? "bg-mint text-white"
                        : "bg-[#f4f5f7] text-muted hover:bg-mint-soft hover:text-mint"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className={`card space-y-4 ${precoVenda !== null ? "ring-2 ring-mint/25" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-mint-soft text-mint">
                <TrendingUp className="size-4" strokeWidth={1.75} />
              </span>
              <h2 className="text-sm font-semibold text-ink">Resultado</h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Custo por unidade</span>
                <span className="text-sm font-semibold text-ink">
                  {custoNum > 0 ? mzn(custoNum) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Margem desejada</span>
                <span className="text-sm font-semibold text-ink">
                  {margemNum > 0 ? `${margemNum}%` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Lucro por unidade</span>
                <span className="text-sm font-semibold text-mint">
                  {lucroUnidade !== null ? mzn(Math.round(lucroUnidade)) : "—"}
                </span>
              </div>
              <div className="border-t border-line pt-2.5">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-ink">Preço de venda</span>
                  {precoVenda !== null ? (
                    <span className="text-2xl font-semibold tracking-tight text-mint">
                      {mzn(Math.round(precoVenda))}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {precoVenda !== null && custoNum > 0 && (
            <div className="card space-y-2">
              <p className="text-xs font-medium text-ink">Comparação de margens</p>
              {[30, 40, 50, 60, 70].map((m) => {
                const p = Math.round(custoNum / (1 - m / 100));
                const ativo = m === margemNum;
                return (
                  <div key={m} className="flex items-center justify-between gap-2">
                    <span className={`text-xs ${ativo ? "font-semibold text-mint" : "text-muted"}`}>
                      {m}% margem
                    </span>
                    <span className={`text-sm font-semibold ${ativo ? "text-mint" : "text-ink"}`}>
                      {mzn(p)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
