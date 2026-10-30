import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

export function MessageTable({
  messages,
  conversations,
  onOpen,
  aiAnalyses,
}: {
  messages: Message[]
  conversations: Conversation[]
  onOpen: (message: Message) => void
  aiAnalyses?: any[]
}) {
  const titleFor = (id: string) =>
    conversations.find((c) => c.id === id)?.title ?? 'Conversation'

  const getAiPrediction = (messageText: string) => {
    if (!aiAnalyses) return null
    return aiAnalyses.find((a) => a.text === messageText)
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Platform</th>
            <th className="px-4 py-3 font-semibold">Conversation</th>
            <th className="px-4 py-3 font-semibold">Sender</th>
            <th className="px-4 py-3 font-semibold">Message Preview</th>
            <th className="px-4 py-3 font-semibold">Timestamp</th>
            <th className="px-4 py-3 font-semibold">Analysis Status</th>
            <th className="px-4 py-3 font-semibold">AI Prediction</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => {
            const aiPrediction = getAiPrediction(m.message_text)
            return (
              <tr
                key={m.id}
                className="cursor-pointer border-t hover:bg-secondary/40"
                onClick={() => onOpen(m)}
              >
                <td className="px-4 py-3">{m.platform}</td>
                <td className="px-4 py-3">
                  {titleFor(m.conversation_id)}
                  {m.is_demo ? (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-navy">
                      Demo Data
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{m.sender}</td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                  {m.message_text}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(m.timestamp)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.analysis_status} />
                </td>
                <td className="px-4 py-3">
                  {aiPrediction ? (
                    <div className="flex flex-col gap-1">
                      <Badge variant={aiPrediction.prediction === 'suicidal' ? 'warning' : 'success'}>
                        {aiPrediction.prediction === 'suicidal' ? 'Potential Suicidal' : 'Non-Suicidal'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(aiPrediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
