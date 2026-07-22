"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: appContent.nav.dashboard },
  { href: "/semanal", label: appContent.nav.weekly },
  { href: "/objetivos-mensuales", label: appContent.nav.monthlyGoals },
  { href: "/objetivos-anuales", label: appContent.nav.annualGoals },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-6 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary"
          onClick={onNavigate}
        >
          {appContent.appName}
        </Link>
        <p className="mt-1 text-xs text-muted">{appContent.tagline}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer",
                active
                  ? "bg-cta/10 text-cta"
                  : "text-secondary hover:bg-zinc-100 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-secondary transition-colors duration-200 hover:bg-zinc-100 hover:text-primary cursor-pointer"
        >
          {appContent.auth.logout}
        </button>
      </div>
    </aside>
  );
}
