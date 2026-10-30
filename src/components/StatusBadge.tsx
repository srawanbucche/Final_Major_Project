import { Badge } from '@/components/ui/badge'
import type { AnalysisStatus, ConnectionStatus } from '@/types'

export function StatusBadge({
  status,
}: {
  status: AnalysisStatus | ConnectionStatus | string
}) {
  const map: Record<string, { variant: 'success' | 'warning' | 'muted' | 'outline' | 'secondary'; label: string }> = {
    connected: { variant: 'success', label: 'Connected' },
    not_connected: { variant: 'muted', label: 'Not Connected' },
    available: { variant: 'secondary', label: 'Available' },
    syncing: { variant: 'warning', label: 'Syncing' },
    error: { variant: 'warning', label: 'Error' },
    'Not Analyzed': { variant: 'muted', label: 'Not Analyzed' },
    Processing: { variant: 'warning', label: 'Processing' },
    Analyzed: { variant: 'success', label: 'Analyzed' },
    not_connected_ai: { variant: 'outline', label: 'AI analysis not connected' },
  }
  const item = map[status] ?? { variant: 'outline' as const, label: status }
  return <Badge variant={item.variant}>{item.label}</Badge>
}
