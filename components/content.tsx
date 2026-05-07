'use client'

import { Timer } from './timer'
import { MementoSection } from './memento-section'
import { ChroniclesSection } from './chronicles-section'
import { RitesSection } from './rites-section'
import { DossierSection } from './dossier-section'
import { ImmersiveRoom } from './immersive-room'
import { CollectibleUnlockModal } from './collectible-unlock-modal'

interface ContentProps {
  activeSection: string
  sidebarOpen: boolean
}

export function Content({ activeSection, sidebarOpen }: ContentProps) {
  const isHourglass = activeSection === 'hourglass'
  const isMemento = activeSection === 'memento'
  const isRooms = activeSection === 'rooms'
  const isCinematic = isHourglass || isMemento || isRooms

  return (
    <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
      !isCinematic && !sidebarOpen ? 'ml-0' : ''
    }`}>
      {/* Top bar - hidden on cinematic sections */}
      {!isCinematic && (
        <div className="border-b border-foreground/10 px-8 py-4">
          <p className="text-xs text-foreground/40 tracking-widest font-serif">
            {activeSection}
          </p>
        </div>
      )}

      {/* Content area */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300`}>
        {isHourglass ? (
          <div className="w-full h-full flex items-center justify-center">
            <Timer initialMinutes={60} />
          </div>
        ) : isMemento ? (
          <div className="w-full h-full flex items-center justify-center">
            <MementoSection />
          </div>
        ) : isRooms ? (
          <div className="w-full h-full overflow-hidden">
            <ImmersiveRoom />
          </div>
        ) : (
          <div className="px-8 py-8 max-w-4xl">
            {activeSection === 'chronicles' && <ChroniclesSection />}
            {activeSection === 'rites' && <RitesSection />}
            {activeSection === 'dossier' && <DossierSection />}
          </div>
        )}
      </div>

      {/* Collectible unlock modal */}
      <CollectibleUnlockModal />
    </div>
  )
}
