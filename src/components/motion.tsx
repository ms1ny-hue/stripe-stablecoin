"use client";

import { useEffect, useRef, useState } from "react";

/** Reveal children on scroll into view (once). */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={`${seen ? "is-visible " : ""}${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Tween a number toward `value` whenever it changes. */
export function Tween({
  value,
  format,
  durationMs = 650,
  className,
  style,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs]);

  return (
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}
