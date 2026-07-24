"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { hoje, dataCurta, mzn } from "@/lib/format";
import { fetchMe } from "@/lib/auth";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  BarChart3,
  Box,
  Cake,
  Clock3,
  Package,
  ShoppingBag,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

function startOfWeek(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function endOfWeek(iso: string) {
  const s = new Date(startOfWeek(iso) + "T12:00:00");
  s.setDate(s.getDate() + 6);
  return s.toISOString().slice(0, 10);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
};

const MESES_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const chartConfig = {
  receita: {
    label: "Receita",
    color: "var(--strawberry)",
  },
  lucro: {
    label: "Lucro",
    color: "var(--mint)",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { pedidos, ingredientes, contasPagar, movimentos, clientes, produtos } =
    useStore();
  const [user, setUser] = useState("");

  useEffect(() => {
    fetchMe()
      .then((me) => setUser(me.profile?.nome ?? me.email))
      .catch(() => setUser(""));
  }, []);

  const hojeISO = hoje();
  const weekStart = startOfWeek(hojeISO);
  const weekEnd = endOfWeek(hojeISO);
  const entregasHoje = pedidos
    .filter((p) => p.dataEntrega === hojeISO && p.estado !== "cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const semana = pedidos.filter(
    (p) =>
      p.dataEntrega >= weekStart &&
      p.dataEntrega <= weekEnd &&
      p.estado !== "cancelado",
  );
  const mes = hojeISO.slice(0, 7);
  const entradasMes = movimentos
    .filter((m) => m.tipo === "entrada" && m.data.startsWith(mes))
    .reduce((s, m) => s + m.valor, 0);
  const saidasMes = movimentos
    .filter((m) => m.tipo === "saida" && m.data.startsWith(mes))
    .reduce((s, m) => s + m.valor, 0);
  const lucroMes = entradasMes - saidasMes;
  const aPagar = contasPagar.filter((c) => !c.paga);
  const falta = ingredientes.filter((i) => i.quantidadeAtual < i.estoqueMinimo);
  const aReceber = pedidos
    .filter((p) => p.estado !== "cancelado" && p.pago < p.valor)
    .reduce((s, p) => s + (p.valor - p.pago), 0);

  const recentes = [...pedidos]
    .filter((p) => p.estado !== "cancelado")
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, 6);

  const topProdutos = (() => {
    const map = new Map<string, number>();
    for (const p of pedidos) {
      if (p.estado === "cancelado") continue;
      for (const item of p.itens) {
        map.set(item.produtoId, (map.get(item.produtoId) ?? 0) + item.quantidade);
      }
    }
    const max = Math.max(...map.values(), 1);
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({
        produto: produtos.find((p) => p.id === id),
        qty,
        pct: Math.round((qty / max) * 100),
      }))
      .filter((x) => x.produto);
  })();

  const chartData = useMemo(() => {
    const base = new Date(hojeISO + "T12:00:00");
    const months: { key: string; mes: string; receita: number; lucro: number }[] =
      [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(base);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const receita = movimentos
        .filter((m) => m.tipo === "entrada" && m.data.startsWith(key))
        .reduce((s, m) => s + m.valor, 0);
      const despesas = movimentos
        .filter((m) => m.tipo === "saida" && m.data.startsWith(key))
        .reduce((s, m) => s + m.valor, 0);
      months.push({
        key,
        mes: MESES_PT[d.getMonth()],
        receita,
        lucro: receita - despesas,
      });
    }
    return months;
  }, [movimentos]);

  return (
    <div className="animate-in space-y-4 sm:space-y-5">
      {/* ── Saudação ───────────────────────────────────────── */}
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl lg:text-[1.7rem]">
          {saudacao()}, {user.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          {dataCurta(hojeISO)} · Tens{" "}
          <span className="font-semibold text-ink">{entregasHoje.length}</span>{" "}
          {entregasHoje.length === 1 ? "entrega" : "entregas"} hoje
        </p>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4 xl:gap-4">
        <div className="relative overflow-hidden rounded-(--radius-card) bg-strawberry p-4 text-white shadow-sm shadow-strawberry/30 sm:p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% 15%, #fff 0%, transparent 45%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/85 sm:text-sm">
                Receita do mês
              </p>
              <span className="flex size-8 items-center justify-center rounded-full bg-white/20 sm:size-10">
                <Wallet className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">
              {mzn(entradasMes)}
            </p>
          </div>
        </div>

        <div className="card flex flex-col justify-between !p-3.5 sm:!p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">
              Pedidos da semana
            </p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blueberry-soft text-blueberry sm:size-10">
              <ShoppingBag className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:mt-3 sm:text-3xl">
            {semana.length}
          </p>
          <p className="mt-1.5 text-[0.7rem] text-muted sm:mt-2 sm:text-xs">
            {entregasHoje.length} para entregar hoje
          </p>
        </div>

        <Link
          href="/pedidos?falta=1"
          className="card flex flex-col justify-between !p-3.5 transition hover:ring-2 hover:ring-mint/40 sm:!p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">A receber</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint sm:size-10">
              <Clock3 className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:mt-3 sm:text-3xl">
            {mzn(aReceber)}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-mint sm:mt-2 sm:text-xs">
            Ver quem deve <ArrowRight className="size-3" />
          </p>
        </Link>

        <Link
          href="/caixa"
          className="card flex flex-col justify-between !p-3.5 transition hover:ring-2 hover:ring-mint/40 sm:!p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted sm:text-sm">
              Lucro do mês
            </p>
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10 ${
                lucroMes >= 0
                  ? "bg-mint-soft text-mint"
                  : "bg-strawberry-soft text-strawberry"
              }`}
            >
              <Wallet className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
            </span>
          </div>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl ${
              lucroMes >= 0 ? "text-ink" : "text-strawberry"
            }`}
          >
            {mzn(lucroMes)}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-mint sm:mt-2 sm:text-xs">
            Ver caixa <ArrowRight className="size-3" />
          </p>
        </Link>
      </div>

      {/* ── Atalhos (só mobile) ────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 lg:hidden">
        {[
          { href: "/clientes",     icon: Users,         label: "Clientes",       color: "bg-blueberry-soft text-blueberry" },
          { href: "/produtos",     icon: Cake,          label: "Produtos",       color: "bg-strawberry-soft text-strawberry" },
          { href: "/ingredientes", icon: Package,       label: "Ingredientes",   color: "bg-blueberry-soft text-blueberry" },
          { href: "/materiais",    icon: Box,           label: "Materiais",      color: "bg-blueberry-soft text-blueberry" },
          { href: "/perdas",       icon: Trash2,        label: "Perdas",         color: "bg-strawberry-soft text-strawberry" },
          { href: "/caixa",        icon: Wallet,        label: "Caixa",          color: "bg-mint-soft text-mint" },
          { href: "/contas-pagar", icon: ArrowDownLeft, label: "Contas",         color: "bg-caramel-soft text-caramel" },
          { href: "/relatorios",   icon: BarChart3,     label: "Relatórios",     color: "bg-blueberry-soft text-blueberry" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition active:bg-[#f4f5f7]"
            >
              <span className={`flex size-12 items-center justify-center rounded-full ${item.color}`}>
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="text-[0.65rem] font-semibold leading-tight text-ink">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Gráfico receita × lucro ────────────────────────── */}
      <div className="card">
        <div className="mb-4 flex flex-col gap-1 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Receita e lucro
            </h2>
            <p className="text-xs text-muted">Últimos 6 meses</p>
          </div>
          <Link
            href="/caixa"
            className="inline-flex items-center gap-1 text-xs font-semibold text-strawberry hover:underline"
          >
            Ver caixa <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full sm:h-[280px]"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={11}
              width={48}
              tickFormatter={(v) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-[var(--muted)]">
                        {name === "receita" ? "Receita" : "Lucro"}
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {mzn(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="receita"
              fill="var(--color-receita)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="lucro"
              fill="var(--color-lucro)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </div>

      {/* ── Pedidos recentes + alertas ─────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card min-w-0 overflow-hidden">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-base font-semibold text-ink">
              Pedidos recentes
            </h2>
            <Link
              href="/pedidos"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-strawberry hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sem pedidos ainda.</p>
          ) : (
            <ul className="min-w-0">
              {recentes.map((p) => {
                const c = clientes.find((x) => x.id === p.clienteId);
                const first = p.itens[0];
                const firstNome = first
                  ? (produtos.find((x) => x.id === first.produtoId)?.nome ?? "?")
                  : "";
                const itens =
                  p.itens.length === 0
                    ? "—"
                    : p.itens.length === 1
                      ? `${first!.quantidade}× ${firstNome}`
                      : `${first!.quantidade}× ${firstNome} · +${p.itens.length - 1}`;
                const faltaPagar = p.valor - p.pago;
                return (
                  <li key={p.id} className="min-w-0">
                    <Link
                      href={`/pedidos/${p.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-2xl px-1.5 py-3 transition hover:bg-[#f4f5f7] sm:px-2"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-[0.7rem] font-bold text-strawberry">
                        {initials(c?.nome ?? "?")}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold text-ink">
                          {c?.nome ?? "—"}
                        </p>
                        <p className="truncate text-xs text-muted">{itens}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <p className="text-sm font-semibold text-ink">{mzn(p.valor)}</p>
                        {faltaPagar > 0 && (
                          <p className="text-[0.65rem] font-semibold text-strawberry">
                            falta {mzn(faltaPagar)}
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

        <div className="card min-w-0 overflow-hidden">
          <h2 className="text-base font-semibold text-ink">Precisa de atenção</h2>
          <ul className="mt-3 space-y-2">
            {falta.length === 0 && aPagar.length === 0 && (
              <li className="rounded-2xl bg-mint-soft px-3.5 py-3 text-sm font-medium text-mint">
                Tudo em ordem — sem alertas.
              </li>
            )}
            {falta.map((i) => (
              <li key={i.id}>
                <Link
                  href="/ingredientes"
                  className="flex items-center gap-3 rounded-2xl bg-strawberry-soft/60 px-3 py-2.5 transition hover:bg-strawberry-soft sm:px-3.5 sm:py-3"
                >
                  <AlertTriangle
                    className="size-4 shrink-0 text-strawberry"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-strawberry">
                      Falta {i.nome.toLowerCase()}
                    </span>
                    <span className="block text-xs text-strawberry/70">
                      {i.quantidadeAtual} {i.unidade} · mín. {i.estoqueMinimo}
                    </span>
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-strawberry" />
                </Link>
              </li>
            ))}
            {aPagar.slice(0, 2).map((c) => (
              <li key={c.id}>
                <Link
                  href="/contas-pagar"
                  className="flex items-center gap-3 rounded-2xl bg-caramel-soft/60 px-3 py-2.5 transition hover:bg-caramel-soft sm:px-3.5 sm:py-3"
                >
                  <Wallet
                    className="size-4 shrink-0 text-caramel"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-chocolate">
                      {c.fornecedor}
                    </span>
                    <span className="block text-xs text-chocolate/60">
                      {mzn(c.valor)} · vence {dataCurta(c.vencimento)}
                    </span>
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-caramel" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Produtos populares ─────────────────────────────── */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Produtos populares</h2>
          <Link
            href="/produtos"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-strawberry hover:underline"
          >
            Ver tudo <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {topProdutos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Sem dados de vendas ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {topProdutos.map(({ produto, qty, pct }) => {
              if (!produto) return null;
              return (
                <li key={produto.id} className="flex items-center gap-3 sm:gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#f4f5f7] text-strawberry sm:size-10">
                    <Package className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {produto.nome}
                      </p>
                      <p className="shrink-0 text-[0.7rem] text-muted sm:text-xs">
                        {qty} un. · {mzn(produto.preco)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f4f5f7]">
                      <div
                        className="h-full rounded-full bg-strawberry"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
