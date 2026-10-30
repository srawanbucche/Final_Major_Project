import { SESSION_TIMEOUT_MS } from '@/lib/constants'
import { hashPassword } from '@/lib/utils'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import {
  defaultPlatforms,
  ensureUserPlatforms,
  getStore,
  patchStore,
} from '@/services/mockStore'
import type { Session, User } from '@/types'

export type PublicUser = Omit<User, 'password_hash'>

function toPublic(user: User): PublicUser {
  const { password_hash: _hash, ...rest } = user
  void _hash
  return rest
}

function currentSession(): Session | null {
  const store = getStore()
  if (!store.session) return null
  const user = store.users.find((u) => u.id === store.session?.userId)
  const timeout = (user?.session_timeout_minutes ?? 30) * 60 * 1000 || SESSION_TIMEOUT_MS
  if (Date.now() - new Date(store.session.lastActivity).getTime() > timeout) {
    patchStore({ session: null })
    sessionStorage.removeItem('mindguard.token')
    return null
  }
  return store.session
}

export const authService = {
  async register(input: {
    full_name: string
    email: string
    password: string
  }): Promise<PublicUser> {
    if (useRemoteApi()) {
      return request<PublicUser>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    }
    return simulate(async () => {
      const store = getStore()
      if (store.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        throw new Error('An account with this email already exists.')
      }
      const now = new Date().toISOString()
      const user: User = {
        id: crypto.randomUUID(),
        full_name: input.full_name.trim(),
        email: input.email.trim().toLowerCase(),
        password_hash: await hashPassword(input.password),
        created_at: now,
        updated_at: now,
        onboarding_complete: false,
        consent_onboarding: false,
        session_timeout_minutes: 30,
      }
      patchStore({
        users: [...store.users, user],
        platforms: [...store.platforms, ...defaultPlatforms(user.id)],
      })
      return toPublic(user)
    })
  },

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    if (useRemoteApi()) {
      const result = await request<{ user: PublicUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      sessionStorage.setItem('mindguard.token', result.token)
      return result
    }
    return simulate(async () => {
      const store = getStore()
      const user = store.users.find((u) => u.email === email.trim().toLowerCase())
      const hash = await hashPassword(password)
      if (!user || user.password_hash !== hash) {
        throw new Error('Invalid email or password.')
      }
      const session: Session = {
        userId: user.id,
        token: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      }
      sessionStorage.setItem('mindguard.token', session.token)
      patchStore({ session })
      ensureUserPlatforms(user.id)
      return { user: toPublic(user), token: session.token }
    })
  },

  async logout() {
    if (useRemoteApi()) {
      await request('/api/auth/logout', { method: 'POST' })
    } else {
      await simulate(() => {
        patchStore({ session: null })
      })
    }
    sessionStorage.removeItem('mindguard.token')
  },

  async currentUser(): Promise<PublicUser | null> {
    if (useRemoteApi()) {
      try {
        return await request<PublicUser>('/api/user/profile')
      } catch {
        return null
      }
    }
    const session = currentSession()
    if (!session) return null
    const user = getStore().users.find((u) => u.id === session.userId)
    return user ? toPublic(user) : null
  },

  touchActivity() {
    const store = getStore()
    if (!store.session) return
    patchStore({
      session: { ...store.session, lastActivity: new Date().toISOString() },
    })
  },
}
