'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface UnlockedCollectible {
  id: string
  name: string
  description: string
  rarity: string
  image: string
  acquiredAt: string
}

export function CollectibleUnlockModal() {
  const [unlocked, setUnlocked] = useState<UnlockedCollectible | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Listen for collectible unlock events
    const handleUnlock = (event: CustomEvent) => {
      setUnlocked(event.detail)
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 4000)
    }

    window.addEventListener('collectible-unlocked', handleUnlock as EventListener)
    return () => window.removeEventListener('collectible-unlocked', handleUnlock as EventListener)
  }, [])

  const rarityGradients: Record<string, string> = {
    common: 'from-gray-600 to-gray-800',
    uncommon: 'from-blue-600 to-blue-800',
    rare: 'from-purple-600 to-purple-800',
    legendary: 'from-yellow-600 to-yellow-800',
  }

  return (
    <AnimatePresence>
      {isVisible && unlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className={`bg-gradient-to-r ${rarityGradients[unlocked.rarity]} rounded-lg overflow-hidden shadow-2xl`}>
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <div className="text-5xl">✨</div>
                </motion.div>
                <h2 className="font-serif text-xl font-light text-white mb-1">
                  New Collectible
                </h2>
                <p className="text-xs text-white/70 tracking-widest font-serif">
                  {unlocked.rarity.toUpperCase()}
                </p>
              </div>

              {/* Image */}
              <div className="relative h-40 w-40 mx-auto rounded-lg overflow-hidden">
                <Image
                  src={unlocked.image}
                  alt={unlocked.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="font-serif text-lg text-white mb-2">
                  {unlocked.name}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                  {unlocked.description}
                </p>
              </div>

              {/* Animation */}
              <motion.div
                animate={{ scaleX: [1, 0] }}
                transition={{ duration: 3.8, ease: 'linear' }}
                className="h-1 bg-white/30 rounded-full origin-left"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
