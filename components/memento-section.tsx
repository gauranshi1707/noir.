'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerSession } from '@/hooks/use-timer-session'
import { useTimerContext } from '@/contexts/timer-context'
import { useAnalyticsContext } from '@/contexts/analytics-context'
import { useToast } from '@/components/noir-toast'

export function MementoSection() {
  const {
    stopwatchElapsed,
    stopwatchRunning,
    stopwatchSessionActive,
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    resetStopwatch,
    setStopwatchSessionActive,
  } = useTimerContext()

  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [isSavingSession, setIsSavingSession] = useState(false)

  const { refreshAnalytics } = useAnalyticsContext()
  const { showToast } = useToast()

  const { startSession, pauseSession, resumeSession, recordElapsedTime, endSession, resetSession } = useTimerSession()

  // Record elapsed time for session tracking
  useEffect(() => {
    if (stopwatchRunning && stopwatchSessionActive) {
      recordElapsedTime(stopwatchElapsed)
    }
  }, [stopwatchElapsed, stopwatchRunning, stopwatchSessionActive, recordElapsedTime])

  const hours = Math.floor(stopwatchElapsed / 3600)
  const minutes = Math.floor((stopwatchElapsed % 3600) / 60)
  const seconds = stopwatchElapsed % 60

  const displayHours = String(hours).padStart(2, '0')
  const displayMinutes = String(minutes).padStart(2, '0')
  const displaySeconds = String(seconds).padStart(2, '0')

  const handleStart = () => {
    startStopwatch()
    startSession()
  }

  const handlePause = () => {
    pauseStopwatch()
    pauseSession()
  }

  const handleResume = () => {
    resumeStopwatch()
    resumeSession()
  }

  const handleEndSession = () => {
    setShowEndConfirm(true)
  }

  const handleConfirmEnd = async () => {
    setShowEndConfirm(false)
    setIsSavingSession(true)
    pauseStopwatch()

    try {
      await endSession()
      resetStopwatch()
      
      // Show toast notification
      showToast('Session archived to the dossier.')
      
      // Refresh analytics immediately after session save
      await refreshAnalytics()
    } finally {
      setIsSavingSession(false)
    }
  }

  const handleCancelEnd = () => {
    setShowEndConfirm(false)
  }

  const handleReset = () => {
    resetStopwatch()
    setShowEndConfirm(false)
    resetSession()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-16 animate-fade-in">
      {/* Stopwatch display */}
      <div className="text-center cursor-pointer hover:opacity-80 transition-opacity duration-300">
        <div className="font-serif text-[280px] font-light leading-none tracking-tight text-foreground select-none">
          {displayHours}:{displayMinutes}:{displaySeconds}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-8">
        {!stopwatchRunning && !stopwatchSessionActive ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all font-serif text-sm tracking-widest duration-300"
          >
            start
          </button>
        ) : stopwatchRunning ? (
          <button
            onClick={handlePause}
            className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all font-serif text-sm tracking-widest duration-300"
          >
            pause
          </button>
        ) : stopwatchSessionActive ? (
          <button
            onClick={handleResume}
            className="px-8 py-3 border border-amber-600/60 text-amber-100/70 hover:border-amber-600 hover:text-amber-100 transition-all font-serif text-sm tracking-widest duration-300"
          >
            resume
          </button>
        ) : null}

        {stopwatchSessionActive && (
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

      {/* End Session Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-background border border-amber-600/30 rounded-lg p-8 max-w-md text-center"
            >
              <h3 className="font-serif text-xl text-amber-100/80 tracking-wider mb-2">
                conclude session?
              </h3>
              <p className="font-serif text-sm text-foreground/60 tracking-wide mb-8 leading-relaxed">
                This study session will be recorded in your dossier and contribute to your progress.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleCancelEnd}
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
