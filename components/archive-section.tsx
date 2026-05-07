'use client'

import { useState } from 'react'

const THEMES = [
  { id: 'default', name: 'default', bg: 'bg-background' },
  { id: 'study', name: 'study room', bg: 'bg-black' },
  { id: 'midnight', name: 'midnight', bg: 'bg-slate-950' },
  { id: 'void', name: 'void', bg: 'bg-neutral-950' },
]

export function ArchiveSection() {
  const [currentTheme, setCurrentTheme] = useState('default')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="font-serif text-xs tracking-widest text-foreground/60 mb-4">
          sanctuary rooms
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setCurrentTheme(theme.id)}
              className={`aspect-square border transition-all ${
                currentTheme === theme.id
                  ? 'border-foreground bg-foreground/10'
                  : 'border-foreground/20 hover:border-foreground/40'
              } flex items-end justify-start p-2`}
            >
              <span className="font-serif text-xs text-foreground/70">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-xs tracking-widest text-foreground/60 mb-4">
          collectibles
        </h3>
        <div className="space-y-2">
          <div className="border border-foreground/20 p-3 hover:border-foreground/40 transition-colors cursor-pointer">
            <p className="font-serif text-xs text-foreground">obsidian key</p>
            <p className="text-xs text-foreground/40 mt-1">unlocked</p>
          </div>
          <div className="border border-foreground/20 p-3 hover:border-foreground/40 transition-colors cursor-not-allowed opacity-50">
            <p className="font-serif text-xs text-foreground">midnight manuscript</p>
            <p className="text-xs text-foreground/40 mt-1">locked</p>
          </div>
        </div>
      </div>
    </div>
  )
}
