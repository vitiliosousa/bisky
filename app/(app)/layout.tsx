"use client";

import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
