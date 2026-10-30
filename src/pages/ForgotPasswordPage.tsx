import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    toast.success('If an account exists, a reset link will be emailed by the backend when mail is configured.')
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-navy">Reset password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We will never use this to request social-platform credentials.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button className="w-full" variant="teal">
          Send reset instructions
        </Button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm text-accent">
        Back to login
      </Link>
    </Card>
  )
}
