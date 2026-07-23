"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function Progress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // Route changed → complete bar and fade out
  useEffect(() => {
    if (!visible) return;
    clearTimers();
    setWidth(100);
    const t = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
    timers.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Listen for internal link clicks to start the bar
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;
      clearTimers();
      setVisible(true);
      setWidth(15);
      const t1 = setTimeout(() => setWidth(50), 120);
      const t2 = setTimeout(() => setWidth(75), 600);
      timers.current.push(t1, t2);
    }
    document.addEventListener("click", onLinkClick);
    return () => {
      document.removeEventListener("click", onLinkClick);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[9999] h-0.5 bg-strawberry"
      style={{
        width: `${width}%`,
        transition: width === 100 ? "width 0.25s ease-out" : "width 0.4s ease-out",
      }}
    />
  );
}

export function NavProgress() {
  return (
    <Suspense>
      <Progress />
    </Suspense>
  );
}
