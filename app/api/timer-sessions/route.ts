import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { timerSessionSchema } from '@/lib/validation'
import { updateStreak, awardCollectible, getRandomCollectible, checkAndUnlockThemes, updateAnalytics } from '@/lib/noir-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = timerSessionSchema.parse(body)

    // Create timer session
    const { data: session, error: sessionError } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: user.id,
        duration_seconds: validatedData.duration_seconds,
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Update streak
    const sessionMinutes = Math.floor(validatedData.duration_seconds / 60)
    const streakResult = await updateStreak(user.id, sessionMinutes)

    // Get today's total study minutes
    const today = new Date().toISOString().split('T')[0]
    const { data: todaySessions } = await supabase
      .from('timer_sessions')
      .select('duration_seconds')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)

    const todayMinutes = (todaySessions || []).reduce((sum, s) => sum + s.duration_seconds, 0) / 60

    // Award collectible if 120+ minutes studied
    let newCollectible = null
    if (todayMinutes >= 120) {
      const collectible = await getRandomCollectible(user.id)
      await awardCollectible(user.id, collectible.id)
      newCollectible = collectible
    }

    // Check for theme unlocks
    const { data: analytics } = await supabase
      .from('analytics')
      .select('total_study_minutes')
      .eq('user_id', user.id)
      .single()

    const unlockedThemes = await checkAndUnlockThemes(
      user.id,
      streakResult.currentStreak,
      (analytics?.total_study_minutes || 0) + sessionMinutes
    )

    // Update analytics
    await updateAnalytics(user.id, sessionMinutes)

    return NextResponse.json({
      session,
      streak: streakResult,
      collectible: newCollectible,
      unlockedThemes,
    })
  } catch (error: any) {
    console.error('[Noir API] Timer session error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's timer sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (sessionsError) throw sessionsError

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('[Noir API] Get sessions error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
