"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transform = {
    up: visible ? "translateY(0)" : "translateY(28px)",
    left: visible ? "translateX(0)" : "translateX(-28px)",
    right: visible ? "translateX(0)" : "translateX(28px)",
  }[direction];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform,
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
