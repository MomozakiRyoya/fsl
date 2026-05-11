import Link from "next/link";
import { getRounds } from "@/lib/data";
import type { Round } from "@/lib/types/app";

interface VenueInfo {
  id: string;
  name: string;
  shortName: string;
  address: string;
  capacity: string;
  mapsUrl: string;
  description: string;
}

const VENUE_LIST: VenueInfo[] = [
  {
    id: "mega",
    name: "フットサルポイント福岡MEGA",
    shortName: "MEGA",
    address: "福岡市博多区",
    capacity: "〜200名",
    mapsUrl: "https://maps.app.goo.gl/example1",
    description: "FSLメイン会場。広々としたスペースで快適に観戦できます。",
  },
  {
    id: "tenjin",
    name: "フットサルポイント福岡天神",
    shortName: "ポーカーラウンジ天神",
    address: "福岡市中央区天神",
    capacity: "〜150名",
    mapsUrl: "https://maps.app.goo.gl/example2",
    description: "天神エリアのアクセス抜群な会場。交通の便が良く来場しやすい。",
  },
  {
    id: "higashi",
    name: "フットサルパーク福岡",
    shortName: "ポーカースタジアム",
    address: "福岡市東区",
    capacity: "〜180名",
    mapsUrl: "https://maps.app.goo.gl/example3",
    description: "広い駐車場完備。大型スクリーンで迫力の観戦体験を。",
  },
];

function getNextRoundForVenue(rounds: Round[], shortName: string) {
  return rounds.find(
    (r) =>
      r.venue === shortName &&
      (r.status === "next" || r.status === "scheduled"),
  );
}

export default async function VenuesPage() {
  const rounds = await getRounds();
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1e42 0%, #1a3a7a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #c9921e 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.2em] text-white/60 mb-1 uppercase">
            Fukuoka Social League
          </p>
          <h1 className="text-3xl font-black tracking-tight">VENUES</h1>
          <p className="text-sm text-white/70 mt-1.5">FSL開催会場のご案内</p>
        </div>
      </div>

      {/* 会場カードリスト */}
      <div className="space-y-4">
        {VENUE_LIST.map((venue, i) => {
          const nextRound = getNextRoundForVenue(rounds, venue.shortName);
          return (
            <div
              key={venue.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* 会場名・住所 */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {venue.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {venue.address}
                  </div>
                </div>
                {/* 収容人数バッジ */}
                <span className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {venue.capacity}
                </span>
              </div>

              {/* 説明 */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {venue.description}
              </p>

              {/* 次の試合 */}
              {nextRound && (
                <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
                    次の開催
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {nextRound.leagueName} {nextRound.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {nextRound.date}
                  </p>
                </div>
              )}

              {/* 地図ボタン */}
              <a
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #c9921e, #e3c060)",
                  color: "#0c1e42",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                地図を開く
              </a>
            </div>
          );
        })}
      </div>

      {/* フッターリンク */}
      <div className="mt-8 text-center">
        <Link
          href="/schedule"
          className="text-sm text-slate-500 underline underline-offset-2"
        >
          日程・スケジュールを見る
        </Link>
      </div>
    </div>
  );
}
