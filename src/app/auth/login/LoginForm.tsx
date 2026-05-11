"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
      }}
    >
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">
              FSL
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ログイン
            </h1>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl p-6 shadow-xl space-y-4"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c9921e, #e3c060)",
                color: "#0c1e42",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
            <div className="text-center pt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                パスワードを忘れた方
              </Link>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link
              href="/auth/signup"
              className="text-sm text-white/60 hover:text-white"
            >
              アカウントをお持ちでない方は{" "}
              <span className="font-bold text-white">新規登録</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
