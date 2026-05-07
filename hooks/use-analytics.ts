import { useEffect, useState } from 'react'

export interface AnalyticsData {
  totalStudyMinutes: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
  unlockedCollectibles: number
  totalCollectibles: number
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analytics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()
          setAnalytics({
            totalStudyMinutes: Math.floor(data.total_study_minutes || 0),
            totalSessions: data.total_sessions || 0,
            currentStreak: data.current_streak || 0,
            longestStreak: data.longest_streak || 0,
            unlockedCollectibles: data.unlocked_collectibles || 0,
            totalCollectibles: 6,
          })
        } else {
          throw new Error('Failed to fetch analytics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.log('[v0] Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Refetch analytics when component mounts or on manual trigger
  const refetch = async () => {
    await fetchAnalytics()
  }

  return { analytics, loading, error, refetch }
}

async function fetchAnalytics() {
  try {
    const response = await fetch('/api/analytics')
    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    console.error('[v0] Analytics fetch error:', err)
  }
}
