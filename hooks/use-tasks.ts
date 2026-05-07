import { useState, useCallback, useEffect } from 'react'

export interface Task {
  id: string
  text: string
  completed: boolean
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      const fetchedTasks = Array.isArray(data.tasks) ? data.tasks : data.tasks || []
      setTasks(
        fetchedTasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: t.completed || false,
        }))
      )
      setError(null)
    } catch (err) {
      console.error('[v0] Failed to fetch tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const addTask = useCallback(async (text: string) => {
    if (!text.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('Failed to create task')
      const data = await response.json()
      const newTask = data.task

      // Optimistic update
      setTasks((prev) => [
        {
          id: newTask.id,
          text: newTask.text,
          completed: newTask.completed || false,
        },
        ...prev,
      ])
    } catch (err) {
      console.error('[v0] Failed to add task:', err)
      setError(err instanceof Error ? err.message : 'Failed to add task')
    }
  }, [])

  const toggleTask = useCallback(async (id: string) => {
    // Optimistic update
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newCompleted = !task.completed
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: newCompleted } : t
      )
    )

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: newCompleted }),
      })

      if (!response.ok) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: !newCompleted } : t
          )
        )
        throw new Error('Failed to update task')
      }
    } catch (err) {
      console.error('[v0] Failed to toggle task:', err)
    }
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id))

    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // Revert on error - refetch tasks
        await fetchTasks()
        throw new Error('Failed to delete task')
      }
    } catch (err) {
      console.error('[v0] Failed to delete task:', err)
    }
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refetch: fetchTasks,
  }
}
