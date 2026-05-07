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

    const { data: themes, error: themesError } = await supabase
      .from('user_themes')
      .select(`
        *,
        themes:theme_id (
          id,
          name,
          description,
          unlock_type,
          unlock_value
        )
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    if (themesError) throw themesError

    return NextResponse.json({ themes })
  } catch (error: any) {
    console.error('[Noir API] Get themes error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { themeId, isActive } = body

    // First, deactivate all other themes
    if (isActive) {
      await supabase
        .from('user_themes')
        .update({ is_active: false })
        .eq('user_id', user.id)
    }

    // Update the selected theme
    const { data: theme, error: themeError } = await supabase
      .from('user_themes')
      .update({ is_active: isActive })
      .eq('user_id', user.id)
      .eq('theme_id', themeId)
      .select()
      .single()

    if (themeError) throw themeError

    return NextResponse.json({ theme })
  } catch (error: any) {
    console.error('[Noir API] Update theme error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
