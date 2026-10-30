import { authService } from '@/services/authService'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import { getStore, patchStore } from '@/services/mockStore'
import type { ConsentRecord, ConsentType } from '@/types'

async function requireUserId() {
  const user = await authService.currentUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const consentService = {
  async list(): Promise<ConsentRecord[]> {
    if (useRemoteApi()) return request<ConsentRecord[]>('/api/consent')
    return simulate(async () => {
      const userId = await requireUserId()
      return getStore()
        .consents.filter((c) => c.user_id === userId)
        .sort((a, b) => b.consent_timestamp.localeCompare(a.consent_timestamp))
    })
  },

  async grant(input: {
    platform: ConsentRecord['platform']
    consent_type: ConsentType
    notes?: string
  }) {
    if (useRemoteApi()) {
      return request<ConsentRecord>('/api/consent', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const record: ConsentRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        platform: input.platform,
        consent_type: input.consent_type,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        revoked_at: null,
        notes: input.notes,
      }
      patchStore({ consents: [...getStore().consents, record] })
      return record
    })
  },

  async revoke(id: string) {
    if (useRemoteApi()) {
      return request(`/api/consent/${id}`, { method: 'DELETE' })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const consents = getStore().consents.map((c) =>
        c.id === id && c.user_id === userId
          ? { ...c, consent_given: false, revoked_at: new Date().toISOString() }
          : c,
      )
      patchStore({ consents })
    })
  },
}
