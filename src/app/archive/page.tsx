import Link from "next/link";

export default function ArchivePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/info"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">シーズンアーカイブ</h1>
      </div>
      <p className="text-xs text-slate-500 mb-6">歴代シーズンの結果・記録</p>

      {/* Current Season */}
      <section className="mb-6 animate-fade-in">
        <div className="bg-white rounded-xl border border-[#e8dfc0] overflow-hidden">
          <div
            className="px-5 py-4"
            style={{ background: "linear-gradient(135deg, #0c1e42, #1a3060)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">FSL Season 1</h2>
                <p className="text-xs mt-0.5" style={{ color: "#e3c060" }}>
                  2026年 開催中
                </p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white animate-pulse"
                style={{ background: "rgba(201,146,30,0.6)" }}
              >
                LIVE
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "ディビジョン", value: "6" },
                { label: "参加チーム", value: "48" },
                { label: "開催節数", value: "22" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p
                    className="text-xl font-bold"
                    style={{ color: "#c9921e" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-body leading-relaxed">
              FSL初となるSeason
              1が2026年3月より開催中。6ディビジョン・48チームがプレーオフ進出を目指して戦います。
            </p>
            <Link
              href="/standings"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(201,146,30,0.1)", color: "#c9921e" }}
            >
              現在の順位を見る
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="animate-fade-in animate-delay-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{
              background: "linear-gradient(180deg, #c9921e, #e3c060)",
            }}
          />
          過去シーズン
        </h2>
        <div className="bg-gray-50 rounded-xl border border-[#e8dfc0] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            まだ記録がありません
          </p>
          <p className="text-xs text-slate-400">
            Season 1終了後に歴代記録が追加されます
          </p>
        </div>
      </section>
    </div>
  );
}
