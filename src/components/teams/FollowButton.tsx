"use client";

import { useFollowedTeams } from "@/hooks/useFollowedTeams";

interface Props {
  teamId: string;
  teamName: string;
}

export default function FollowButton({ teamId, teamName }: Props) {
  const { isFollowing, toggleFollow, mounted } = useFollowedTeams();
  const following = isFollowing(teamId);

  // フォロー状態は端末の保存内容から読むので、読み込み前は高さだけ取っておく（下の成績が跳ねない）。
  // 紺の面は色を直に書く（ink は文字色の決めで、ダークモードでは明るい色に替わる）
  return (
    <button
      type="button"
      onClick={() => toggleFollow(teamId)}
      disabled={!mounted}
      className={`touch-active w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold ${
        following ? "bg-butter text-on-block" : "bg-[#0c1e42] text-white"
      } ${mounted ? "" : "invisible"}`}
      aria-label={
        following ? `${teamName}のフォローを解除` : `${teamName}をフォロー`
      }
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill={following ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {following ? "フォロー中" : "このチームをフォロー"}
    </button>
  );
}
