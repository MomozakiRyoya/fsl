"use client";

import { useFanPoints, type FanAction } from "@/hooks/useFanPoints";

interface BadgeConfig {
  id: string;
  emoji: string;
  label: string;
  description: string;
  /** null = ポイント閾値判定, string = アクション判定 */
  requiredAction: FanAction | null;
  requiredPoints: number | null;
}

const BADGES: BadgeConfig[] = [
  {
    id: "first_step",
    emoji: "🌟",
    label: "ファーストステップ",
    description: "初回投票",
    requiredAction: null,
    requiredPoints: 10,
  },
  {
    id: "winner_voter",
    emoji: "🏆",
    label: "優勝予想師",
    description: "優勝予想投票",
    requiredAction: "winner_vote",
    requiredPoints: null,
  },
  {
    id: "mvp_eye",
    emoji: "⚡",
    label: "MVP鑑定眼",
    description: "MVP投票",
    requiredAction: "mvp_vote",
    requiredPoints: null,
  },
  {
    id: "prophet",
    emoji: "🔮",
    label: "予言者",
    description: "試合予想",
    requiredAction: "match_predict",
    requiredPoints: null,
  },
  {
    id: "cheerer",
    emoji: "📣",
    label: "応援団長",
    description: "コメント投稿",
    requiredAction: "cheer_comment",
    requiredPoints: null,
  },
  {
    id: "team_member",
    emoji: "🤝",
    label: "チームの仲間",
    description: "チームフォロー",
    requiredAction: "team_follow",
    requiredPoints: null,
  },
];

export default function FanBadges() {
  const { totalPoints, hasAction, mounted } = useFanPoints();

  if (!mounted) return null;

  const isUnlocked = (badge: BadgeConfig): boolean => {
    if (badge.requiredAction !== null) {
      return hasAction(badge.requiredAction);
    }
    if (badge.requiredPoints !== null) {
      return totalPoints >= badge.requiredPoints;
    }
    return false;
  };

  const unlockedCount = BADGES.filter(isUnlocked).length;

  return (
    <section className="mb-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {/* バッジアイコン */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#c9921e" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          ファンバッジ
        </h2>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-black tabular-nums"
            style={{ color: "#c9921e" }}
          >
            {totalPoints}pt
          </span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            {unlockedCount}/{BADGES.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const unlocked = isUnlocked(badge);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-3 text-center transition-all ${
                  unlocked
                    ? "bg-amber-50 border-amber-200"
                    : "bg-slate-50 border-slate-100 opacity-50"
                }`}
                style={
                  unlocked
                    ? {
                        boxShadow:
                          "0 0 12px rgba(201,146,30,0.25), 0 0 4px rgba(227,192,96,0.15)",
                      }
                    : {}
                }
              >
                <div className="text-2xl mb-1 leading-none">{badge.emoji}</div>
                <div
                  className={`text-[10px] font-bold leading-tight ${
                    unlocked ? "text-amber-800" : "text-slate-500"
                  }`}
                >
                  {badge.label}
                </div>
                <div
                  className={`text-[9px] mt-0.5 leading-tight ${
                    unlocked ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {badge.description}
                </div>
                {unlocked && (
                  <div
                    className="text-[9px] font-bold mt-1"
                    style={{ color: "#c9921e" }}
                  >
                    取得済み
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount === 0 && (
          <p className="text-xs text-slate-400 text-center mt-3">
            投票やコメントでバッジを集めよう！
          </p>
        )}
      </div>
    </section>
  );
}
