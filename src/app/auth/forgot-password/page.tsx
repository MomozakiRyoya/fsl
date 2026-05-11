"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
  };

  if (done) {
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
            メールを送信しました
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            パスワード再設定のリンクを {email} に送信しました。
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-3 rounded-xl font-bold text-sm text-center"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            ログインへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">パスワード再設定</h1>
          <p className="text-sm text-white/50 mt-1">
            登録済みメールアドレスを入力してください
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            {loading ? "送信中..." : "再設定メールを送る"}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link
            href="/auth/login"
            className="text-sm text-white/60 hover:text-white"
          >
            ← ログインへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
