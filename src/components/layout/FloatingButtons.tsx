"use client";

import { usePathname } from "next/navigation";

export default function FloatingButtons() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth/")) return null;

  return null;
}
