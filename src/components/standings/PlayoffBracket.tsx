"use client";

import type { TeamStanding } from "@/lib/types/app";

function getInitials(name: string): string {
  const stripped = name.replace(/\s+/g, "");
  return stripped.slice(0, 2).toUpperCase();
}

function SeedBadge({ seed }: { seed: number }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black flex-shrink-0"
      style={{ background: "#e3c060", color: "#0c1e42" }}
    >
      {seed}
    </span>
  );
}

function TeamRow({
  team,
  label,
}: {
  team: TeamStanding | null;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 last:border-0">
      {team ? (
        <>
          <SeedBadge seed={team.rank} />
          {team.teamLogoUrl ? (
            <img
              src={team.teamLogoUrl}
              alt={team.teamName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white flex-shrink-0"
              style={{ background: "#1a3268" }}
            >
              {getInitials(team.teamName)}
            </div>
          )}
          <span className="text-sm font-bold text-white truncate">
            {team.teamName}
          </span>
        </>
      ) : (
        <>
          <span className="text-xs text-white/40 font-bold w-5 text-center">
            ?
          </span>
          <span className="text-sm font-bold text-white/40">
            {label ?? "TBD"}
          </span>
        </>
      )}
      <span className="ml-auto text-xs text-white/30 font-mono">-</span>
    </div>
  );
}

function StageCard({
  title,
  date,
  children,
  highlight,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
          {title}
        </p>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={
            highlight
              ? {
                  background: "linear-gradient(135deg,#c9921e,#e3c060)",
                  color: "#0c1e42",
                }
              : {
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                }
          }
        >
          {date}
        </span>
      </div>
      <div className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ConnectorArrow() {
  return (
    <div className="flex items-center justify-center w-6 flex-shrink-0 pt-7">
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-white/30"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

export default function PlayoffBracket({
  standings,
}: {
  standings: TeamStanding[];
}) {
  // Division 1 上位4チームをシード順に取得
  const seeded = standings.slice(0, 4).sort((a, b) => a.rank - b.rank);
  const seed1 = seeded[0] ?? null;
  const seed2 = seeded[1] ?? null;
  const seed3 = seeded[2] ?? null;
  const seed4 = seeded[3] ?? null;

  return (
    <div
      className="rounded-2xl p-4 animate-spring-in"
      style={{
        background:
          "linear-gradient(135deg, #0c1e42 0%, #1a3268 50%, #0c1e42 100%)",
      }}
    >
      {/* ヘッダー */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
          Playoff Bracket
        </p>
        <h2 className="text-lg font-black text-white mt-0.5">
          プレーオフ対戦表
        </h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          9/6(金) WC → 9/7(土) SF → 9/8(日) FINAL
        </p>
      </div>

      {/* ブラケット */}
      <div className="flex items-start gap-1">
        {/* ワイルドカード */}
        <div className="flex-1">
          <StageCard title="Wild Card" date="9/6(金)">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-[10px] text-white/40">各ディビジョン5〜8位</p>
              <p className="text-[10px] text-white/40">計16チーム参加</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] text-white/60 font-semibold">
                ターボトーナメント
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                上位2チームがSFへ
              </p>
            </div>
          </StageCard>
        </div>

        <ConnectorArrow />

        {/* セミファイナル */}
        <div className="flex-1">
          <StageCard title="Semi Final" date="9/7(土)">
            <TeamRow team={seed1} />
            <TeamRow team={seed2} />
            <TeamRow team={seed3} />
            <TeamRow team={seed4} />
            <div className="px-3 py-2 border-t border-white/10">
              <p className="text-[10px] text-white/40">
                WC上位2チーム含む計26チーム
              </p>
            </div>
          </StageCard>
        </div>

        <ConnectorArrow />

        {/* THE FINAL */}
        <div className="flex-1">
          <StageCard title="THE FINAL" date="9/8(日)" highlight>
            <div className="flex items-center gap-2 px-3 py-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#c9921e,#e3c060)",
                }}
              >
                <span className="text-base">🏆</span>
              </div>
              <div>
                <p className="text-xs font-black text-white">9MAX</p>
                <p className="text-[10px] text-white/50">フリーズアウト</p>
              </div>
            </div>
            <div className="px-3 pb-2.5 border-t border-white/10 pt-2">
              <p className="text-[10px] text-white/40">優勝賞金</p>
              <p
                className="text-sm font-black tabular-nums"
                style={{ color: "#e3c060" }}
              >
                700,000円
              </p>
            </div>
          </StageCard>
        </div>
      </div>

      {/* 注記 */}
      <p className="text-[10px] text-white/30 mt-4 text-center">
        ※ セミファイナルは9名でファイナルテーブル確定
      </p>
    </div>
  );
}
