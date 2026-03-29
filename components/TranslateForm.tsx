'use client'

import { useState } from 'react'
import { translate } from '@/lib/translate'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface TranslateFormProps {
  userId: string
}

export default function TranslateForm({ userId }: TranslateFormProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'zh-en' | 'en-zh'>('zh-en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fromLang = direction === 'zh-en' ? 'zh' : 'en'
  const toLang = direction === 'zh-en' ? 'en' : 'zh'

  async function handleTranslate(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError('')

    try {
      const result = await translate(input, fromLang, toLang)
      setOutput(result)

      // 保存到历史记录
      await supabase.from('translations').insert({
        user_id: userId,
        source_text: input,
        translated_text: result,
        direction,
      })

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败')
    } finally {
      setLoading(false)
    }
  }

  function handleSwap() {
    setDirection(d => d === 'zh-en' ? 'en-zh' : 'zh-en')
    setInput(output)
    setOutput('')
  }

  return (
    <form onSubmit={handleTranslate} className="w-full max-w-2xl">
      <div className="flex items-center gap-4 mb-4">
        <span className="font-medium">{direction === 'zh-en' ? '中文' : 'English'}</span>
        <button
          type="button"
          onClick={handleSwap}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          ⇄
        </button>
        <span className="font-medium">{direction === 'zh-en' ? 'English' : '中文'}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={direction === 'zh-en' ? '输入中文...' : 'Enter English...'}
          className="w-full h-40 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          value={output}
          readOnly
          placeholder="翻译结果"
          className="w-full h-40 p-4 border rounded-lg resize-none bg-gray-50"
        />
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '翻译中...' : '翻译'}
      </button>
    </form>
  )
}
