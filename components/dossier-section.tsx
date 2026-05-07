'use client'

import { useEffect } from 'react'
import { useAnalyticsContext } from '@/contexts/analytics-context'
import { formatDuration } from '@/lib/format-utils'

export function DossierSection() {
  const { analytics, sessions, loading, refreshAnalytics, onSessionComplete } = useAnalyticsContext()

  // Fetch on mount and subscribe to session-complete events
  useEffect(() => {
    refreshAnalytics()
    
    // Subscribe to session-complete events
    const unsubscribe = onSessionComplete(() => {
      console.log('[v0] Session complete event received, refreshing analytics')
      refreshAnalytics()
    })

    return unsubscribe
  }, [refreshAnalytics, onSessionComplete])

  if (loading && !analytics) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-40 bg-foreground/5 rounded animate-pulse" />
      </div>
    )
  }

  // Calculate HH:MM:SS format for total study time
  const totalSeconds = (analytics?.totalStudyMinutes || 0) * 60
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMins = Math.floor((totalSeconds % 3600) / 60)
  const totalSecs = totalSeconds % 60

  // Weekly and monthly calculations
  const weeklySeconds = (analytics?.weeklyFocusMinutes || 0) * 60
  const weeklyHours = Math.floor(weeklySeconds / 3600)
  const weeklyMins = Math.floor((weeklySeconds % 3600) / 60)
  
  const monthlySeconds = (analytics?.monthlyFocusMinutes || 0) * 60
  const monthlyHours = Math.floor(monthlySeconds / 3600)
  const monthlyMins = Math.floor((monthlySeconds % 3600) / 60)

  const StatCard = ({ label, value, secondary }: { label: string; value: string | number; secondary?: string }) => (
    <div className="border border-foreground/20 p-6 hover:border-amber-600/40 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 group cursor-default">
      <div className="flex flex-col gap-3">
        <p className="font-serif text-4xl font-light text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
          {value}
        </p>
        {secondary && (
          <p className="font-serif text-sm text-amber-200/60 group-hover:text-amber-100/70 transition-colors duration-300">
            {secondary}
          </p>
        )}
      </div>
      <p className="text-xs text-foreground/50 mt-4 tracking-widest uppercase group-hover:text-foreground/70 transition-colors duration-300">
        {label}
      </p>
    </div>
  )

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Primary Statistics Grid - 6 Cards */}
      <div>
        <h2 className="font-serif text-lg tracking-widest text-amber-100/60 uppercase font-light mb-8">
          Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div style={{ animationDelay: '0ms' }} className="animate-fade-in-up">
            <StatCard label="Total Sessions" value={analytics?.totalSessions || 0} />
          </div>
          
          <div style={{ animationDelay: '50ms' }} className="animate-fade-in-up">
            <StatCard 
              label="Total Study Time" 
              value={`${String(totalHours).padStart(2, '0')}:${String(totalMins).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`}
            />
          </div>
          
          <div style={{ animationDelay: '100ms' }} className="animate-fade-in-up">
            <StatCard 
              label="Average Session" 
              value={`${analytics?.averageSessionDuration || 0}m`}
            />
          </div>
          
          <div style={{ animationDelay: '150ms' }} className="animate-fade-in-up">
            <StatCard 
              label="Current Streak" 
              value={analytics?.currentStreak || 0}
              secondary="days"
            />
          </div>
          
          <div style={{ animationDelay: '200ms' }} className="animate-fade-in-up">
            <StatCard 
              label="Longest Streak" 
              value={analytics?.longestStreak || 0}
              secondary="days"
            />
          </div>
          
          <div style={{ animationDelay: '250ms' }} className="animate-fade-in-up">
            <StatCard 
              label="Collectibles Unlocked" 
              value={`${analytics?.unlockedCollectibles || 0} / 7`}
            />
          </div>
        </div>
      </div>

      {/* Weekly & Monthly Breakdown */}
      <div>
        <h2 className="font-serif text-lg tracking-widest text-amber-100/60 uppercase font-light mb-8">
          Time Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div style={{ animationDelay: '300ms' }} className="animate-fade-in-up">
            <div className="border border-foreground/20 p-6 hover:border-amber-600/40 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 group">
              <p className="font-serif text-3xl font-light text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
                {weeklyHours}h {weeklyMins}m
              </p>
              <p className="text-xs text-foreground/50 mt-4 tracking-widest uppercase group-hover:text-foreground/70 transition-colors duration-300">
                This Week
              </p>
            </div>
          </div>
          
          <div style={{ animationDelay: '350ms' }} className="animate-fade-in-up">
            <div className="border border-foreground/20 p-6 hover:border-amber-600/40 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 group">
              <p className="font-serif text-3xl font-light text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
                {monthlyHours}h {monthlyMins}m
              </p>
              <p className="text-xs text-foreground/50 mt-4 tracking-widest uppercase group-hover:text-foreground/70 transition-colors duration-300">
                This Month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="font-serif text-lg tracking-widest text-amber-100/60 uppercase font-light mb-8">
            Recent Sessions
          </h2>
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                style={{ animationDelay: `${400 + idx * 30}ms` }}
                className="border border-foreground/10 p-4 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300 animate-fade-in-up"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-serif text-sm text-amber-100/70 tracking-wide">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="font-serif text-sm text-foreground/60">
                    {formatDuration(session.duration_seconds)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
