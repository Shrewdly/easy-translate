import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import HistoryList from '@/components/HistoryList'

export default async function HistoryPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">翻译历史</h1>
        <HistoryList userId={user.id} />
      </main>
    </div>
  )
}
