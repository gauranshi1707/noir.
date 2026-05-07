import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ambiencePreferenceSchema } from '@/lib/validation'

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

    const { data: ambience, error: ambienceError } = await supabase
      .from('ambience_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (ambienceError) throw ambienceError

    return NextResponse.json({ ambience })
  } catch (error: any) {
    console.error('[Noir API] Get ambience error:', error.message)
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
    const validatedData = ambiencePreferenceSchema.parse(body)

    const { data: ambience, error: ambienceError } = await supabase
      .from('ambience_preferences')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (ambienceError) throw ambienceError

    return NextResponse.json({ ambience })
  } catch (error: any) {
    console.error('[Noir API] Update ambience error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
