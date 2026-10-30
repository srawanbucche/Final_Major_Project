import { hashPassword } from '@/lib/utils'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import { getStore, patchStore } from '@/services/mockStore'
import { authService, type PublicUser } from '@/services/authService'

export const userService = {
  async getProfile(): Promise<PublicUser> {
    if (useRemoteApi()) return request<PublicUser>('/api/user/profile')
    const user = await authService.currentUser()
    if (!user) throw new Error('Not authenticated')
    return user
  },

  async updateProfile(patch: Partial<Pick<PublicUser, 'full_name' | 'email' | 'session_timeout_minutes' | 'onboarding_complete' | 'consent_onboarding'>>) {
    if (useRemoteApi()) {
      return request<PublicUser>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
    }
    return simulate(async () => {
      const current = await authService.currentUser()
      if (!current) throw new Error('Not authenticated')
      const store = getStore()
      const users = store.users.map((u) =>
        u.id === current.id
          ? { ...u, ...patch, updated_at: new Date().toISOString() }
          : u,
      )
      patchStore({ users })
      const updated = users.find((u) => u.id === current.id)
      if (!updated) throw new Error('User not found')
      const { password_hash: _h, ...rest } = updated
      void _h
      return rest
    })
  },

  async changePassword(currentPassword: string, nextPassword: string) {
    if (useRemoteApi()) {
      return request('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, nextPassword }),
      })
    }
    return simulate(async () => {
      const current = await authService.currentUser()
      if (!current) throw new Error('Not authenticated')
      const store = getStore()
      const user = store.users.find((u) => u.id === current.id)
      if (!user) throw new Error('User not found')
      if (user.password_hash !== (await hashPassword(currentPassword))) {
        throw new Error('Current password is incorrect.')
      }
      const nextHash = await hashPassword(nextPassword)
      const users = store.users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              password_hash: nextHash,
              updated_at: new Date().toISOString(),
            }
          : u,
      )
      patchStore({ users })
    })
  },
}
