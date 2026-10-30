import type { PlatformName } from '@/lib/constants'
import { authService } from '@/services/authService'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import { getStore, patchStore, recountPlatformMessages } from '@/services/mockStore'
import type { Conversation, Message, MessageType, NormalizedMessage } from '@/types'

export interface MessageQuery {
  search?: string
  platform?: PlatformName | 'All'
  conversationId?: string
  from?: string
  to?: string
  sort?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface MessagePage {
  items: Message[]
  total: number
  page: number
  pageSize: number
}

async function requireUserId() {
  const user = await authService.currentUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

function parseTimestamp(value: unknown) {
  if (!value) return new Date().toISOString()
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

export function normalizeRecords(raw: unknown, fallbackPlatform: PlatformName = 'Chat Export'): NormalizedMessage[] {
  const rows = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : []
  return rows.map((row, index) => {
    const item = (row ?? {}) as Record<string, unknown>
    return {
      platform: String(item.platform ?? fallbackPlatform),
      conversation_id: String(item.conversation_id ?? item.conversationId ?? 'imported-chat'),
      sender: String(item.sender ?? item.from ?? 'Unknown'),
      timestamp: parseTimestamp(item.timestamp ?? item.date ?? item.time),
      message: String(item.message ?? item.message_text ?? item.text ?? `Imported line ${index + 1}`),
      message_type: (String(item.message_type ?? item.type ?? 'text') as MessageType) || 'text',
    }
  })
}

export function parseChatFile(content: string, fileName: string): NormalizedMessage[] {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.json')) {
    const parsed = JSON.parse(content) as unknown
    return normalizeRecords(parsed)
  }
  if (lower.endsWith('.csv')) {
    const lines = content.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return []
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = cols[i] ?? ''
      })
      return obj
    })
    return normalizeRecords(rows)
  }
  const messages: NormalizedMessage[] = []
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^\[?(\d{4}[-/]\d{2}[-/]\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)\]?\s*-?\s*([^:]+):\s*(.+)$/)
    if (match) {
      messages.push({
        platform: 'Chat Export',
        conversation_id: 'imported-chat',
        sender: match[2].trim(),
        timestamp: parseTimestamp(match[1]),
        message: match[3].trim(),
        message_type: 'text',
      })
    } else {
      messages.push({
        platform: 'Chat Export',
        conversation_id: 'imported-chat',
        sender: 'Imported',
        timestamp: new Date().toISOString(),
        message: trimmed,
        message_type: 'text',
      })
    }
  }
  return messages
}

export function persistNormalized(userId: string, records: NormalizedMessage[], isDemo = false, analysisStatusMap?: Record<string, 'Not Analyzed' | 'Processing' | 'Analyzed'>) {
  const store = getStore()
  const conversations = [...store.conversations]
  const messages = [...store.messages]
  const now = new Date().toISOString()

  for (const record of records) {
    const platform = (record.platform as PlatformName) || 'Chat Export'
    let conversation = conversations.find(
      (c) =>
        c.user_id === userId &&
        c.platform === platform &&
        c.external_conversation_id === record.conversation_id,
    )
    if (!conversation) {
      conversation = {
        id: crypto.randomUUID(),
        user_id: userId,
        platform,
        external_conversation_id: record.conversation_id,
        title: isDemo ? 'Sample conversation' : record.conversation_id,
        created_at: now,
        is_demo: isDemo,
      }
      conversations.push(conversation)
    }
    messages.push({
      id: crypto.randomUUID(),
      conversation_id: conversation.id,
      user_id: userId,
      platform,
      sender: record.sender,
      message_text: record.message,
      timestamp: record.timestamp,
      message_type: record.message_type,
      analysis_status: analysisStatusMap?.[record.message] || 'Not Analyzed',
      is_demo: isDemo,
    })
  }

  const platforms = store.platforms.map((p) => {
    if (p.user_id !== userId || p.platform !== 'Chat Export') return p
    return {
      ...p,
      connection_status: 'connected' as const,
      connected_at: p.connected_at ?? now,
      last_synced_at: now,
    }
  })

  patchStore({ conversations, messages, platforms })
  recountPlatformMessages(userId)
}

export const messageService = {
  async list(query: MessageQuery = {}): Promise<MessagePage> {
    if (useRemoteApi()) {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v))
      })
      return request<MessagePage>(`/api/messages?${params.toString()}`)
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10
      let items = getStore().messages.filter((m) => m.user_id === userId)
      if (query.platform && query.platform !== 'All') {
        items = items.filter((m) => m.platform === query.platform)
      }
      if (query.conversationId) {
        items = items.filter((m) => m.conversation_id === query.conversationId)
      }
      if (query.search) {
        const q = query.search.toLowerCase()
        items = items.filter(
          (m) =>
            m.message_text.toLowerCase().includes(q) ||
            m.sender.toLowerCase().includes(q),
        )
      }
      if (query.from) items = items.filter((m) => m.timestamp >= query.from!)
      if (query.to) items = items.filter((m) => m.timestamp <= query.to!)
      items.sort((a, b) =>
        query.sort === 'asc'
          ? a.timestamp.localeCompare(b.timestamp)
          : b.timestamp.localeCompare(a.timestamp),
      )
      const total = items.length
      const start = (page - 1) * pageSize
      return { items: items.slice(start, start + pageSize), total, page, pageSize }
    })
  },

  async get(id: string) {
    if (useRemoteApi()) return request<Message>(`/api/messages/${id}`)
    return simulate(async () => {
      const userId = await requireUserId()
      const message = getStore().messages.find((m) => m.id === id && m.user_id === userId)
      if (!message) throw new Error('Message not found')
      return message
    })
  },

  async conversations(): Promise<Conversation[]> {
    if (useRemoteApi()) return request<Conversation[]>('/api/conversations')
    return simulate(async () => {
      const userId = await requireUserId()
      return getStore().conversations.filter((c) => c.user_id === userId)
    })
  },

  async uploadChat(file: File, onProgress?: (value: number) => void): Promise<{ imported: number }> {
    if (useRemoteApi()) {
      const form = new FormData()
      form.append('file', file)
      return request<{ imported: number }>('/api/chat-upload', { method: 'POST', body: form })
    }
    onProgress?.(15)
    const content = await file.text()
    onProgress?.(55)
    const records = parseChatFile(content, file.name)
    onProgress?.(80)
    const userId = await requireUserId()
    persistNormalized(userId, records, false)
    onProgress?.(100)
    return { imported: records.length }
  },

  async uploadChatWithAnalysis(file: File, analysisResults: any[], onProgress?: (value: number) => void): Promise<{ imported: number }> {
    onProgress?.(15)
    const content = await file.text()
    onProgress?.(55)
    const records = parseChatFile(content, file.name)
    onProgress?.(80)
    
    // Create analysis status map
    const analysisStatusMap: Record<string, 'Not Analyzed' | 'Processing' | 'Analyzed'> = {}
    analysisResults.forEach((r: any) => {
      analysisStatusMap[r.text] = 'Analyzed'
    })
    
    const userId = await requireUserId()
    persistNormalized(userId, records, false, analysisStatusMap)
    onProgress?.(100)
    return { imported: records.length }
  },

  async loadDemoData() {
    const userId = await requireUserId()
    const sample: NormalizedMessage[] = [
      {
        platform: 'Chat Export',
        conversation_id: 'demo-sample',
        sender: 'Demo User',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        message: 'Sample message about a regular weekday plan.',
        message_type: 'text',
      },
      {
        platform: 'Chat Export',
        conversation_id: 'demo-sample',
        sender: 'Demo Friend',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        message: 'Sample message confirming a meeting time.',
        message_type: 'text',
      },
      {
        platform: 'Telegram',
        conversation_id: 'demo-platform',
        sender: 'Demo Platform',
        timestamp: new Date().toISOString(),
        message: 'Demo Data — generic placeholder text for UI visualization only.',
        message_type: 'text',
      },
    ]
    persistNormalized(userId, sample, true)
    return sample.length
  },

  async deleteAllImported() {
    const userId = await requireUserId()
    const store = getStore()
    patchStore({
      messages: store.messages.filter((m) => m.user_id !== userId),
      conversations: store.conversations.filter((c) => c.user_id !== userId),
    })
    recountPlatformMessages(userId)
  },

  async exportUserData() {
    const userId = await requireUserId()
    const store = getStore()
    return {
      platforms: store.platforms.filter((p) => p.user_id === userId),
      conversations: store.conversations.filter((c) => c.user_id === userId),
      messages: store.messages.filter((m) => m.user_id === userId),
      consents: store.consents.filter((c) => c.user_id === userId),
    }
  },
}
