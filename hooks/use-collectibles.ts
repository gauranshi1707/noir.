'use client'

import { useCallback } from 'react'

interface SessionResult {
  collectibleUnlocked?: {
    id: string
    name: string
    description: string
    rarity: string
    image: string
  }
  streakUpdated?: {
    currentStreak: number
    longestStreak: number
  }
  themesUnlocked?: Array<{
    id: string
    name: string
  }>
}

export function useCollectibles() {
  const recordSession = useCallback(async (durationSeconds: number): Promise<SessionResult> => {
    try {
      const response = await fetch('/api/timer-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds }),
      })

      if (!response.ok) throw new Error('Failed to record session')

      const data = await response.json()

      // Dispatch custom events for UI updates
      if (data.collectibleUnlocked) {
        window.dispatchEvent(
          new CustomEvent('collectible-unlocked', { detail: data.collectibleUnlocked })
        )
      }

      if (data.themesUnlocked && data.themesUnlocked.length > 0) {
        window.dispatchEvent(
          new CustomEvent('themes-unlocked', { detail: data.themesUnlocked })
        )
      }

      return data
    } catch (error) {
      console.error('Failed to record session:', error)
      throw error
    }
  }, [])

  return { recordSession }
}
