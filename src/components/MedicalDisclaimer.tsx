import { MEDICAL_DISCLAIMER } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MedicalDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      {MEDICAL_DISCLAIMER}
    </p>
  )
}
