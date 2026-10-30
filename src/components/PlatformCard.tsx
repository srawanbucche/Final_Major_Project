import type { LucideIcon } from 'lucide-react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ConnectedPlatform } from '@/types'

interface PlatformCardProps {
  platform: ConnectedPlatform
  icon: LucideIcon
  description: string
  onConnect: () => void
  onDisconnect: () => void
  onSettings?: () => void
}

export function PlatformCard({
  platform,
  icon: Icon,
  description,
  onConnect,
  onDisconnect,
  onSettings,
}: PlatformCardProps) {
  const connected = platform.connection_status === 'connected'
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-navy">
          <Icon className="h-6 w-6" />
        </div>
        <StatusBadge status={platform.connection_status} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{platform.platform}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt>Last synchronized</dt>
          <dd className="font-medium text-foreground">{formatDate(platform.last_synced_at)}</dd>
        </div>
        <div>
          <dt>Messages collected</dt>
          <dd className="font-medium text-foreground">{platform.messages_collected.toLocaleString()}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-2">
        {connected ? (
          <Button variant="outline" className="flex-1" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button variant="teal" className="flex-1" onClick={onConnect}>
            Connect
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Platform settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
