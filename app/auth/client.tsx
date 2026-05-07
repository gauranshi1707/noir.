'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AuthClient() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up the user (without email confirmation requirement)
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (signUpError) {
          console.log('[v0] Sign up error:', signUpError)
          throw signUpError
        }

        if (!authData.user) {
          throw new Error('Failed to create user')
        }

        // Create user profile after successful auth signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              display_name: email.split('@')[0],
            },
          ])

        if (profileError) {
          console.log('[v0] Profile creation error:', profileError)
          throw new Error('Database error saving new user')
        }

        // Initialize analytics record
        const { error: analyticsError } = await supabase
          .from('analytics')
          .insert([
            {
              user_id: authData.user.id,
              total_sessions: 0,
              total_study_minutes: 0,
              best_streak_day: 0,
            },
          ])

        if (analyticsError) {
          console.log('[v0] Analytics creation error:', analyticsError)
          // Don't throw - this is non-critical
        }

        // Initialize study streaks record
        const { error: streaksError } = await supabase
          .from('study_streaks')
          .insert([
            {
              user_id: authData.user.id,
              current_streak: 0,
              longest_streak: 0,
              last_session_date: null,
            },
          ])

        if (streaksError) {
          console.log('[v0] Streaks creation error:', streaksError)
          // Don't throw - this is non-critical
        }

        // Award starter collectible - "The Rune Seal"
        const { error: collectibleError } = await supabase
          .from('user_collectibles')
          .insert([
            {
              user_id: authData.user.id,
              collectible_id: 'rune_seal',
            },
          ])

        if (collectibleError) {
          console.log('[v0] Starter collectible error:', collectibleError)
          // Don't throw - this is non-critical
        }

        // Auto sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.log('[v0] Auto sign in error:', signInError)
          throw signInError
        }

        router.push('/')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          console.log('[v0] Sign in error:', signInError)
          throw signInError
        }
        router.push('/')
      }
    } catch (err: any) {
      console.log('[v0] Auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-foreground mb-2 tracking-tight">noir</h1>
          <p className="font-serif text-sm text-foreground/50 tracking-widest">
            a study sanctuary
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block font-serif text-xs text-foreground/70 uppercase tracking-widest mb-3">
              email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-foreground/20 px-4 py-3 font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block font-serif text-xs text-foreground/70 uppercase tracking-widest mb-3">
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-foreground/20 px-4 py-3 font-serif text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/50 transition-colors"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`font-serif text-xs p-3 text-center ${
                error.includes('Check your email')
                  ? 'bg-amber-600/10 text-amber-100/70 border border-amber-600/20'
                  : 'bg-red-600/10 text-red-100/70 border border-red-600/20'
              }`}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-3 font-serif text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'loading...' : isSignUp ? 'create account' : 'enter'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-serif text-xs text-foreground/50 mb-4">
            {isSignUp ? 'already have an account?' : "don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="font-serif text-xs text-amber-600/70 hover:text-amber-600 transition-colors tracking-widest uppercase"
          >
            {isSignUp ? 'sign in' : 'sign up'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
