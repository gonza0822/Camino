import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 20% 20%, rgba(13,148,136,0.22), transparent 55%), radial-gradient(ellipse 55% 45% at 85% 15%, rgba(249,115,22,0.16), transparent 50%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(20,184,166,0.12), transparent 55%)",
        }}
      />
      <Card className="relative w-full max-w-md shadow-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-cta shadow-[0_0_0_3px_rgba(249,115,22,0.2)]"
              aria-hidden
            />
            {appContent.appName}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {appContent.auth.loginTitle}
          </h1>
        </div>
        <Suspense
          fallback={<div className="h-48 animate-pulse rounded-lg bg-primary/10" />}
        >
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
