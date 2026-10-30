import { PLATFORMS, type PlatformName } from '@/lib/constants'
import { loadJson, saveJson } from '@/lib/storage'
import type {
  ConnectedPlatform,
  ConsentRecord,
  Conversation,
  Message,
  ModelConfiguration,
  Session,
  User,
} from '@/types'

interface Store {
  users: User[]
  session: Session | null
  platforms: ConnectedPlatform[]
  consents: ConsentRecord[]
  conversations: Conversation[]
  messages: Message[]
  modelConfig: ModelConfiguration | null
  notifications: NotificationItem[]
}

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

const KEY = 'store'

function emptyStore(): Store {
  return {
    users: [],
    session: null,
    platforms: [],
    consents: [],
    conversations: [],
    messages: [],
    modelConfig: null,
    notifications: [],
  }
}

export function getStore(): Store {
  return loadJson<Store>(KEY, emptyStore())
}

export function setStore(store: Store) {
  saveJson(KEY, store)
}

export function patchStore(patch: Partial<Store>) {
  setStore({ ...getStore(), ...patch })
}

export function defaultPlatforms(userId: string): ConnectedPlatform[] {
  return PLATFORMS.map((platform) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    platform,
    connection_status: platform === 'Chat Export' ? 'available' : 'not_connected',
    access_token_reference: null,
    connected_at: null,
    last_synced_at: null,
    messages_collected: 0,
  }))
}

export function ensureUserPlatforms(userId: string) {
  const store = getStore()
  const existing = store.platforms.filter((p) => p.user_id === userId)
  if (existing.length >= PLATFORMS.length) return
  const missing = PLATFORMS.filter(
    (name) => !existing.some((p) => p.platform === name),
  )
  const created = missing.map((platform) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    platform,
    connection_status: (platform === 'Chat Export' ? 'available' : 'not_connected') as ConnectedPlatform['connection_status'],
    access_token_reference: null,
    connected_at: null,
    last_synced_at: null,
    messages_collected: 0,
  }))
  patchStore({ platforms: [...store.platforms, ...created] })
}

export function recountPlatformMessages(userId: string, platform?: PlatformName) {
  const store = getStore()
  const platforms = store.platforms.map((p) => {
    if (p.user_id !== userId) return p
    if (platform && p.platform !== platform) return p
    const count = store.messages.filter(
      (m) => m.user_id === userId && m.platform === p.platform,
    ).length
    return { ...p, messages_collected: count }
  })
  patchStore({ platforms })
}
