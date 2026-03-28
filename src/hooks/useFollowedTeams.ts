'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'fsl-followed-teams'

export function useFollowedTeams() {
  const [followedTeams, setFollowedTeams] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFollowedTeams(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const toggleFollow = useCallback((teamId: string) => {
    setFollowedTeams((prev) => {
      const next = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const isFollowing = useCallback((teamId: string) => {
    return followedTeams.includes(teamId)
  }, [followedTeams])

  return { followedTeams, toggleFollow, isFollowing, mounted }
}
