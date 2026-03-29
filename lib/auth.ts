import { cache } from 'react'
import { supabase } from '@/lib/supabase'

export const getUser = cache(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
