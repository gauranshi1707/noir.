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

    // Get user's collectibles - simplified query without join
    const { data: collectibles, error: collectiblesError } = await supabase
      .from('user_collectibles')
      .select('*')
      .eq('user_id', user.id)

    // If table doesn't exist or query fails, return empty array
    if (collectiblesError) {
      console.log('[Noir API] Collectibles query error (may be missing table):', collectiblesError.message)
      return NextResponse.json({ collectibles: [] })
    }

    return NextResponse.json({ collectibles: collectibles || [] })
  } catch (error: any) {
    console.error('[Noir API] Get collectibles error:', error.message)
    // Return empty array instead of error for graceful degradation
    return NextResponse.json({ collectibles: [] })
  }
}
