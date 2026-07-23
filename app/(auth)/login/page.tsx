import Link from "next/link";
import { Suspense } from "react";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { BackgroundGradientAnimation } from "@/components/ui/BackgroundGradientAnimation";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <BackgroundGradientAnimation>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-md">
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
    </BackgroundGradientAnimation>
  );
}
