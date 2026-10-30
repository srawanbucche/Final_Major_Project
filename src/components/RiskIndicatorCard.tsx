import { Card } from '@/components/ui/card'

export function RiskIndicatorCard({ title }: { title: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-3 text-lg font-semibold text-navy">Awaiting AI analysis</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Potential risk indicator · AI-generated screening result will appear here after the
        model service is connected. This is not a medical diagnosis.
      </p>
    </Card>
  )
}

export function ClassificationResultSlot() {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-muted-foreground">
        Future suicidal / non-suicidal classifier
      </p>
      <p className="mt-3 text-lg font-semibold text-navy">No classification available</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Ready to receive <code>classification</code>, <code>confidence</code>,{' '}
        <code>model</code>, and <code>timestamp</code> from the Flask analysis API. No
        placeholder predictions are shown.
      </p>
    </Card>
  )
}
