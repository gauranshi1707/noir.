'use client'

import { useState } from 'react'
import { Music, ChevronUp, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Curated study playlists - dark academia / focus aesthetic
const STUDY_PLAYLISTS = [
  {
    id: '37i9dQZF1DX8NTLI2TtZa6',
    name: 'Dark Academia',
    description: 'Classical & atmospheric',
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    name: 'Deep Focus',
    description: 'Ambient concentration',
  },
  {
    id: '37i9dQZF1DX9sIqqvKsjG8',
    name: 'Lo-Fi Beats',
    description: 'Chill study vibes',
  },
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    name: 'Peaceful Piano',
    description: 'Soft instrumentals',
  },
]

interface SpotifyPlayerProps {
  isCollapsed?: boolean
}

export function SpotifyPlayer({ isCollapsed = false }: SpotifyPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(STUDY_PLAYLISTS[0])
  const [showPlayer, setShowPlayer] = useState(false)

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 text-foreground/60 hover:text-foreground transition-colors duration-300"
        title="Music"
      >
        <Music size={16} strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <div className="border-t border-sidebar-border">
      {/* Header toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-foreground/60 hover:text-foreground transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
          <Music size={14} strokeWidth={1.5} />
          <span className="text-xs font-serif tracking-wide">ambience</span>
        </div>
        {isExpanded ? (
          <ChevronDown size={14} strokeWidth={1.5} />
        ) : (
          <ChevronUp size={14} strokeWidth={1.5} />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Playlist selector */}
              {!showPlayer ? (
                <div className="space-y-2">
                  {STUDY_PLAYLISTS.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        setSelectedPlaylist(playlist)
                        setShowPlayer(true)
                      }}
                      className={`w-full text-left p-2 border transition-all duration-300 ${
                        selectedPlaylist.id === playlist.id
                          ? 'border-amber-600/40 bg-amber-600/5'
                          : 'border-foreground/10 hover:border-foreground/30'
                      }`}
                    >
                      <p className="font-serif text-xs text-foreground/80 tracking-wide">
                        {playlist.name}
                      </p>
                      <p className="text-[10px] text-foreground/40 tracking-wider mt-0.5">
                        {playlist.description}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Back button */}
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="flex items-center gap-1 text-foreground/50 hover:text-foreground transition-colors text-xs font-serif tracking-wide"
                  >
                    <X size={12} strokeWidth={1.5} />
                    <span>close player</span>
                  </button>

                  {/* Spotify embed */}
                  <div className="rounded overflow-hidden">
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded"
                      style={{ border: 'none' }}
                    />
                  </div>

                  <p className="text-[10px] text-foreground/30 tracking-wider text-center">
                    {selectedPlaylist.name}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
