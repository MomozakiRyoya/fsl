import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b14]">
      <div className="text-center">
        <p className="text-6xl font-black text-white/10 mb-4">403</p>
        <h1 className="text-xl font-bold text-white mb-2">アクセス権限がありません</h1>
        <p className="text-sm text-white/40 mb-8">管理者アカウントでログインしてください</p>
        <Link href="/" className="text-sm px-6 py-3 rounded-xl font-bold"
          style={{ background: "linear-gradient(135deg, #c9921e, #e3c060)", color: "#0c1e42" }}>
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
