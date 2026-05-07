'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react'

interface AnalyticsData {
  totalSessions: number
  totalStudyMinutes: number
  currentStreak: number
  longestStreak: number
  weeklyFocusMinutes: number
  monthlyFocusMinutes: number
  averageSessionDuration: number
  unlockedCollectibles: number
}

interface SessionRecord {
  id: string
  date: string
  duration_seconds: number
  type: string
}

type SessionCompleteCallback = () => void

interface AnalyticsContextValue {
  analytics: AnalyticsData | null
  sessions: SessionRecord[]
  loading: boolean
  refreshAnalytics: () => Promise<void>
  lastRefresh: number
  onSessionComplete: (callback: SessionCompleteCallback) => () => void
  emitSessionComplete: () => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(0)
  const callbacksRef = useRef<Set<SessionCompleteCallback>>(new Set())

  const refreshAnalytics = useCallback(async () => {
    console.log('[v0] Refreshing analytics...')
    try {
      setLoading(true)
      
      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics', { cache: 'no-store' })
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        const analyticsData = data.analytics || data
        console.log('[v0] Analytics data received:', analyticsData)
        setAnalytics({
          totalSessions: analyticsData.total_sessions || 0,
          totalStudyMinutes: Math.floor(analyticsData.total_study_minutes || 0),
          currentStreak: analyticsData.current_streak || 0,
          longestStreak: analyticsData.longest_streak || 0,
          weeklyFocusMinutes: Math.floor(analyticsData.weekly_focus_minutes || 0),
          monthlyFocusMinutes: Math.floor(analyticsData.monthly_focus_minutes || 0),
          averageSessionDuration: Math.round(analyticsData.average_session_duration || 0),
          unlockedCollectibles: analyticsData.unlocked_collectibles || 0,
        })
      }

      // Fetch session records
      const sessionsRes = await fetch('/api/timer-sessions', { cache: 'no-store' })
      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        const sessionsData = data.sessions || data || []
        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData.slice(0, 10).map((s: any) => ({
                id: s.id,
                date: s.created_at,
                duration_seconds: s.duration_seconds || 0,
                type: 'focus',
              }))
            : []
        )
      }
      
      setLastRefresh(Date.now())
      console.log('[v0] Analytics refresh complete')
    } catch (error) {
      console.error('[v0] Failed to refresh analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const onSessionComplete = useCallback((callback: SessionCompleteCallback) => {
    callbacksRef.current.add(callback)
    // Return unsubscribe function
    return () => {
      callbacksRef.current.delete(callback)
    }
  }, [])

  const emitSessionComplete = useCallback(() => {
    console.log('[v0] Emitting session-complete event')
    callbacksRef.current.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('[v0] Error in session-complete callback:', error)
      }
    })
  }, [])

  return (
    <AnalyticsContext.Provider value={{ analytics, sessions, loading, refreshAnalytics, lastRefresh, onSessionComplete, emitSessionComplete }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}
