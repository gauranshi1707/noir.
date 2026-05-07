'use client'

import { useState, useEffect } from 'react'
import { RoomSelector } from './room-selector'
import { RoomEnvironment } from './room-environment'

interface Collectible {
  id: string
  name: string
  image: string
  isUnlocked: boolean
  position: { x: string; y: string }
  rotation: number
}

// Starter collectible ID - same across all rooms
export const STARTER_COLLECTIBLE_ID = 'rune_seal'

const COLLECTIBLES: Record<string, Collectible[]> = {
  bibliothèque: [
    { id: 'rune_seal', name: 'The Rune Seal', image: '', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'candle', name: 'Antique Candle', image: '/collectibles/candle.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'bust', name: 'Marble Bust', image: '/collectibles/bust.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'key', name: 'Golden Key', image: '/collectibles/key.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'pen', name: 'Fountain Pen', image: '/collectibles/pen.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'feather', name: 'Quill Feather', image: '/collectibles/feather.jpg', isUnlocked: false, position: {}, rotation: 0 },
  ],
  monastic: [
    { id: 'rune_seal', name: 'The Rune Seal', image: '', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'candle', name: 'Antique Candle', image: '/collectibles/candle.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'bust', name: 'Stone Bust', image: '/collectibles/bust.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'key', name: 'Iron Key', image: '/collectibles/key.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'pen', name: 'Quill Pen', image: '/collectibles/pen.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'feather', name: 'Sacred Feather', image: '/collectibles/feather.jpg', isUnlocked: false, position: {}, rotation: 0 },
  ],
  victorian: [
    { id: 'rune_seal', name: 'The Rune Seal', image: '', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'candle', name: 'Ornate Candelabra', image: '/collectibles/candle.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'bust', name: 'Philosopher Bust', image: '/collectibles/bust.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'key', name: 'Brass Skeleton Key', image: '/collectibles/key.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'pen', name: 'Luxury Fountain Pen', image: '/collectibles/pen.jpg', isUnlocked: false, position: {}, rotation: 0 },
    { id: 'feather', name: 'Peacock Quill', image: '/collectibles/feather.jpg', isUnlocked: false, position: {}, rotation: 0 },
  ],
}

interface ImmersiveRoomProps {
  userCollectibles?: string[]
}

export function ImmersiveRoom({ userCollectibles: initialCollectibles }: ImmersiveRoomProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [roomCollectibles, setRoomCollectibles] = useState<Collectible[]>([])
  const [userCollectibles, setUserCollectibles] = useState<string[]>(initialCollectibles || [])

  // Fetch real user collectibles on mount
  useEffect(() => {
    const fetchCollectibles = async () => {
      try {
        const response = await fetch('/api/collectibles')
        if (response.ok) {
          const data = await response.json()
          // Handle both { collectibles: [...] } and direct array response
          const collectiblesArray = data.collectibles || data || []
          const unlockedIds = collectiblesArray.map((c: any) => c.collectible_id || c.id)
          setUserCollectibles(unlockedIds)
        }
      } catch (error) {
        console.log('[v0] Failed to fetch collectibles:', error)
        // Keep empty array on failure - graceful degradation
      }
    }

    fetchCollectibles()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      const collectibles = COLLECTIBLES[selectedRoom] || []
      const withUnlockStatus = collectibles.map((c) => ({
        ...c,
        // Always show rune_seal as unlocked (starter collectible for all users)
        isUnlocked: c.id === STARTER_COLLECTIBLE_ID || userCollectibles.includes(c.id),
      }))
      setRoomCollectibles(withUnlockStatus)
    }
  }, [selectedRoom, userCollectibles])

  if (!selectedRoom) {
    return <RoomSelector onSelectRoom={setSelectedRoom} selectedRoom={selectedRoom} />
  }

  return (
    <RoomEnvironment
      roomId={selectedRoom}
      collectibles={roomCollectibles}
      onBack={() => setSelectedRoom(null)}
    />
  )
}
