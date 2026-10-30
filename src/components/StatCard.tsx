import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-5 transition-transform duration-200 hover:-translate-y-0.5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-navy">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}
