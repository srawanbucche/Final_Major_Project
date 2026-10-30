import type { ApiError } from '@/types'

const mockDelay = 280

export function apiBase() {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
}

export function useRemoteApi() {
  return Boolean(apiBase())
}

export class ApiRequestError extends Error {
  status: number
  payload?: ApiError

  constructor(message: string, status = 400, payload?: ApiError) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${apiBase()}${path}`
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const token = sessionStorage.getItem('mindguard.token')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as T | ApiError) : ({} as T)
  if (!res.ok) {
    const err = data as ApiError
    throw new ApiRequestError(err.error || 'Request failed', res.status, err)
  }
  return data as T
}

export async function simulate<T>(factory: () => T | Promise<T>): Promise<T> {
  await new Promise((r) => setTimeout(r, mockDelay))
  return factory()
}
