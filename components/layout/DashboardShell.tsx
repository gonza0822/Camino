"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { appContent } from "@/lib/content/app";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils/cn";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };

  const fadeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const mobileMenu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            key="mobile-backdrop"
            type="button"
            aria-label="Cerrar menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 cursor-pointer bg-black/40 lg:hidden"
          />
        )}
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={panelTransition}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/70 bg-surface shadow-xl lg:hidden"
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className="flex h-svh overflow-hidden">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="h-full">
          <Sidebar />
        </div>
      </div>

      {mobileMenu}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-4 border-b border-border/70 bg-surface/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-primary transition-colors duration-200 hover:bg-primary/10 cursor-pointer"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-semibold text-primary">{appContent.appName}</span>
        </header>

        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-5",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
