'use client'

import { Clock, Zap, BookOpen, CheckSquare2, BarChart3, Home, ChevronLeft } from 'lucide-react'
import { SpotifyPlayer } from './spotify-player'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
}

const MAIN_SECTIONS = [
  { id: 'hourglass', label: 'hourglass', icon: Clock },
  { id: 'memento', label: 'memento', icon: Zap },
  { id: 'chronicles', label: 'chronicles', icon: BookOpen },
  { id: 'rites', label: 'rites', icon: CheckSquare2 },
  { id: 'dossier', label: 'dossier', icon: BarChart3 },
  { id: 'rooms', label: 'rooms', icon: Home },
]

export function Sidebar({ activeSection, onSectionChange, isOpen, onToggle }: SidebarProps) {
  return (
    <aside className={`bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-all duration-500 ease-in-out ${
      isOpen ? 'w-48' : 'w-20'
    }`}>
      {/* Header with toggle */}
      <div className={`flex items-center justify-between p-6 border-b border-sidebar-border transition-all duration-500 ${
        isOpen ? 'flex-row' : 'flex-col gap-4'
      }`}>
        {isOpen && (
          <h1 className="font-serif text-lg font-light tracking-widest text-foreground animate-fade-in">
            noir
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 text-foreground/60 hover:text-foreground transition-colors duration-300"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft 
            size={18} 
            strokeWidth={1.5}
            className={`transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {MAIN_SECTIONS.map((section, idx) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`flex items-center transition-all duration-300 animate-fade-in-up ${
                isOpen ? 'w-full gap-3 px-3 py-2' : 'w-full justify-center p-2'
              } ${
                isActive
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-foreground/60 hover:text-foreground/90'
              }`}
              title={!isOpen ? section.label : undefined}
            >
              <Icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
              {isOpen && (
                <span className="text-xs font-serif tracking-wide">{section.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Spotify Player */}
      <SpotifyPlayer isCollapsed={!isOpen} />
    </aside>
  )
}
