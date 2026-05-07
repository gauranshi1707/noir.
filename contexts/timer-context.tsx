'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'

// Types for timer state
interface TimerState {
  // Countdown timer
  countdownTotal: number
  countdownRemaining: number
  countdownRunning: boolean
  countdownSessionActive: boolean
  countdownDefaultSeconds: number
  
  // Stopwatch
  stopwatchElapsed: number
  stopwatchRunning: boolean
  stopwatchSessionActive: boolean
}

interface TimerContextValue {
  // Countdown timer
  countdownTotal: number
  countdownRemaining: number
  countdownRunning: boolean
  countdownSessionActive: boolean
  setCountdownTotal: (seconds: number) => void
  startCountdown: () => void
  pauseCountdown: () => void
  resumeCountdown: () => void
  resetCountdown: () => void
  setCountdownSessionActive: (active: boolean) => void
  
  // Stopwatch
  stopwatchElapsed: number
  stopwatchRunning: boolean
  stopwatchSessionActive: boolean
  startStopwatch: () => void
  pauseStopwatch: () => void
  resumeStopwatch: () => void
  resetStopwatch: () => void
  setStopwatchSessionActive: (active: boolean) => void
}

const STORAGE_KEY = 'noir_timer_state'
const DEFAULT_COUNTDOWN_SECONDS = 60 * 60 // 1 hour

// Save state to localStorage
function saveState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastSaved: Date.now(),
    }))
  } catch {
    // Ignore localStorage errors
  }
}

// Load state from localStorage
function loadState(): TimerState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const elapsed = Date.now() - (parsed.lastSaved || Date.now())
      const elapsedSeconds = Math.floor(elapsed / 1000)
      
      // If timer was running, account for time passed
      let countdownRemaining = parsed.countdownRemaining
      let stopwatchElapsed = parsed.stopwatchElapsed
      
      if (parsed.countdownRunning && elapsedSeconds > 0) {
        countdownRemaining = Math.max(0, countdownRemaining - elapsedSeconds)
      }
      
      if (parsed.stopwatchRunning && elapsedSeconds > 0) {
        stopwatchElapsed = stopwatchElapsed + elapsedSeconds
      }
      
      return {
        ...parsed,
        countdownRemaining,
        stopwatchElapsed,
        // Auto-stop if countdown reached 0
        countdownRunning: countdownRemaining > 0 ? parsed.countdownRunning : false,
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

const TimerContext = createContext<TimerContextValue | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
  // Countdown state
  const [countdownTotal, setCountdownTotalState] = useState(DEFAULT_COUNTDOWN_SECONDS)
  const [countdownRemaining, setCountdownRemaining] = useState(DEFAULT_COUNTDOWN_SECONDS)
  const [countdownRunning, setCountdownRunning] = useState(false)
  const [countdownSessionActive, setCountdownSessionActive] = useState(false)
  
  // Stopwatch state
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchSessionActive, setStopwatchSessionActive] = useState(false)
  
  // Track if initial load is complete
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs for intervals
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadState()
    if (savedState) {
      setCountdownTotalState(savedState.countdownDefaultSeconds || DEFAULT_COUNTDOWN_SECONDS)
      setCountdownRemaining(savedState.countdownRemaining)
      setCountdownRunning(savedState.countdownRunning)
      setCountdownSessionActive(savedState.countdownSessionActive)
      setStopwatchElapsed(savedState.stopwatchElapsed)
      setStopwatchRunning(savedState.stopwatchRunning)
      setStopwatchSessionActive(savedState.stopwatchSessionActive)
    }
    setIsInitialized(true)
  }, [])
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return
    
    saveState({
      countdownTotal,
      countdownRemaining,
      countdownRunning,
      countdownSessionActive,
      countdownDefaultSeconds: countdownTotal,
      stopwatchElapsed,
      stopwatchRunning,
      stopwatchSessionActive,
    })
  }, [
    isInitialized,
    countdownTotal,
    countdownRemaining,
    countdownRunning,
    countdownSessionActive,
    stopwatchElapsed,
    stopwatchRunning,
    stopwatchSessionActive,
  ])
  
  // Countdown timer interval
  useEffect(() => {
    if (countdownRunning) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownRemaining(prev => {
          if (prev <= 1) {
            setCountdownRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [countdownRunning])
  
  // Stopwatch interval
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
        stopwatchIntervalRef.current = null
      }
    }
    
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
      }
    }
  }, [stopwatchRunning])
  
  // Countdown actions
  const setCountdownTotal = useCallback((seconds: number) => {
    setCountdownTotalState(seconds)
    setCountdownRemaining(seconds)
  }, [])
  
  const startCountdown = useCallback(() => {
    setCountdownRunning(true)
    setCountdownSessionActive(true)
  }, [])
  
  const pauseCountdown = useCallback(() => {
    setCountdownRunning(false)
  }, [])
  
  const resumeCountdown = useCallback(() => {
    setCountdownRunning(true)
  }, [])
  
  const resetCountdown = useCallback(() => {
    setCountdownRunning(false)
    setCountdownSessionActive(false)
    setCountdownRemaining(countdownTotal)
  }, [countdownTotal])
  
  // Stopwatch actions
  const startStopwatch = useCallback(() => {
    setStopwatchRunning(true)
    setStopwatchSessionActive(true)
  }, [])
  
  const pauseStopwatch = useCallback(() => {
    setStopwatchRunning(false)
  }, [])
  
  const resumeStopwatch = useCallback(() => {
    setStopwatchRunning(true)
  }, [])
  
  const resetStopwatch = useCallback(() => {
    setStopwatchRunning(false)
    setStopwatchSessionActive(false)
    setStopwatchElapsed(0)
  }, [])
  
  const value: TimerContextValue = {
    countdownTotal,
    countdownRemaining,
    countdownRunning,
    countdownSessionActive,
    setCountdownTotal,
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    resetCountdown,
    setCountdownSessionActive,
    
    stopwatchElapsed,
    stopwatchRunning,
    stopwatchSessionActive,
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    resetStopwatch,
    setStopwatchSessionActive,
  }
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimerContext() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider')
  }
  return context
}
