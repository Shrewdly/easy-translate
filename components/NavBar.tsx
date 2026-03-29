'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface NavBarProps {
  user?: { id: string; email?: string } | null
}

export default function NavBar({ user }: NavBarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-500">
          EasyTranslate
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/history" className="text-gray-600 hover:text-gray-900">
                历史记录
              </Link>
              <span className="text-gray-500 text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-500 hover:text-red-600"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
