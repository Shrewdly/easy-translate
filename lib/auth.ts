import { cache } from 'react'
import { createClient } from '@/lib/supabase'

export const getUser = cache(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
