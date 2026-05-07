'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Room {
  id: string
  name: string
  description: string
  theme: 'academic' | 'monastic' | 'victorian'
  collectiblesCount: number
  unlockedCount: number
}

const ROOMS: Room[] = [
  {
    id: 'bibliothèque',
    name: 'Dark Academia Bibliothèque',
    description: 'A timeless sanctuary of knowledge and contemplation',
    theme: 'academic',
    collectiblesCount: 6,
    unlockedCount: 0,
  },
  {
    id: 'monastic',
    name: 'Monastic Study',
    description: 'Sparse elegance meets scholarly discipline',
    theme: 'monastic',
    collectiblesCount: 6,
    unlockedCount: 0,
  },
  {
    id: 'victorian',
    name: 'Victorian Study',
    description: 'Ornate refinement and intellectual legacy',
    theme: 'victorian',
    collectiblesCount: 6,
    unlockedCount: 0,
  },
]

interface RoomSelectorProps {
  onSelectRoom: (roomId: string) => void
  selectedRoom?: string
}

export function RoomSelector({ onSelectRoom, selectedRoom }: RoomSelectorProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {ROOMS.map((room, index) => (
          <motion.button
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onClick={() => onSelectRoom(room.id)}
            className={`group relative p-8 border border-foreground/20 transition-all duration-500 hover:border-foreground/60 ${
              selectedRoom === room.id ? 'border-foreground/60 bg-foreground/5' : 'hover:bg-foreground/2'
            }`}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-foreground to-transparent transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10 text-left">
              <h3 className="font-serif text-lg tracking-widest text-foreground mb-2">
                {room.name}
              </h3>
              <p className="text-sm text-foreground/60 mb-6 font-serif leading-relaxed">
                {room.description}
              </p>

              {/* Stats */}
              <div className="flex gap-6 text-xs tracking-widest">
                <div className="flex flex-col">
                  <span className="text-foreground/40">artifacts</span>
                  <span className="text-foreground text-lg font-serif">
                    {room.unlockedCount}/{room.collectiblesCount}
                  </span>
                </div>
                {room.unlockedCount > 0 && (
                  <div className="flex flex-col">
                    <span className="text-foreground/40">unlocked</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-foreground text-lg font-serif"
                    >
                      {room.unlockedCount}
                    </motion.span>
                  </div>
                )}
              </div>
            </div>

            {/* Selection indicator */}
            {selectedRoom === room.id && (
              <motion.div
                layoutId="roomSelector"
                className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
