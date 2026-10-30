import type { PlatformName } from '@/lib/constants'
import { authService } from '@/services/authService'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import { getStore, patchStore, recountPlatformMessages } from '@/services/mockStore'
import type { ConnectedPlatform } from '@/types'

async function requireUserId() {
  const user = await authService.currentUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const platformService = {
  async list(): Promise<ConnectedPlatform[]> {
    if (useRemoteApi()) return request<ConnectedPlatform[]>('/api/platforms')
    return simulate(async () => {
      const userId = await requireUserId()
      return getStore().platforms.filter((p) => p.user_id === userId)
    })
  },

  async connect(platform: PlatformName) {
    if (useRemoteApi()) {
      return request<ConnectedPlatform>('/api/platforms/connect', {
        method: 'POST',
        body: JSON.stringify({ platform }),
      })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const now = new Date().toISOString()
      const store = getStore()
      const platforms = store.platforms.map((p) =>
        p.user_id === userId && p.platform === platform
          ? {
              ...p,
              connection_status: 'connected' as const,
              access_token_reference: `backend-token-ref:${crypto.randomUUID()}`,
              connected_at: now,
              last_synced_at: now,
            }
          : p,
      )
      const consents = [
        ...store.consents,
        {
          id: crypto.randomUUID(),
          user_id: userId,
          platform,
          consent_type: 'platform_connect' as const,
          consent_given: true,
          consent_timestamp: now,
          revoked_at: null,
          notes: 'Placeholder OAuth authorization completed in demo mode. No third-party password was collected.',
        },
      ]
      patchStore({ platforms, consents })
      const updated = platforms.find((p) => p.user_id === userId && p.platform === platform)
      if (!updated) throw new Error('Platform not found')
      return updated
    })
  },

  async disconnect(platform: PlatformName) {
    if (useRemoteApi()) {
      return request('/api/platforms/disconnect', {
        method: 'POST',
        body: JSON.stringify({ platform }),
      })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const store = getStore()
      const platforms = store.platforms.map((p) =>
        p.user_id === userId && p.platform === platform
          ? {
              ...p,
              connection_status: platform === 'Chat Export' ? 'available' as const : 'not_connected' as const,
              access_token_reference: null,
              connected_at: null,
              last_synced_at: null,
            }
          : p,
      )
      const consents = store.consents.map((c) =>
        c.user_id === userId && c.platform === platform && !c.revoked_at
          ? { ...c, revoked_at: new Date().toISOString(), consent_given: false }
          : c,
      )
      patchStore({ platforms, consents })
    })
  },

  async disconnectAll() {
    const userId = await requireUserId()
    const store = getStore()
    const names = store.platforms
      .filter((p) => p.user_id === userId && p.connection_status === 'connected')
      .map((p) => p.platform)
    for (const name of names) {
      await this.disconnect(name)
    }
  },

  async sync(platform: PlatformName) {
    if (useRemoteApi()) {
      return request('/api/platforms/sync', {
        method: 'POST',
        body: JSON.stringify({ platform }),
      })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const store = getStore()
      const platforms = store.platforms.map((p) =>
        p.user_id === userId && p.platform === platform
          ? { ...p, last_synced_at: new Date().toISOString() }
          : p,
      )
      patchStore({ platforms })
      recountPlatformMessages(userId, platform)
    })
  },
}
