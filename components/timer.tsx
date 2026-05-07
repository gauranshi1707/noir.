'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTimerSession } from '@/hooks/use-timer-session'
import { useTimerContext } from '@/contexts/timer-context'
import { useAnalyticsContext } from '@/contexts/analytics-context'
import { useToast } from '@/components/noir-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerProps {
  initialMinutes?: number
}

type EditSegment = 'hours' | 'minutes' | 'seconds' | null

// Elegant bell/chime sound URL (soft singing bowl tone)
const COMPLETION_SOUND_URL = 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3'

export function Timer({ initialMinutes = 60 }: TimerProps) {
  const {
    countdownRemaining,
    countdownRunning,
    countdownSessionActive,
    setCountdownTotal,
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    resetCountdown,
    setCountdownSessionActive,
  } = useTimerContext()
  
  const { refreshAnalytics } = useAnalyticsContext()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [editingSegment, setEditingSegment] = useState<EditSegment>(null)

  const [tempHours, setTempHours] = useState('01')
  const [tempMinutes, setTempMinutes] = useState('00')
  const [tempSeconds, setTempSeconds] = useState('00')

  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const prevRemainingRef = useRef(countdownRemaining)

  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const {
    startSession,
    pauseSession,
    resumeSession,
    recordElapsedTime,
    endSession,
    resetSession,
  } = useTimerSession(initialMinutes)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(COMPLETION_SOUND_URL)
    audioRef.current.volume = 0.5
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play completion sound
  const playCompletionSound = useCallback(() => {
    if (audioRef.current && !hasPlayedSound) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Silently handle autoplay restrictions
      })
      setHasPlayedSound(true)
    }
  }, [hasPlayedSound])

  // Detect when timer reaches 0 and play sound
  useEffect(() => {
    if (prevRemainingRef.current > 0 && countdownRemaining === 0 && countdownSessionActive) {
      playCompletionSound()
    }
    prevRemainingRef.current = countdownRemaining
  }, [countdownRemaining, countdownSessionActive, playCompletionSound])

  // Record elapsed time for session tracking
  useEffect(() => {
    if (countdownRunning && countdownSessionActive) {
      const defaultSeconds = initialMinutes * 60
      const elapsed = defaultSeconds - countdownRemaining
      recordElapsedTime(elapsed)
    }
  }, [countdownRemaining, countdownRunning, countdownSessionActive, initialMinutes, recordElapsedTime])

  // ----------------------------
  // FORMAT TIME
  // ----------------------------

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0')

    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0')

    const secs = (seconds % 60)
      .toString()
      .padStart(2, '0')

    return { hrs, mins, secs }
  }

  const { hrs, mins, secs } = formatTime(countdownRemaining)

  // ----------------------------
  // AUTO FOCUS
  // ----------------------------

  useEffect(() => {
    if (editingSegment === 'hours') {
      hoursRef.current?.focus()
      hoursRef.current?.select()
    }
    if (editingSegment === 'minutes') {
      minutesRef.current?.focus()
      minutesRef.current?.select()
    }
    if (editingSegment === 'seconds') {
      secondsRef.current?.focus()
      secondsRef.current?.select()
    }
  }, [editingSegment])

  // ----------------------------
  // CONTROLS
  // ----------------------------

  const handleStart = () => {
    setIsEditing(false)
    setEditingSegment(null)
    startCountdown()
    startSession()
  }

  const handlePause = () => {
    pauseCountdown()
    pauseSession()
  }

  const handleResume = () => {
    resumeCountdown()
    resumeSession()
  }

  const handleReset = () => {
    setIsEditing(false)
    setEditingSegment(null)
    setHasPlayedSound(false)
    resetCountdown()
    setTempHours('01')
    setTempMinutes('00')
    setTempSeconds('00')
    resetSession()
  }

  // ----------------------------
  // END SESSION
  // ----------------------------

  const handleEndSession = () => {
    setShowEndConfirm(true)
  }

  const handleConfirmEnd = async () => {
    setIsSavingSession(true)
    pauseCountdown()

    try {
      await endSession()
      setShowEndConfirm(false)
      resetCountdown()
      setTempHours('01')
      setTempMinutes('00')
      setTempSeconds('00')
      
      // Play completion sound
      playCompletionSound()
      
      // Show toast notification
      showToast('Session archived to the dossier.')
      
      // Refresh analytics immediately after session save
      await refreshAnalytics()
    } finally {
      setIsSavingSession(false)
    }
  }

  // ----------------------------
  // EDITING
  // ----------------------------

  const handleDisplayClick = () => {
    if (countdownRunning) return

    setTempHours(hrs)
    setTempMinutes(mins)
    setTempSeconds(secs)
    setIsEditing(true)
    setEditingSegment('hours')
  }

  const handleSegmentChange = (value: string, segment: EditSegment) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2)

    if (segment === 'hours') {
      setTempHours(cleaned)
    }
    if (segment === 'minutes') {
      const m = Number(cleaned)
      if (m <= 59 || cleaned === '') {
        setTempMinutes(cleaned)
      }
    }
    if (segment === 'seconds') {
      const s = Number(cleaned)
      if (s <= 59 || cleaned === '') {
        setTempSeconds(cleaned)
      }
    }
  }

  const finalizeEdit = () => {
    const h = parseInt(tempHours || '0')
    const m = parseInt(tempMinutes || '0')
    const s = parseInt(tempSeconds || '0')
    const newTotal = h * 3600 + m * 60 + s
    setCountdownTotal(newTotal)
    setIsEditing(false)
    setEditingSegment(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (editingSegment === 'hours') {
        setEditingSegment('minutes')
        return
      }
      if (editingSegment === 'minutes') {
        setEditingSegment('seconds')
        return
      }
      if (editingSegment === 'seconds') {
        finalizeEdit()
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditingSegment(null)
    }
  }

  // ----------------------------
  // UI
  // ----------------------------

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-16 animate-fade-in">
      {/* TIMER DISPLAY */}
      <div className="cursor-pointer select-none" onClick={handleDisplayClick}>
        {isEditing ? (
          <div className="flex items-center justify-center font-serif text-[280px] font-light leading-none tracking-tight text-foreground">
            <input
              ref={hoursRef}
              value={tempHours}
              onChange={(e) => handleSegmentChange(e.target.value, 'hours')}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-[220px] text-center outline-none border-b border-foreground/20"
            />
            <span>:</span>
            <input
              ref={minutesRef}
              value={tempMinutes}
              onChange={(e) => handleSegmentChange(e.target.value, 'minutes')}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-[220px] text-center outline-none border-b border-foreground/20"
            />
            <span>:</span>
            <input
              ref={secondsRef}
              value={tempSeconds}
              onChange={(e) => handleSegmentChange(e.target.value, 'seconds')}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-[220px] text-center outline-none border-b border-foreground/20"
            />
          </div>
        ) : (
          <div className="font-serif text-[280px] font-light leading-none tracking-tight text-foreground">
            {hrs}:{mins}:{secs}
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex gap-8">
        {!countdownRunning && !countdownSessionActive ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all font-serif text-sm tracking-widest duration-300"
          >
            begin
          </button>
        ) : countdownRunning ? (
          <button
            onClick={handlePause}
            className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all font-serif text-sm tracking-widest duration-300"
          >
            pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="px-8 py-3 border border-amber-600/60 text-amber-100/70 hover:border-amber-600 hover:text-amber-100 transition-all font-serif text-sm tracking-widest duration-300"
          >
            resume
          </button>
        )}

        {countdownSessionActive && (
          <button
            onClick={handleEndSession}
            disabled={isSavingSession}
            className="px-8 py-3 border border-amber-600/40 text-amber-700/50 hover:border-amber-600/70 hover:text-amber-600/70 transition-all font-serif text-sm tracking-widest duration-300 disabled:opacity-50"
          >
            {isSavingSession ? 'saving...' : 'end session'}
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-8 py-3 border border-foreground/40 text-foreground/40 hover:border-foreground hover:text-foreground transition-colors font-serif text-sm tracking-widest duration-300"
        >
          reset
        </button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-amber-600/30 rounded-lg p-8 max-w-md text-center"
            >
              <h3 className="font-serif text-xl text-amber-100/80 tracking-wider mb-2">
                conclude session?
              </h3>
              <p className="font-serif text-sm text-foreground/60 tracking-wide mb-8 leading-relaxed">
                This study session will be recorded in your dossier.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="px-6 py-2 border border-foreground/30 text-foreground/60 hover:border-foreground hover:text-foreground transition-all font-serif text-xs tracking-widest duration-300"
                >
                  continue
                </button>
                <button
                  onClick={handleConfirmEnd}
                  disabled={isSavingSession}
                  className="px-6 py-2 bg-amber-600/20 border border-amber-600/60 text-amber-100 hover:bg-amber-600/30 hover:border-amber-600 transition-all font-serif text-xs tracking-widest duration-300 disabled:opacity-50"
                >
                  {isSavingSession ? 'saving...' : 'conclude'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
