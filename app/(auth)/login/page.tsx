import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            {appContent.appName}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-primary">
            {appContent.auth.loginTitle}
          </h1>
        </div>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-zinc-100" />}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
