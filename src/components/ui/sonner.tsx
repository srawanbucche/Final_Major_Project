import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-border bg-white text-foreground shadow-lg',
        },
      }}
    />
  )
}
