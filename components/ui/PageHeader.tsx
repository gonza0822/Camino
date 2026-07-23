import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex shrink-0 flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/90 p-4 shadow-sm backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
