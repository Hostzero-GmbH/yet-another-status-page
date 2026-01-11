"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

// SSR-safe subscription for hydration
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface HeaderProps {
  siteName: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Header({
  siteName,
  logoLightUrl,
  logoDarkUrl,
  subtitle = "System Status",
  children,
}: HeaderProps) {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored === "dark" || (!stored && prefersDark));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [mounted]);

  const logoSrc = mounted && isDark ? logoDarkUrl : logoLightUrl;
  const hasLogo = logoLightUrl || logoDarkUrl;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            {!mounted ? (
              <div className="h-10 w-[150px] bg-muted rounded animate-pulse" />
            ) : hasLogo && logoSrc ? (
              <Image
                src={logoSrc}
                alt={siteName}
                width={150}
                height={35}
                className="h-10 w-auto"
                priority
                unoptimized
              />
            ) : (
              <span className="text-xl font-bold text-foreground">{siteName}</span>
            )}
          </Link>
          <div className="h-6 w-px bg-border" />
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
