'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'

export function RitesSection() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks()
  const [input, setInput] = useState('')

  const handleAddTask = async () => {
    if (!input.trim()) return
    await addTask(input)
    setInput('')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="task..."
          className="w-full bg-secondary/30 border border-foreground/10 text-foreground placeholder-foreground/30 px-3 py-2 font-serif text-sm focus:outline-none focus:border-foreground/30 transition-colors"
        />
        <button
          onClick={handleAddTask}
          disabled={loading}
          className="px-6 py-2 border border-foreground/30 text-foreground/60 hover:text-foreground hover:border-foreground transition-colors font-serif text-xs tracking-widest disabled:opacity-50"
        >
          add
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="text-center text-foreground/50 text-sm">Loading tasks...</div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-center text-foreground/40 text-sm py-8">No tasks yet. Create your first ritual.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/20 group transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 accent-foreground cursor-pointer"
                />
                <span
                  className={`flex-1 font-serif text-sm ${
                    task.completed ? 'text-foreground/40 line-through' : 'text-foreground'
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
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
