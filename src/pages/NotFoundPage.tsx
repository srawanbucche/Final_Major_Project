import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-mesh px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">Page not found</h1>
        <p className="mt-2 text-muted-foreground">That route is not part of MindGuard AI.</p>
        <Button className="mt-6" variant="teal" asChild>
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  )
}
