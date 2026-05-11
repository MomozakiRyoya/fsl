"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #060b14 0%, #0c1e42 60%, #060b14 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "rgba(200,164,90,0.6)" }}>
            Fukuoka Super League
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight">管理者ログイン</h1>
          <p className="text-xs text-white/30 mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl p-6 shadow-2xl space-y-4 border border-white/8"
          style={{ background: "#0c1e42" }}>
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              メールアドレス
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50 placeholder:text-white/20"
              placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              パスワード
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-amber-500/50"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 mt-2"
            style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#060b14" }}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #060b14 0%, #0c1e42 60%, #060b14 100%)" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
