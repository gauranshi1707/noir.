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

    // Get user's analytics - use maybeSingle() to avoid crash when no row exists
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (analyticsError) throw analyticsError

    // If no analytics row exists, create one with default values
    if (!analytics) {
      const { data: newAnalytics, error: insertError } = await supabase
        .from('analytics')
        .insert({
          user_id: user.id,
          total_sessions: 0,
          total_study_minutes: 0,
          current_streak: 0,
          longest_streak: 0,
          weekly_focus_minutes: 0,
          monthly_focus_minutes: 0,
          average_session_duration: 0,
          unlocked_collectibles: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return NextResponse.json({ analytics: newAnalytics })
    }

    return NextResponse.json({ analytics })
  } catch (error: any) {
    console.error('[Noir API] Get analytics error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
