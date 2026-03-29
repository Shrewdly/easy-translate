const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15)
}

function generateSign(appId: string, query: string, salt: string, secret: string): string {
  const str = `${appId}${query}${salt}${secret}`
  // 简单实现，实际应使用 MD5
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
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
