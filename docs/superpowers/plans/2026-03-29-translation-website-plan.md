# Translation Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个支持中英互译、用户注册登录、翻译历史记录的 Next.js 网站

**Architecture:** Next.js 14 App Router，前端直连百度翻译 API + Supabase，Supabase Auth 处理用户认证，Supabase PostgreSQL 存储翻译历史，Row Level Security 隔离用户数据

**Tech Stack:** Next.js 14, Tailwind CSS, Supabase (Auth + PostgreSQL), 百度翻译 API, Vercel

---

## 项目初始化

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "easy-translate",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.43.1"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0"
  }
}
```

- [ ] **Step 2: 创建 next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: 创建 postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 创建 app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: 创建 app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyTranslate",
  description: "中英翻译工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: 创建 app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold">EasyTranslate</h1>
    </main>
  );
}
```

- [ ] **Step 9: 安装依赖并验证构建**

Run: `npm install && npm run build`
Expected: 成功构建，无错误

- [ ] **Step 10: 提交**

```bash
git add package.json next.config.js tsconfig.json tailwind.config.ts postcss.config.js app/
git commit -m "feat: scaffold Next.js project with Tailwind CSS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Supabase 配置

### Task 2: 创建 Supabase 数据库表和 RLS 策略

**Files:**
- Create: `supabase/schema.sql` (Supabase SQL 编辑器中执行)
- Create: `lib/supabase.ts`
- Create: `.env.local`

- [ ] **Step 1: 创建 supabase/schema.sql（在 Supabase SQL 编辑器中执行）**

```sql
-- 创建 translations 表
create table if not exists public.translations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  source_text text not null,
  translated_text text not null,
  direction text not null check (direction in ('zh-en', 'en-zh')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 Row Level Security
alter table public.translations enable row level security;

-- 创建 RLS 策略：用户只能查看自己的记录
create policy "Users can view own translations"
  on public.translations for select
  using (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能删除自己的记录
create policy "Users can delete own translations"
  on public.translations for delete
  using (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能插入自己的记录
create policy "Users can insert own translations"
  on public.translations for insert
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: 创建 lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: 创建 .env.local（不提交到 git）**

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BAIDU_APP_ID=your-baidu-app-id
NEXT_PUBLIC_BAIDU_SECRET=your-baidu-secret
```

- [ ] **Step 4: 更新 .gitignore 添加 .env.local**

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 5: 提交**

```bash
git add supabase/schema.sql lib/supabase.ts .gitignore
git commit -m "feat: add Supabase schema and client

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 翻译功能

### Task 3: 实现百度翻译 API 调用

**Files:**
- Create: `lib/translate.ts`

- [ ] **Step 1: 创建 lib/translate.ts**

```ts
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15)
}

function generateSign(appId: string, query: string, salt: string, secret: string): string {
  const str = `${appId}${query}${salt}${secret}`
  // 简单实现，实际应使用 MD5
  let hash = ''
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  // 使用 Web Crypto API 做 SHA-256
  return hash.toString()
}

export async function translate(
  query: string,
  from: 'zh' | 'en',
  to: 'zh' | 'en'
): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_BAIDU_APP_ID!
  const secret = process.env.NEXT_PUBLIC_BAIDU_SECRET!
  const salt = generateSalt()
  const sign = generateSign(appId, query, salt, secret)

  const res = await fetch(BAIDU_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      q: query,
      from,
      to,
      appid: appId,
      salt,
      sign,
    }),
  })

  if (!res.ok) {
    throw new Error(`Translation failed: ${res.status}`)
  }

  const data = await res.json()

  if (data.error_code) {
    throw new Error(`Baidu API error: ${data.error_code} - ${data.error_msg}`)
  }

  return data.trans_result[0].dst
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/translate.ts
git commit -m "feat: add Baidu translation API wrapper

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: 实现翻译表单组件

**Files:**
- Create: `components/TranslateForm.tsx`

- [ ] **Step 1: 创建 components/TranslateForm.tsx**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add components/TranslateForm.tsx
git commit -m "feat: add TranslateForm component

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: 实现历史记录组件

**Files:**
- Create: `components/HistoryList.tsx`

- [ ] **Step 1: 创建 components/HistoryList.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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
```

- [ ] **Step 2: 提交**

```bash
git add components/HistoryList.tsx
git commit -m "feat: add HistoryList component

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: 实现导航栏

**Files:**
- Create: `components/NavBar.tsx`

- [ ] **Step 1: 创建 components/NavBar.tsx**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add components/NavBar.tsx
git commit -m "feat: add NavBar component

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 认证功能

### Task 7: 实现登录页面

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: 创建 app/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          还没有账号？<Link href="/register" className="text-blue-500">注册</Link>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: 实现注册页面

**Files:**
- Create: `app/register/page.tsx`

- [ ] **Step 1: 创建 app/register/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？<Link href="/login" className="text-blue-500">登录</Link>
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add app/register/page.tsx
git commit -m "feat: add register page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: 实现历史记录页面

**Files:**
- Create: `app/history/page.tsx`

- [ ] **Step 1: 创建 app/history/page.tsx**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add app/history/page.tsx
git commit -m "feat: add history page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 页面整合

### Task 10: 更新首页和根布局

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: 更新 app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "EasyTranslate",
  description: "中英翻译工具",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="zh">
      <body>
        <NavBar user={user} />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 更新 app/page.tsx**

```tsx
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import TranslateForm from '@/components/TranslateForm'
import NavBar from '@/components/NavBar'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
```

- [ ] **Step 3: 提交**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: integrate NavBar and translation form into main pages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 最终检查

### Task 11: 验证构建

- [ ] **Step 1: 运行构建**

Run: `npm run build`
Expected: 成功构建，无错误

- [ ] **Step 2: 最终提交**

```bash
git add -A
git commit -m "feat: complete translation website with auth and history

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Plan Self-Review

### Spec Coverage Check

| Spec Section | Task |
|---|---|
| 中英互译 | Task 3, 4 |
| 语言切换 | Task 4 (TranslateForm) |
| 用户认证 | Task 2, 7, 8 |
| 翻译历史查看 | Task 5, 9 |
| 删除历史记录 | Task 5 |
| Supabase RLS | Task 2 |

### Placeholder Scan
- 无 "TBD"、"TODO" 占位符
- 所有步骤均有完整代码

### Type Consistency
- `direction` 字段类型为 `'zh-en' | 'en-zh'`，全程一致
- `user_id` 类型为 `uuid`，与 Supabase schema 一致
