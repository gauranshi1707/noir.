import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { roomDecorationSchema } from '@/lib/validation'

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

    const { data: decoration, error: decorationError } = await supabase
      .from('room_decorations')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (decorationError) throw decorationError

    return NextResponse.json({ decoration })
  } catch (error: any) {
    console.error('[Noir API] Get room decoration error:', error.message)
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
    const validatedData = roomDecorationSchema.parse(body)

    const { data: decoration, error: decorationError } = await supabase
      .from('room_decorations')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (decorationError) throw decorationError

    return NextResponse.json({ decoration })
  } catch (error: any) {
    console.error('[Noir API] Update room decoration error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
