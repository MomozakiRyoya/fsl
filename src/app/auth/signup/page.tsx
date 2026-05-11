"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/mypage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [needConfirm, setNeedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("already registered")
          ? "このメールアドレスはすでに登録されています"
          : "登録に失敗しました。もう一度お試しください",
      );
    } else if (data.session) {
      // メール確認不要 → 即ログイン済みでリダイレクト
      router.push(redirectTo);
      router.refresh();
    } else {
      // メール確認が必要な場合
      setNeedConfirm(true);
    }
  };

  if (needConfirm) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
        }}
      >
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            確認メールを送信しました
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {email}{" "}
            に確認メールを送りました。リンクをクリックして登録を完了してください。
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-3 rounded-xl font-bold text-sm text-center"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
      }}
    >
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">
              FSL
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">
              新規登録
            </h1>
          </div>

          <form
            onSubmit={handleSignup}
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
                パスワード（8文字以上）
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
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              登録することで、コンテンツ投稿ルール（暴言・スパム・コンプラ違反禁止）に同意したものとみなします。
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c9921e, #e3c060)",
                color: "#0c1e42",
              }}
            >
              {loading ? "登録中..." : "アカウント登録"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              href="/auth/login"
              className="text-sm text-white/60 hover:text-white"
            >
              すでにアカウントをお持ちの方は{" "}
              <span className="font-bold text-white">ログイン</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
