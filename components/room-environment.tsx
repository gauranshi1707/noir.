'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'

interface Collectible {
  id: string
  name: string
  image: string
  isUnlocked: boolean
  position: { x: string; y: string }
  rotation: number
}

interface RoomEnvironmentProps {
  roomId: string
  collectibles: Collectible[]
  onBack: () => void
  onCollectibleUnlock?: (collectibleId: string) => void
}

const ROOM_BACKGROUNDS = {
  bibliothèque: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
  monastic: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
  victorian: 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950',
}

const ROOM_TITLES = {
  bibliothèque: 'Dark Academia Bibliothèque',
  monastic: 'Monastic Study',
  victorian: 'Victorian Study',
}

const ROOM_AMBIENCE = {
  bibliothèque: 'A sanctuary of ancient wisdom and literary treasures. Leather-bound volumes line the walls, and golden light filters through candlelit shadows.',
  monastic: 'Austere beauty meets contemplative silence. Stone walls and sparse furnishings create a space of profound focus.',
  victorian: 'Ornate grandeur envelops this intellectual refuge. Velvet, mahogany, and gaslight warmth define every corner.',
}

// The Rune Seal - starter collectible component
function RuneSealCollectible({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer aura glow */}
      <div
        className="absolute inset-0 rounded-lg transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(circle at center, rgba(180, 140, 80, ${isHovered ? 0.15 : 0.08}) 0%, transparent 70%)`,
        }}
      />
      
      {/* Inner soft glow */}
      <div
        className="absolute inset-4 rounded-full blur-xl transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 100, 0.3) 0%, transparent 60%)',
          opacity: isHovered ? 1 : 0.6,
        }}
      />
      
      {/* The rune symbol */}
      <span
        className="relative z-10 text-4xl md:text-5xl select-none transition-all duration-500"
        style={{
          color: isHovered ? 'rgba(212, 175, 100, 0.9)' : 'rgba(180, 140, 80, 0.7)',
          textShadow: isHovered 
            ? '0 0 30px rgba(212, 175, 100, 0.6), 0 0 60px rgba(212, 175, 100, 0.3)' 
            : '0 0 15px rgba(180, 140, 80, 0.3)',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        ✦
      </span>
      
      {/* Subtle border */}
      <div
        className="absolute inset-0 border rounded-lg transition-all duration-500"
        style={{
          borderColor: isHovered ? 'rgba(212, 175, 100, 0.4)' : 'rgba(180, 140, 80, 0.15)',
        }}
      />
    </div>
  )
}

// Collectible card descriptions for hover
const COLLECTIBLE_DESCRIPTIONS: Record<string, string> = {
  rune_seal: 'A forgotten sigil carried by first initiates of the Noir Order.',
  candle: 'Its flame has witnessed countless midnight revelations.',
  bust: 'Silent guardian of scholarly pursuits.',
  key: 'Opens doors long thought sealed.',
  pen: 'The instrument of immortal thoughts.',
  feather: 'Plucked from the wings of inspiration.',
  telescope: 'Peer into realms beyond the mundane.',
}

// Isolated CollectibleCard with per-card hover state
function CollectibleCard({
  collectible,
  index,
  unlockedAnimations,
}: {
  collectible: Collectible
  index: number
  unlockedAnimations: Set<string>
}) {
  const [isHovered, setIsHovered] = useState(false)
  const isRuneSeal = collectible.id === 'rune_seal'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card container - compact dimensions for 6-item grid */}
      <div
        className="relative w-28 h-28 md:w-32 md:h-32 cursor-pointer transition-transform duration-300 ease-out"
        style={{ 
          transform: isHovered ? 'scale(1.05) translateY(-4px)' : 'scale(1) translateY(0)',
        }}
      >
        {!collectible.isUnlocked ? (
          /* Locked state */
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Muted border */}
            <div
              className="absolute inset-0 border rounded-lg transition-all duration-400 ease-out"
              style={{
                borderColor: isHovered ? 'rgba(180, 140, 80, 0.5)' : 'rgba(180, 140, 80, 0.15)',
                boxShadow: isHovered 
                  ? '0 0 25px rgba(180, 140, 80, 0.2), inset 0 0 20px rgba(180, 140, 80, 0.05)' 
                  : 'none',
              }}
            />

            {/* Soft ambient glow on hover */}
            <div
              className="absolute inset-0 rounded-lg transition-opacity duration-400 ease-out pointer-events-none"
              style={{ 
                background: 'radial-gradient(circle at center, rgba(180, 140, 80, 0.1) 0%, transparent 60%)',
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Blurred silhouette */}
            <div className="absolute inset-6 bg-foreground/5 blur-md rounded pointer-events-none" />

            {/* Question mark */}
            <span 
              className="relative z-10 text-3xl md:text-4xl font-serif font-light select-none transition-all duration-300"
              style={{
                color: isHovered ? 'rgba(180, 140, 80, 0.4)' : 'rgba(180, 140, 80, 0.2)',
              }}
            >
              ?
            </span>
          </div>
        ) : isRuneSeal ? (
          /* Rune Seal - special unlocked state */
          <RuneSealCollectible isHovered={isHovered} />
        ) : (
          /* Regular unlocked state */
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
            {/* Subtle border */}
            <div
              className="absolute inset-0 border rounded-lg transition-all duration-400 ease-out z-10"
              style={{
                borderColor: isHovered ? 'rgba(180, 140, 80, 0.35)' : 'rgba(180, 140, 80, 0.1)',
              }}
            />

            {/* Soft glow on hover */}
            <div
              className="absolute inset-0 rounded-lg transition-opacity duration-400 ease-out pointer-events-none z-10"
              style={{ 
                background: 'radial-gradient(circle at center, rgba(180, 140, 80, 0.15) 0%, transparent 60%)',
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Shimmer animation on first unlock */}
            {unlockedAnimations.has(collectible.id) && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent pointer-events-none z-20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            )}

            {/* Image */}
            <motion.img
              src={collectible.image}
              alt={collectible.name}
              className="w-full h-full object-cover"
              initial={unlockedAnimations.has(collectible.id) ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />
          </div>
        )}
      </div>

      {/* Label container - always present for consistent spacing */}
      <div className="h-16 mt-2 flex items-start justify-center">
        <div
          className="text-center pointer-events-none transition-all duration-300 ease-out px-1"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          <p className="font-serif text-xs md:text-sm tracking-wider text-amber-100/80">
            {collectible.name}
          </p>
          <p className="font-serif text-[10px] md:text-[11px] tracking-wide text-amber-200/40 mt-1 leading-relaxed max-w-[120px] md:max-w-[140px]">
            {collectible.isUnlocked 
              ? COLLECTIBLE_DESCRIPTIONS[collectible.id] || 'A treasured artifact.'
              : 'Locked'
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function RoomEnvironment({
  roomId,
  collectibles,
  onBack,
}: RoomEnvironmentProps) {
  const [unlockedAnimations, setUnlockedAnimations] = useState<Set<string>>(new Set())

  useEffect(() => {
    const newlyUnlocked = new Set<string>()
    collectibles.forEach((c) => {
      if (c.isUnlocked && !unlockedAnimations.has(c.id)) {
        newlyUnlocked.add(c.id)
      }
    })
    if (newlyUnlocked.size > 0) {
      setUnlockedAnimations((prev) => new Set([...prev, ...newlyUnlocked]))
    }
  }, [collectibles, unlockedAnimations])

  return (
    <div className={`w-full min-h-screen relative flex flex-col ${ROOM_BACKGROUNDS[roomId as keyof typeof ROOM_BACKGROUNDS]}`}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-50 p-2 text-foreground/40 hover:text-foreground/70 transition-colors duration-300"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
      </motion.button>

      {/* Header section - cinematic top spacing */}
      <header className="flex-shrink-0 pt-24 pb-16 px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="font-serif text-2xl md:text-3xl tracking-[0.2em] text-amber-100/60 uppercase font-light">
            {ROOM_TITLES[roomId as keyof typeof ROOM_TITLES]}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-sm md:text-base tracking-wide text-amber-50/35 mt-6 leading-relaxed font-light"
          >
            {ROOM_AMBIENCE[roomId as keyof typeof ROOM_AMBIENCE]}
          </motion.p>
        </motion.div>
      </header>

      {/* Collectibles grid - 6 items in 2 rows of 3 */}
      <main className="flex-1 flex items-start justify-center px-8 pb-16 pt-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 lg:gap-10 max-w-6xl">
          {collectibles.slice(0, 6).map((collectible, index) => (
            <CollectibleCard
              key={collectible.id}
              collectible={collectible}
              index={index}
              unlockedAnimations={unlockedAnimations}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
