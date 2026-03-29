import { getUser } from '@/lib/auth'
import TranslateForm from '@/components/TranslateForm'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to EasyTranslate</h1>
          <p className="text-gray-600 mb-6">请先登录后使用翻译功能</p>
          <div className="space-x-4">
            <a href="/login" className="px-6 py-2 bg-blue-500 text-white rounded-lg">登录</a>
            <a href="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg">注册</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">中英翻译</h1>
        <TranslateForm userId={user.id} />
      </div>
    </main>
  )
}
