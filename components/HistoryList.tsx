'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Translation {
  id: string
  source_text: string
  translated_text: string
  direction: 'zh-en' | 'en-zh'
  created_at: string
}

interface HistoryListProps {
  userId: string
}

export default function HistoryList({ userId }: HistoryListProps) {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [userId])

  async function fetchHistory() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      setError('加载失败，请稍后重试')
    } else if (data) {
      setTranslations(data)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('translations').delete().eq('id', id)
    if (error) {
      setError('删除失败，请稍后重试')
      setDeletingId(null)
      return
    }
    setTranslations(prev => prev.filter(t => t.id !== id))
    setDeletingId(null)
  }

  if (loading) {
    return <p className="text-gray-500">加载中...</p>
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchHistory} className="text-blue-500 underline">重试</button>
      </div>
    )
  }

  if (translations.length === 0) {
    return <p className="text-gray-400">暂无翻译记录</p>
  }

  return (
    <div className="space-y-4">
      {translations.map(t => (
        <div key={t.id} className="p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t.direction === 'zh-en' ? '中→英' : '英→中'}
              </p>
              <p className="text-lg">{t.source_text}</p>
              <p className="text-gray-600 mt-1">→ {t.translated_text}</p>
            </div>
            <button
              onClick={() => handleDelete(t.id)}
              disabled={deletingId === t.id}
              className="text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
            >
              {deletingId === t.id ? '删除中...' : '删除'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(t.created_at).toLocaleString('zh-CN')}
          </p>
        </div>
      ))}
    </div>
  )
}
