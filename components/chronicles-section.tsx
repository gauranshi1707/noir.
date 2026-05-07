'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useNotes } from '@/hooks/use-notes'

export function ChroniclesSection() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes()
  const [input, setInput] = useState('')

  const addNote = async () => {
    if (!input.trim()) return
    await createNote(input)
    setInput('')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) addNote()
          }}
          placeholder="notes..."
          className="w-full h-24 bg-secondary/30 border border-foreground/10 text-foreground placeholder-foreground/30 p-3 font-serif text-sm focus:outline-none focus:border-foreground/30 transition-colors"
        />
        <button
          onClick={addNote}
          className="px-6 py-2 border border-foreground/30 text-foreground/60 hover:text-foreground hover:border-foreground transition-colors font-serif text-xs tracking-widest"
        >
          save
        </button>
      </div>

      {loading ? (
        <div className="text-center text-foreground/50 text-sm">Loading notes...</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-foreground/40 text-sm py-8">No notes yet. Start documenting your thoughts.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-secondary/20 border border-foreground/10 p-3 flex justify-between items-start gap-2 group hover:border-foreground/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-foreground whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    {new Date(note.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

