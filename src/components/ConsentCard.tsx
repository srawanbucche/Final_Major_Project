import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ConsentRecord } from '@/types'

export function ConsentCard({
  title,
  accessible,
  purpose,
  record,
  onRevoke,
}: {
  title: string
  accessible: string
  purpose: string
  record?: ConsentRecord
  onRevoke: () => void
}) {
  const active = Boolean(record?.consent_given && !record.revoked_at)
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <StatusBadge status={active ? 'connected' : 'not_connected'} />
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">Accessible data: </span>
          {accessible}
        </li>
        <li>
          <span className="font-medium text-foreground">Why it is used: </span>
          {purpose}
        </li>
        <li>
          <span className="font-medium text-foreground">Consent date: </span>
          {formatDate(record?.consent_timestamp)}
        </li>
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        disabled={!active}
        onClick={onRevoke}
      >
        Revoke
      </Button>
    </Card>
  )
}
