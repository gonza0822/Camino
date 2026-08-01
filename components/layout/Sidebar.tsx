"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { appContent } from "@/lib/content/app";
import { AppDownloadButton } from "@/features/desktop/components/AppDownloadButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: appContent.nav.dashboard },
  { href: "/semanal", label: appContent.nav.weekly },
  { href: "/objetivos-mensuales", label: appContent.nav.monthlyGoals },
  { href: "/objetivos-anuales", label: appContent.nav.annualGoals },
  { href: "/estadisticas", label: appContent.nav.statistics },
  { href: "/calendario", label: appContent.nav.calendar },
  { href: "/futbol", label: appContent.nav.football },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border/70 bg-surface/90 backdrop-blur-md">
      <div className="border-b border-border/70 px-6 py-5">
        <Link href="/" className="inline-flex" onClick={onNavigate}>
          <BrandLogo size={36} wordmarkClassName="text-xl" />
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
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-primary/5 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/70 p-4">
        <AppDownloadButton onNavigate={onNavigate} />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted transition-colors duration-200 hover:bg-primary/5 hover:text-primary cursor-pointer"
        >
          {appContent.auth.logout}
        </button>
      </div>
    </aside>
  );
}
