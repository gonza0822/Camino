import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variant === "primary" &&
          "bg-cta text-white shadow-sm hover:bg-cta-hover",
        variant === "secondary" &&
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
        variant === "ghost" && "text-muted hover:bg-primary/10 hover:text-primary",
        variant === "danger" && "bg-red-600 text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
