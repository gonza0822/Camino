import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BackgroundGradientAnimation } from "@/components/ui/BackgroundGradientAnimation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <BackgroundGradientAnimation>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-md sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center">
            <Link
              href="/"
              className="inline-flex flex-col items-center gap-3 rounded-xl transition-opacity duration-200 hover:opacity-90"
              aria-label={appContent.appName}
            >
              <BrandLogo
                size={72}
                priority
                showWordmark={false}
                className="gap-0"
              />
              <span className="text-3xl font-bold tracking-tight text-primary">
                {appContent.appName}
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted">{appContent.tagline}</p>
            <h1 className="mt-5 text-xl font-semibold text-foreground">
              {appContent.auth.registerTitle}
            </h1>
          </div>
          <RegisterForm />
        </Card>
      </div>
    </BackgroundGradientAnimation>
  );
}
