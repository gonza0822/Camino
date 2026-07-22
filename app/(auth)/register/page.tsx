import Link from "next/link";
import { appContent } from "@/lib/content/app";
import { Card } from "@/components/ui/PageHeader";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            {appContent.appName}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-primary">
            {appContent.auth.registerTitle}
          </h1>
        </div>
        <RegisterForm />
      </Card>
    </div>
  );
}
