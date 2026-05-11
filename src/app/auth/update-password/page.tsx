"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const code = searchParams.get("code");

    if (token_hash && type === "recovery") {
      // verifyOtp: PKCE不要・どのブラウザでも動作
      supabase.auth.verifyOtp({ token_hash, type: "recovery" }).then(({ error: err }) => {
        if (err) {
          setError("リンクが無効または期限切れです。再度パスワード再設定をお試しください。");
        } else {
          setReady(true);
        }
        setChecking(false);
      });
    } else if (code) {
      // フォールバック: PKCE code
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) {
          setError("リンクが無効または期限切れです。再度パスワード再設定をお試しください。");
        } else {
          setReady(true);
        }
        setChecking(false);
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true);
        } else {
          setError("リンクが無効または期限切れです。再度パスワード再設定をお試しください。");
        }
        setChecking(false);
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("パスワードは8文字以上で設定してください"); return; }
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError("更新に失敗しました。再度お試しください");
    } else {
      await supabase.auth.signOut();
      setDone(true);
    }
  };

  const bg = "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)";

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">パスワードを更新しました</h2>
          <p className="text-sm text-slate-500 mb-6">新しいパスワードでログインできます。</p>
          <Link href="/auth/login" className="block w-full py-3 rounded-xl font-bold text-sm text-center"
            style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}>
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1">FSL</p>
          <h1 className="text-2xl font-black text-white tracking-tight">新しいパスワード</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
              {!ready && (
                <div className="mt-2">
                  <Link href="/auth/forgot-password" className="text-red-600 font-semibold underline">
                    再設定メールを送る
                  </Link>
                </div>
              )}
            </div>
          )}
          {ready && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">新しいパスワード（8文字以上）</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">確認</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}>
                {loading ? "更新中..." : "パスワードを更新"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0c1e42 0%, #1a3268 60%, #0c1e42 100%)" }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  );
}
