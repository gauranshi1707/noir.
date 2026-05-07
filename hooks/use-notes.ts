'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface Note {
  id: string
  content: string
  created_at: string
  updated_at?: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/notes', {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setNotes(Array.isArray(data.notes) ? data.notes : [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  // Debounced save function
  const saveNote = useCallback(async (noteId: string, content: string) => {
    if (!content.trim()) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: noteId,
          content,
        }),
      })

      if (!response.ok) {
        console.error('[v0] Failed to save note')
        return false
      }

      const data = await response.json()
      // Update local state with saved note
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? data.note : n))
      )
      return true
    } catch (error) {
      console.error('[v0] Note save error:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Debounced update with 500ms delay
  const updateNote = useCallback(
    (noteId: string, content: string) => {
      // Update local state immediately for optimistic UI
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, content } : n
        )
      )

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer for debounced save
      debounceTimerRef.current = setTimeout(() => {
        saveNote(noteId, content)
      }, 500)
    },
    [saveNote]
  )

  // Create new note
  const createNote = useCallback(async (content: string) => {
    if (!content.trim()) return null

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        console.error('[v0] Failed to create note')
        return null
      }

      const data = await response.json()
      setNotes((prev) => [data.note, ...prev])
      return data.note
    } catch (error) {
      console.error('[v0] Note creation error:', error)
      return null
    }
  }, [])

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('[v0] Failed to delete note')
        return false
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      return true
    } catch (error) {
      console.error('[v0] Note deletion error:', error)
      return false
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    notes,
    loading,
    isSaving,
    createNote,
    updateNote,
    deleteNote,
  }
}
