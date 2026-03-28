import Link from "next/link";

export default function InfoPage() {
  const SNS_LINKS = [
    {
      name: "X (Twitter)",
      handle: "@fsl_poker",
      href: "https://twitter.com/fsl_poker",
      color: "#000000",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      handle: "@fsl_poker",
      href: "https://www.instagram.com/fsl_poker",
      color: "#E1306C",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "FSL 公式チャンネル",
      href: "https://www.youtube.com/@fsl_poker",
      color: "#FF0000",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">情報</h1>

      {/* FSLとは */}
      <section className="mb-5 animate-fade-in">
        <div className="bg-white rounded-xl border border-[#e8dfc0] overflow-hidden">
          <div
            className="px-5 py-4"
            style={{ background: "linear-gradient(135deg, #0c1e42, #1a3060)" }}
          >
            <h2 className="text-base font-bold text-white">FSL とは</h2>
            <p className="text-xs mt-0.5" style={{ color: "#e3c060" }}>
              Fukuoka Super League
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-body leading-relaxed">
              Fukuoka Super
              League（FSL）は、福岡を拠点とするポーカーチームリーグです。
              複数のディビジョン・チームが年間を通じて競い合う、福岡最大級のポーカーリーグ戦。
            </p>
            <p className="text-sm text-body leading-relaxed mt-3">
              Season 1
              は2026年3月に開幕。6ディビジョン・48チームが参加し、毎週末に白熱した対戦を繰り広げています。
              レギュラーシーズン全22節を経て、上位チームがプレーオフで頂点を争います。
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "ディビジョン", value: "6" },
                { label: "参加チーム", value: "48" },
                { label: "開催節数", value: "22" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-2 bg-gray-50 rounded-lg"
                >
                  <p className="text-xl font-bold" style={{ color: "#c9921e" }}>
                    {value}
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* クイックリンク */}
      <section className="mb-5 animate-fade-in">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          コンテンツ
        </h2>
        <div className="space-y-2">
          {[
            {
              href: "/rules",
              label: "リーグルール",
              desc: "ポイント制度・プレーオフ規定",
              icon: "📋",
            },
            {
              href: "/archive",
              label: "シーズンアーカイブ",
              desc: "歴代シーズンの記録",
              icon: "🏆",
            },
            {
              href: "/live",
              label: "速報・通知設定",
              desc: "試合結果のリアルタイム通知",
              icon: "⚡",
            },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 bg-white rounded-xl border border-[#e8dfc0] p-4 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-xl w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl flex-shrink-0">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <svg
                className="w-4 h-4 text-slate-300 flex-shrink-0"
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
          ))}
        </div>
      </section>

      {/* 公式SNS */}
      <section className="mb-5 animate-fade-in animate-delay-100">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          公式SNS
        </h2>
        <div className="space-y-2">
          {SNS_LINKS.map((sns, i) => (
            <a
              key={sns.name}
              href={sns.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-xl border border-[#e8dfc0] p-4 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${sns.color}15`, color: sns.color }}
              >
                {sns.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {sns.name}
                </p>
                <p className="text-xs text-slate-500">{sns.handle}</p>
              </div>
              <svg
                className="w-4 h-4 text-slate-300 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="mb-5 animate-fade-in animate-delay-200">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span
            className="w-1 h-4 rounded-full inline-block"
            style={{ background: "linear-gradient(180deg, #c9921e, #e3c060)" }}
          />
          お問い合わせ
        </h2>
        <div className="bg-white rounded-xl border border-[#e8dfc0] p-5">
          <p className="text-sm text-body leading-relaxed mb-4">
            チーム参加のご相談・お問い合わせは、公式SNSのDMよりお気軽にご連絡ください。
            運営スタッフが対応いたします。
          </p>
          <a
            href="https://twitter.com/fsl_poker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-base font-medium rounded-lg active:scale-95 transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #c9921e, #e3c060)",
              color: "#0c1e42",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X でメッセージ
          </a>
        </div>
      </section>

      {/* 運営 */}
      <section className="animate-fade-in animate-delay-300">
        <div className="bg-gray-50 rounded-xl border border-[#e8dfc0] p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            運営
          </h2>
          <p className="text-sm font-semibold text-slate-900">株式会社 JSTT</p>
          <p className="text-xs text-body mt-1 leading-relaxed">
            福岡を中心にポーカーコミュニティの発展に取り組む運営会社です。 FSL
            を通じて、より多くの方にポーカーの楽しさをお届けします。
          </p>
        </div>
      </section>
    </div>
  );
}
