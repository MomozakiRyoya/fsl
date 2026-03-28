'use client'

import { useFollowedTeams } from '@/hooks/useFollowedTeams'

interface Props {
  teamId: string
  teamName: string
}

export default function FollowButton({ teamId, teamName }: Props) {
  const { isFollowing, toggleFollow, mounted } = useFollowedTeams()

  if (!mounted) return null

  const following = isFollowing(teamId)

  return (
    <button
      onClick={() => toggleFollow(teamId)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95"
      style={following ? {
        background: 'rgba(201,146,30,0.15)',
        color: '#c9921e',
        border: '1px solid rgba(201,146,30,0.4)',
      } : {
        background: 'rgba(255,255,255,0.9)',
        color: '#64748b',
        border: '1px solid #e2e8f0',
      }}
      aria-label={following ? `${teamName}のフォローを解除` : `${teamName}をフォロー`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill={following ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {following ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
