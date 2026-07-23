"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}

// Animated multi-blob gradient backdrop with optional pointer-follow highlight.
export function BackgroundGradientAnimation({
  gradientBackgroundStart = "rgb(240, 253, 250)",
  gradientBackgroundEnd = "rgb(255, 247, 237)",
  firstColor = "13, 148, 136",
  secondColor = "20, 184, 166",
  thirdColor = "45, 212, 191",
  fourthColor = "249, 115, 22",
  fifthColor = "251, 146, 60",
  pointerColor = "13, 148, 136",
  size = "80%",
  blendingValue = "soft-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: BackgroundGradientAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);
  const curRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isSafari, setIsSafari] = useState(false);
  const canInteract = interactive && !prefersReducedMotion;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    el.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    el.style.setProperty("--first-color", firstColor);
    el.style.setProperty("--second-color", secondColor);
    el.style.setProperty("--third-color", thirdColor);
    el.style.setProperty("--fourth-color", fourthColor);
    el.style.setProperty("--fifth-color", fifthColor);
    el.style.setProperty("--pointer-color", pointerColor);
    el.style.setProperty("--size", size);
    el.style.setProperty("--blending-value", blendingValue);
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    size,
    blendingValue,
  ]);

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!canInteract) return;

    function tick() {
      const node = interactiveRef.current;
      if (!node) return;

      curRef.current.x += (targetRef.current.x - curRef.current.x) / 20;
      curRef.current.y += (targetRef.current.y - curRef.current.y) / 20;
      node.style.transform = `translate(${Math.round(curRef.current.x)}px, ${Math.round(curRef.current.y)}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [canInteract]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!canInteract || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        "bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName,
      )}
    >
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id="camino-gradient-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#camino-gradient-blur)_blur(40px)]",
        )}
        aria-hidden
      >
        <div
          className={cn(
            "absolute opacity-100",
            "h-[var(--size)] w-[var(--size)]",
            "left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)]",
            "[background:radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0,rgba(var(--first-color),0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)] [transform-origin:center_center]",
            !prefersReducedMotion && "animate-gradient-first",
          )}
        />
        <div
          className={cn(
            "absolute opacity-100",
            "h-[var(--size)] w-[var(--size)]",
            "left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)]",
            "[background:radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0,rgba(var(--second-color),0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)] [transform-origin:calc(50%-400px)]",
            !prefersReducedMotion && "animate-gradient-second",
          )}
        />
        <div
          className={cn(
            "absolute opacity-100",
            "h-[var(--size)] w-[var(--size)]",
            "left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)]",
            "[background:radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0,rgba(var(--third-color),0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)] [transform-origin:calc(50%+400px)]",
            !prefersReducedMotion && "animate-gradient-third",
          )}
        />
        <div
          className={cn(
            "absolute opacity-70",
            "h-[var(--size)] w-[var(--size)]",
            "left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)]",
            "[background:radial-gradient(circle_at_center,rgba(var(--fourth-color),0.75)_0,rgba(var(--fourth-color),0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)] [transform-origin:calc(50%-200px)]",
            !prefersReducedMotion && "animate-gradient-fourth",
          )}
        />
        <div
          className={cn(
            "absolute opacity-100",
            "h-[var(--size)] w-[var(--size)]",
            "left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)]",
            "[background:radial-gradient(circle_at_center,rgba(var(--fifth-color),0.7)_0,rgba(var(--fifth-color),0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)] [transform-origin:calc(50%-800px)_calc(50%+800px)]",
            !prefersReducedMotion && "animate-gradient-fifth",
          )}
        />

        {canInteract && (
          <div
            ref={interactiveRef}
            className={cn(
              "absolute -left-1/2 -top-1/2 h-full w-full opacity-70",
              "[background:radial-gradient(circle_at_center,rgba(var(--pointer-color),0.7)_0,rgba(var(--pointer-color),0)_50%)_no-repeat]",
              "[mix-blend-mode:var(--blending-value)]",
            )}
          />
        )}
      </div>

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
