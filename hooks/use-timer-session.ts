import { useEffect, useState, useCallback } from 'react'
import { useAnalyticsContext } from '@/contexts/analytics-context'

interface SessionData {
  startTime: number
  elapsedSeconds: number
  isRunning: boolean
  isPaused: boolean
}

const STORAGE_KEY = 'noir_active_session'

export function useTimerSession(initialMinutes: number = 60) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const { emitSessionComplete } = useAnalyticsContext()

  // Create fresh session
  const createFreshSession = useCallback(() => {
    setSessionData({
      startTime: Date.now(),
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
    })
  }, [])

  // Load active session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const data = JSON.parse(stored) as SessionData
        setSessionData(data)
      } catch {
        createFreshSession()
      }
    } else {
      createFreshSession()
    }
  }, [createFreshSession])

  // Persist locally
  useEffect(() => {
    if (sessionData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
    }
  }, [sessionData])

  const startSession = useCallback(() => {
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            startTime: Date.now(),
            isRunning: true,
            isPaused: false,
          }
        : null
    )
  }, [])

  const pauseSession = useCallback(() => {
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            isRunning: false,
            isPaused: true,
          }
        : null
    )
  }, [])

  const resumeSession = useCallback(() => {
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            startTime: Date.now(),
            isRunning: true,
            isPaused: false,
          }
        : null
    )
  }, [])

  const recordElapsedTime = useCallback((seconds: number) => {
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            elapsedSeconds: seconds,
          }
        : null
    )
  }, [])

  // SAVE COMPLETED SESSION
  const endSession = useCallback(async () => {
    if (!sessionData) return

    try {
      // Ignore accidental tiny sessions
      if (sessionData.elapsedSeconds < 5) {
        resetSession()
        return
      }

      const response = await fetch('/api/timer-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration_seconds: sessionData.elapsedSeconds,
          completed: true,
        }),
      })

      if (!response.ok) {
  const errorData = await response.json()

  console.error('[NOIR] Failed saving session:', errorData)

  return
}

      const result = await response.json()

      console.log('[NOIR] Session saved successfully', result)

      // Emit session-complete event to notify subscribers (Dossier, etc.)
      emitSessionComplete()

      // Clear session after save
      resetSession()
    } catch (error) {
      console.error('[NOIR] Session save error:', error)
    }
  }, [sessionData, emitSessionComplete])

  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)

    setSessionData({
      startTime: Date.now(),
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
    })
  }, [])

  return {
    sessionData,
    startSession,
    pauseSession,
    resumeSession,
    recordElapsedTime,
    endSession,
    resetSession,
  }
}
