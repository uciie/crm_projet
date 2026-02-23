import { createClient } from './supabase/client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return {
    'Content-Type': 'application/json',
    ...(session?.access_token
      ? { 'Authorization': `Bearer ${session.access_token}` }
      : {}),
  }
}

export const api = {
  async get<T = any>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async post<T = any>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async patch<T = any>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async delete<T = any>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
}