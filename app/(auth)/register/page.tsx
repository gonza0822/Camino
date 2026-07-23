import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { BackgroundGradientAnimation } from "@/components/ui/BackgroundGradientAnimation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
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
              {appContent.auth.registerTitle}
            </h1>
          </div>
          <RegisterForm />
        </Card>
      </div>
    </BackgroundGradientAnimation>
  );
}
