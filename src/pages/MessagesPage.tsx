import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { MessageTable } from '@/components/MessageTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PLATFORMS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { messageService } from '@/services/messageService'
import { analysisStore } from '@/services/analysisStore'
import type { Conversation, Message } from '@/types'

export function MessagesPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [platform, setPlatform] = useState<string>('All')
  const [conversationId, setConversationId] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [open, setOpen] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiAnalyses, setAiAnalyses] = useState(analysisStore.getRecords())
  const pageSize = 10

  useEffect(() => {
    void messageService.conversations().then(setConversations)
    
    // Load AI analyses
    setAiAnalyses(analysisStore.getRecords())
    
    // Listen for analysis updates
    const handleAnalysisUpdate = () => {
      setAiAnalyses(analysisStore.getRecords())
    }
    
    window.addEventListener('analysis-updated', handleAnalysisUpdate)
    
    return () => {
      window.removeEventListener('analysis-updated', handleAnalysisUpdate)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    void messageService
      .list({
        search,
        platform: platform as 'All',
        conversationId: conversationId === 'All' ? undefined : conversationId,
        from: from || undefined,
        to: to || undefined,
        sort,
        page,
        pageSize,
      })
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
        setLoading(false)
      })
  }, [search, platform, conversationId, from, to, sort, page])

  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-navy">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Private message text is shown only to you. No AI classifications are generated yet.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Input
          placeholder="Search messages"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
            setParams(e.target.value ? { q: e.target.value } : {})
          }}
        />
        <Select value={platform} onValueChange={(v) => { setPlatform(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conversationId} onValueChange={(v) => { setConversationId(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Conversation" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All conversations</SelectItem>
            {conversations.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} />
        <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} />
        <Select value={sort} onValueChange={(v) => setSort(v as 'asc' | 'desc')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading messages…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Connect a source or upload a chat export. You can also load labeled Demo Data from Data Sources."
        />
      ) : (
        <MessageTable messages={items} conversations={conversations} onOpen={setOpen} aiAnalyses={aiAnalyses} />
      )}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{total} messages</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(open)} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message detail</DialogTitle>
            <DialogDescription>
              Analysis status: {open?.analysis_status}
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Platform:</span> {open.platform}</p>
              <p><span className="font-medium">Sender:</span> {open.sender}</p>
              <p><span className="font-medium">Timestamp:</span> {formatDate(open.timestamp)}</p>
              {open.is_demo ? <p className="font-semibold uppercase text-xs">Demo Data</p> : null}
              <p className="rounded-xl bg-secondary p-3">{open.message_text}</p>
              
              {/* AI Prediction */}
              {(() => {
                const aiPrediction = aiAnalyses.find((a) => a.text === open.message_text)
                if (aiPrediction) {
                  return (
                    <div className="mt-4 rounded-lg border p-3">
                      <p className="font-semibold">AI Analysis Result</p>
                      <div className="mt-2 space-y-1">
                        <p><span className="font-medium">Prediction:</span> {aiPrediction.prediction === 'suicidal' ? 'Potential Suicidal Content' : 'Non-Suicidal Content'}</p>
                        <p><span className="font-medium">Confidence:</span> {(aiPrediction.confidence * 100).toFixed(1)}%</p>
                        <p><span className="font-medium">Model:</span> {aiPrediction.model}</p>
                        <p><span className="font-medium">Source:</span> {aiPrediction.source}</p>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
