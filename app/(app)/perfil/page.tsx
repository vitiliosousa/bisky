"use client";

import { clearAuth, fetchMe, profileFromUser } from "@/lib/auth";
import type { PerfilUtilizador } from "@/lib/profile";
import { useStore } from "@/lib/store";
import {
  Building2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShoppingBag,
  Users,
  Cake,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PerfilPage() {
  const router = useRouter();
  const { pedidos, clientes, produtos } = useStore();
  const [perfil, setPerfil] = useState<PerfilUtilizador | null>(null);

  function sair() {
    clearAuth();
    router.replace("/login");
  }

  useEffect(() => {
    function refresh() {
      fetchMe()
        .then((me) => setPerfil(profileFromUser(me)))
        .catch(() => setPerfil(null));
    }
    refresh();
    window.addEventListener("bisky:profile-updated", refresh);
    return () => window.removeEventListener("bisky:profile-updated", refresh);
  }, []);

  const stats = useMemo(() => {
    const ativos = pedidos.filter((p) => p.estado !== "cancelado");
    const mes = new Date().toISOString().slice(0, 7);
    const pedidosMes = ativos.filter((p) => p.dataEntrega.startsWith(mes)).length;
    return {
      pedidos: ativos.length,
      pedidosMes,
      clientes: clientes.length,
      produtos: produtos.length,
    };
  }, [pedidos, clientes, produtos]);

  if (!perfil) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted">
        A carregar…
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <div className="card flex items-center gap-3 sm:items-start sm:gap-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-strawberry text-sm font-bold text-white sm:size-20 sm:text-lg">
          {initials(perfil.nome)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold tracking-tight text-ink text-lg sm:text-3xl sm:whitespace-normal">
            {perfil.nome}
          </h1>
          <p className="mt-0.5 text-sm text-strawberry sm:mt-1">{perfil.papel}</p>
          {perfil.negocio && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted sm:text-sm">
              <Building2 className="size-3.5 shrink-0" strokeWidth={1.75} />
              {perfil.negocio}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/perfil/editar"
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-[#f4f5f7] hover:text-ink"
            aria-label="Editar"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={sair}
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-strawberry-soft hover:text-strawberry"
            aria-label="Sair"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Pedidos
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {stats.pedidos}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Este mês
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {stats.pedidosMes}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Clientes
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {stats.clientes}
          </p>
        </div>
        <div className="card">
          <p className="text-[0.7rem] font-medium text-muted sm:text-xs">
            Produtos
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
            {stats.produtos}
          </p>
        </div>
      </div>

      {perfil.bio && (
        <div className="card">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-ink">Sobre</h2>
            <p className="text-xs text-muted">Uma palavra sobre si</p>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">{perfil.bio}</p>
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-ink">Contactos</h2>
          <p className="text-xs text-muted">Como entrar em contacto</p>
        </div>
        <ul className="space-y-3">
          {perfil.email && (
            <li>
              <a
                href={`mailto:${perfil.email}`}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f5f7] px-3.5 py-3 transition hover:bg-line"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-blueberry">
                  <Mail className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.7rem] font-medium text-muted">
                    Email
                  </span>
                  <span className="block truncate text-sm font-semibold text-ink">
                    {perfil.email}
                  </span>
                </span>
              </a>
            </li>
          )}
          {perfil.telefone && (
            <li>
              <a
                href={`tel:${perfil.telefone}`}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f5f7] px-3.5 py-3 transition hover:bg-line"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-mint">
                  <Phone className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.7rem] font-medium text-muted">
                    Telefone
                  </span>
                  <span className="block truncate text-sm font-semibold text-ink">
                    {perfil.telefone}
                  </span>
                </span>
              </a>
            </li>
          )}
          {perfil.endereco && (
            <li className="flex items-center gap-3 rounded-2xl bg-[#f4f5f7] px-3.5 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-caramel">
                <MapPin className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.7rem] font-medium text-muted">
                  Endereço
                </span>
                <span className="block text-sm font-semibold text-ink">
                  {perfil.endereco}
                </span>
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Link
          href="/pedidos"
          className="card flex items-center gap-3 transition hover:bg-[#fafafa]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-strawberry-soft text-strawberry">
            <ShoppingBag className="size-4.5" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Pedidos</span>
            <span className="block text-xs text-muted">Ver encomendas</span>
          </span>
        </Link>
        <Link
          href="/clientes"
          className="card flex items-center gap-3 transition hover:bg-[#fafafa]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blueberry-soft text-blueberry">
            <Users className="size-4.5" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Clientes</span>
            <span className="block text-xs text-muted">Gerir contactos</span>
          </span>
        </Link>
        <Link
          href="/produtos"
          className="card flex items-center gap-3 transition hover:bg-[#fafafa] sm:col-span-1 col-span-2"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-caramel-soft text-caramel">
            <Cake className="size-4.5" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Produtos</span>
            <span className="block text-xs text-muted">Receitas e preços</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
