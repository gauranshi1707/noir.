import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taskSchema } from '@/lib/validation'

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

    // Get user's tasks with optional filters
    const statusParam = request.nextUrl.searchParams.get('status')
    let query = supabase.from('tasks').select('*').eq('user_id', user.id)

    if (statusParam) {
      query = query.eq('status', statusParam)
    }

    const { data: tasks, error: tasksError } = await query.order('created_at', { ascending: false })

    if (tasksError) throw tasksError

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('[Noir API] Get tasks error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = taskSchema.parse(body)

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select()
      .single()

    if (taskError) throw taskError

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('[Noir API] Create task error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (taskError) throw taskError

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('[Noir API] Update task error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Noir API] Delete task error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
