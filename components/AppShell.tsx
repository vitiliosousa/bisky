"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Menu,
  Plus,
} from "lucide-react";
import { Header } from "./Header";
import { NAV_ALL, Sidebar } from "./Sidebar";
import { Toaster } from "./ui";
import { clearAuth, fetchMe, isAuthenticated } from "@/lib/auth";
import { useStore } from "@/lib/store";

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/mais", label: "Mais", icon: Menu },
];

/** Rotas que pertencem ao tab "Mais" (para manter activo). */
const MAIS_PREFIXES = [
  "/mais",
  "/clientes",
  "/produtos",
  "/calendario",
  "/materiais",
  "/perdas",
  "/caixa",
  "/contas-pagar",
  "/relatorios",
  "/perfil",
  "/negocio",
  "/financas",
];

function isTabActive(href: string, pathname: string) {
  if (href === "/mais") {
    return MAIS_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function getPageInfo(pathname: string) {
  if (pathname === "/produtos/novo") {
    return { title: "Novo produto", subtitle: "Cadastre um produto e a sua receita" };
  }
  if (pathname.startsWith("/produtos/") && pathname.endsWith("/editar")) {
    return { title: "Editar produto", subtitle: "Atualize os dados e a receita" };
  }
  if (pathname.startsWith("/produtos/") && pathname !== "/produtos") {
    return { title: "Detalhe do produto", subtitle: "Receita, custos e preços" };
  }
  if (pathname === "/clientes/novo") {
    return { title: "Novo cliente", subtitle: "Cadastre um cliente" };
  }
  if (pathname.startsWith("/clientes/") && pathname.endsWith("/editar")) {
    return { title: "Editar cliente", subtitle: "Atualize os dados do cliente" };
  }
  if (pathname.startsWith("/clientes/") && pathname !== "/clientes") {
    return { title: "Detalhe do cliente", subtitle: "Histórico e contactos" };
  }
  if (pathname === "/caixa/novo") {
    return { title: "Novo movimento", subtitle: "Registe uma entrada ou saída" };
  }
  if (pathname.startsWith("/caixa/") && pathname.endsWith("/editar")) {
    return { title: "Editar movimento", subtitle: "Atualize o registo de caixa" };
  }
  if (pathname.startsWith("/caixa/") && pathname !== "/caixa") {
    return { title: "Detalhe do movimento", subtitle: "Entrada ou saída de caixa" };
  }
  if (pathname === "/pedidos/novo") {
    return { title: "Novo pedido", subtitle: "Cliente, produtos e entrega" };
  }
  if (pathname.startsWith("/pedidos/") && pathname.endsWith("/editar")) {
    return { title: "Editar pedido", subtitle: "Atualize os dados do pedido" };
  }
  if (pathname === "/calendario/novo") {
    return { title: "Novo evento", subtitle: "Agende uma entrega ou festa" };
  }
  if (pathname.startsWith("/calendario/") && pathname.endsWith("/editar")) {
    return { title: "Editar evento", subtitle: "Atualize o evento do calendário" };
  }
  if (pathname.startsWith("/calendario/") && pathname !== "/calendario") {
    return { title: "Detalhe do evento", subtitle: "Data, hora e tipo" };
  }
  if (pathname === "/contas-pagar/novo") {
    return { title: "Nova conta", subtitle: "Fornecedor, valor e vencimento" };
  }
  if (pathname.startsWith("/contas-pagar/") && pathname.endsWith("/editar")) {
    return { title: "Editar conta", subtitle: "Atualize os dados da conta" };
  }
  if (pathname === "/negocio") {
    return { title: "Negócio", subtitle: "Clientes, produtos e operações" };
  }
  if (pathname === "/financas") {
    return { title: "Finanças", subtitle: "Caixa, contas e relatórios" };
  }
  if (pathname === "/mais") {
    return { title: "Mais", subtitle: "Todas as secções" };
  }
  if (pathname === "/perdas") {
    return { title: "Perdas", subtitle: "Desperdícios e baixas de stock" };
  }
  if (pathname === "/materiais") {
    return { title: "Materiais", subtitle: "Caixas, fitas e outros consumíveis" };
  }
  if (pathname === "/materiais/novo") {
    return { title: "Novo material", subtitle: "Cadastre um consumível" };
  }
  if (pathname.includes("/materiais/") && pathname.endsWith("/editar")) {
    return { title: "Editar material", subtitle: "Actualize os dados" };
  }
  if (pathname === "/estoque/novo") {
    return { title: "Novo ingrediente", subtitle: "Cadastre no estoque" };
  }
  if (pathname.startsWith("/estoque/") && pathname.endsWith("/editar")) {
    return { title: "Editar ingrediente", subtitle: "Atualize quantidade e custos" };
  }
  if (pathname === "/perfil/editar") {
    return { title: "Editar perfil", subtitle: "Atualize os seus dados" };
  }
  if (pathname === "/perfil") {
    return { title: "Perfil", subtitle: "Os seus dados e contactos" };
  }
  const item = NAV_ALL.find((n) => n.href === pathname);
  return { title: item?.label ?? "Bisky", subtitle: item?.subtitle ?? "" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading: storeLoading } = useStore();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState("");
  const [papel, setPapel] = useState("Confeiteira");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    async function loadUser() {
      try {
        const me = await fetchMe();
        setUser(me.profile?.nome ?? me.email);
        setPapel(me.profile?.papel ?? "Confeiteira");
        setReady(true);
      } catch {
        clearAuth();
        router.replace("/login");
      }
    }

    function refreshUser() {
      fetchMe()
        .then((me) => {
          setUser(me.profile?.nome ?? me.email);
          setPapel(me.profile?.papel ?? "Confeiteira");
        })
        .catch(() => undefined);
    }

    loadUser();
    window.addEventListener("bisky:profile-updated", refreshUser);
    window.addEventListener("bisky:unauthorized", () => {
      clearAuth();
      router.replace("/login");
    });
    return () => {
      window.removeEventListener("bisky:profile-updated", refreshUser);
    };
  }, [router]);

  function sair() {
    clearAuth();
    router.replace("/login");
  }

  if (!ready || storeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <svg
          width="82"
          height="58"
          viewBox="0 0 82 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-auto animate-pulse text-strawberry"
          aria-label="A carregar…"
        >
          <path
            fill="currentColor"
            d="M29.2384 3.09275C30.8726 3.09345 34.7539 7.77903 34.754 9.75096C34.754 10.9299 35.0923 10.9282 37.004 9.73533C43.905 5.42833 47.5769 7.32435 45.7159 14.2344C44.9221 17.1829 44.8887 18.6378 45.6075 18.8769C47.5856 19.5373 51.7536 23.2387 51.754 24.3369C51.754 26.3509 48.4736 29.0928 46.0646 29.0928C43.7951 29.0928 43.7152 29.3188 44.3341 33.9824C45.572 43.3141 41.756 48.9662 30.9933 53.7431C19.0593 59.0391 5.67284 58.9507 2.13586 53.5527C-1.79179 47.5574 -0.0577465 29.5661 5.33605 20.3642C8.38602 15.1593 13.9011 12.0928 20.214 12.0928C24.2718 12.0928 24.754 11.8511 24.754 9.81639C24.754 8.56355 25.4548 6.53844 26.3107 5.31639C27.1666 4.09347 28.4844 3.09289 29.2384 3.09275ZM19.1388 16.0967C11.6691 16.0899 6.73186 22.3321 4.80285 34.2217C3.50388 42.2265 3.47802 48.5425 4.75598 45.5928C5.23196 44.4926 5.91081 41.8315 6.26379 39.6787C6.8897 35.8622 6.93581 35.8253 8.10461 38.1699C8.76458 39.4928 10.1621 40.7403 11.2111 40.9424C12.2591 41.1445 15.3361 42.8362 18.048 44.7012C20.7598 46.5671 23.7902 48.0926 24.7833 48.0928C25.7752 48.0929 26.7636 48.6245 26.9806 49.2744C27.549 50.979 36.4629 46.4672 38.4161 43.4863C40.198 40.7675 39.5041 36.0934 37.3185 36.0928C36.5505 36.0927 35.771 35.7358 35.587 35.2998C35.4034 34.8635 33.6482 33.5288 31.6866 32.332C28.3142 30.2754 28.0262 30.2504 26.4015 31.874C24.9317 33.3438 24.552 33.3831 23.7882 32.1474C22.6203 30.2585 24.3033 27.1168 26.5392 27.0137C27.636 26.9636 27.7908 26.7489 26.9698 26.4199C26.2638 26.1361 25.0286 26.4503 24.2247 27.1172C23.0669 28.0779 22.2706 28.0073 20.3859 26.7724C19.0789 25.9155 17.1126 25.4484 16.0187 25.7344C12.8853 26.5538 12.3486 23.4055 15.2931 21.4756C17.117 20.2806 19.3461 19.9681 23.7609 20.2871C27.0538 20.5259 29.749 20.573 29.754 20.3926C29.754 20.2116 28.292 19.172 26.504 18.082C24.659 16.9571 21.4747 16.0987 19.1388 16.0967ZM20.6974 42.2002C21.9154 39.9243 24.2215 39.4214 25.3165 41.1943C26.3547 42.8745 22.0469 46.786 20.672 45.4111C19.8671 44.6061 19.8745 43.7371 20.6974 42.2002ZM74.754 35.4678C74.7541 34.1781 75.3084 34.3995 77.2062 36.4472C78.5551 37.9021 80.2421 39.1221 80.9562 39.1562C81.6699 39.1913 81.1991 39.6422 79.9103 40.1592C78.6205 40.6761 77.3303 41.9968 77.0431 43.0957C76.7561 44.1936 76.176 45.0928 75.754 45.0928C75.332 45.0925 74.7519 44.1935 74.465 43.0957C74.1778 41.9968 72.9626 40.7359 71.7667 40.2929C69.6123 39.4961 69.6165 39.4772 72.172 38.3125C73.592 37.6655 74.754 36.3857 74.754 35.4678ZM32.2111 37.1396C34.2749 34.8589 35.754 35.2957 35.754 38.1836C35.7536 40.5242 33.0838 41.8229 31.5099 40.249C30.6981 39.4371 30.8862 38.6045 32.2111 37.1396ZM14.2892 32.0928C16.436 32.093 16.0765 35.8505 13.8146 37.0615C11.3431 38.3829 10.2735 36.8609 11.7433 34.1142C12.3382 33.0023 13.4842 32.0929 14.2892 32.0928ZM47.2042 24.2217C45.866 22.9948 41.1808 22.0005 40.4025 22.7783C38.8576 24.3232 40.0384 25.0927 43.9542 25.0928C46.3991 25.0927 47.7572 24.7286 47.2042 24.2217ZM66.8087 0.592753C66.8498-0.714705 67.6299 0.150372 69.0626 3.09275C70.7186 6.49372 72.3386 8.11268 75.6925 9.72166L80.129 11.8525L77.1925 12.5205C73.1377 13.4425 71.3893 14.9462 69.0304 19.5459L67.0021 23.499L66.3214 20.4004C65.5284 16.7894 63.5133 14.7356 58.8243 12.7637L55.4532 11.3467L59.1808 10.1172C63.0618 8.83617 66.6927 4.30274 66.8087 0.592753ZM42.754 13.0166C42.754 11.3946 39.822 12.0249 37.754 14.0928C35.7232 16.1237 35.0024 20.0925 36.6652 20.0928C37.7742 20.0923 42.7527 14.3076 42.754 13.0166ZM29.3527 7.09275C29.1604 7.09537 28.7075 8.55648 28.3468 10.3428C27.8118 12.9855 28.1151 13.943 29.9718 15.4648C32.2127 17.3027 32.2596 17.3 32.5646 15.2822C32.7356 14.1532 32.1612 11.8481 31.2892 10.1611C30.4172 8.47312 29.5447 7.09275 29.3527 7.09275Z"
          />
        </svg>
      </div>
    );
  }

  const page = getPageInfo(pathname);

  return (
    <div className="flex min-h-dvh bg-page">
      <Sidebar pathname={pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pageTitle={page.title}
          pageSubtitle={page.subtitle}
          user={user}
          papel={papel}
          onSair={sair}
        />

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
          {children}
        </main>
        <Toaster />

        {/* Bottom nav — só mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex items-stretch border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {BOTTOM_NAV.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-14 text-[0.65rem] font-semibold transition-colors ${
                  active ? "text-strawberry" : "text-muted"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}

          <div className="flex flex-1 items-center justify-center">
            <Link
              href="/pedidos/novo"
              className="-mt-3 flex size-14 items-center justify-center rounded-full bg-strawberry shadow-md shadow-strawberry/30 transition hover:brightness-110"
              aria-label="Novo pedido"
            >
              <Plus className="size-6 text-white" strokeWidth={2.5} />
            </Link>
          </div>

          {BOTTOM_NAV.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-14 text-[0.65rem] font-semibold transition-colors ${
                  active ? "text-strawberry" : "text-muted"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
