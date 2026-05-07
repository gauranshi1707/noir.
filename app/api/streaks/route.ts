import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get user's streak
    const { data: streak, error: streakError } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (streakError) throw streakError

    return NextResponse.json({ streak })
  } catch (error: any) {
    console.error('[Noir API] Get streak error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
