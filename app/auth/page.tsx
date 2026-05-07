import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthClient from './client'

export default async function AuthPage() {
  // Check if user is already logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return <AuthClient />
}

