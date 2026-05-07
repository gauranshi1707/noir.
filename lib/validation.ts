import { z } from 'zod'

// Timer Session Validation
export const timerSessionSchema = z.object({
  duration_seconds: z.number().int().positive('Duration must be positive'),
})

export type TimerSessionInput = z.infer<typeof timerSessionSchema>

// Task Validation
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().optional(),
})

export type TaskInput = z.infer<typeof taskSchema>

// Note Validation
export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().max(50000, 'Content too long').optional(),
})

export type NoteInput = z.infer<typeof noteSchema>

// Room Decoration Validation
export const roomDecorationSchema = z.object({
  ambience: z.enum(['minimal', 'cozy', 'cosmic', 'forest', 'urban']).default('minimal'),
  light_mode: z.enum(['dark', 'light']).default('dark'),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color').default('foreground'),
})

export type RoomDecorationInput = z.infer<typeof roomDecorationSchema>

// Ambience Preference Validation
export const ambiencePreferenceSchema = z.object({
  background_sound: z.enum(['none', 'rain', 'forest', 'coffee_shop', 'library']).optional(),
  particle_effects: z.boolean().default(false),
  ambient_light: z.boolean().default(true),
})

export type AmbiencePreferenceInput = z.infer<typeof ambiencePreferenceSchema>
