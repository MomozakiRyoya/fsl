"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/roster", label: "出場選手", icon: "📋" },
  { href: "/admin/news", label: "ニュース", icon: "✎" },
  { href: "/admin/results", label: "試合結果", icon: "⚽" },
  { href: "/admin/schedule", label: "スケジュール", icon: "📅" },
  { href: "/admin/teams", label: "チーム", icon: "⬡" },
  { href: "/admin/players", label: "選手", icon: "◉" },
  { href: "/admin/feedback", label: "意見箱", icon: "📬" },
];

function SidebarContent({
  pathname,
  onNav,
  onLogout,
}: {
  pathname: string;
  onNav: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0c1e42" }}>
      <div className="px-5 py-5 border-b border-white/8">
        <p className="text-[9px] tracking-[0.3em] text-white/40 uppercase mb-0.5">
          Fukuoka Super League
        </p>
        <p
          className="text-sm font-black tracking-wider"
          style={{ color: "#e3c060" }}
        >
          ADMIN
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-white/8 pt-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-base w-5 text-center">⎋</span>
          ログアウト
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/forbidden";
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex h-screen bg-[#060b14] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-white/8">
        <SidebarContent
          pathname={pathname}
          onNav={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 w-64 flex-shrink-0 flex flex-col border-r border-white/8 shadow-2xl">
            <SidebarContent
              pathname={pathname}
              onNav={() => setOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 flex-shrink-0"
          style={{ background: "#0c1e42" }}
        >
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="メニューを開く"
          >
            <span className="w-5 h-px bg-white/60 block" />
            <span className="w-5 h-px bg-white/60 block" />
            <span className="w-5 h-px bg-white/60 block" />
          </button>
          <p
            className="text-sm font-black tracking-wider"
            style={{ color: "#e3c060" }}
          >
            FSL ADMIN
          </p>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
