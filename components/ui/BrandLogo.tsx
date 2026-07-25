import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { appContent } from "@/lib/content/app";

interface BrandLogoProps {
  className?: string;
  /** Image size in pixels (square). */
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  priority?: boolean;
}

// Renders the Camino mark, optionally with the wordmark text.
export function BrandLogo({
  className,
  size = 32,
  showWordmark = true,
  wordmarkClassName,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/logo-camino.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="shrink-0 rounded-lg object-contain"
        aria-hidden={showWordmark}
      />
      {showWordmark ? (
        <span className={cn("font-bold tracking-tight text-primary", wordmarkClassName)}>
          {appContent.appName}
        </span>
      ) : (
        <span className="sr-only">{appContent.appName}</span>
      )}
    </span>
  );
}
