export default function InfoPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">情報</h1>
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="text-base font-semibold text-slate-900 mb-2">FSLとは</h2>
        <p className="text-sm text-body leading-relaxed">
          Fukuoka Super League（FSL）は、福岡を拠点とするポーカーチームリーグです。
          複数のリーグ・チームが年間を通じて競い合う、福岡最大級のポーカーリーグ戦です。
        </p>
      </section>
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3">お問い合わせ</h2>
        <p className="text-sm text-body">チーム参加・お問い合わせはSNSのDMからどうぞ。</p>
      </section>
    </main>
  )
}
