'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Content } from '@/components/content'
import { TimerProvider } from '@/contexts/timer-context'
import { AnalyticsProvider } from '@/contexts/analytics-context'
import { ToastProvider } from '@/components/noir-toast'

export default function Page() {
  const [activeSection, setActiveSection] = useState('hourglass')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ToastProvider>
      <AnalyticsProvider>
        <TimerProvider>
          <div className="flex h-screen bg-background text-foreground">
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <Content activeSection={activeSection} sidebarOpen={sidebarOpen} />
          </div>
        </TimerProvider>
      </AnalyticsProvider>
    </ToastProvider>
  )
}

