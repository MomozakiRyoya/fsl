"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import FloatingButtons from "./FloatingButtons";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <TopBar />
      <main className="flex-1 pt-11 lg:pt-0 pb-20 lg:pb-0 lg:ml-56 min-w-0">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </main>
      <FloatingButtons />
      <BottomNav />
    </div>
  );
}
