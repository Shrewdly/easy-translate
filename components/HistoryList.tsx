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

  useEffect(() => {
    fetchHistory()
  }, [userId])

  async function fetchHistory() {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setTranslations(data)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('translations').delete().eq('id', id)
    setTranslations(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return <p className="text-gray-500">加载中...</p>
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
              className="text-red-500 hover:text-red-600 text-sm"
            >
              删除
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
