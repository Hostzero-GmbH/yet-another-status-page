"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// SSR-safe subscription for hydration
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      root.classList.add("dark");
      setIsDark(true);
    }
  }, [mounted]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-border",
        "bg-card text-muted-foreground transition-all duration-200",
        "hover:bg-accent hover:text-foreground"
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
