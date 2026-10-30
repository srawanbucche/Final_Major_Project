import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (!agree) {
      toast.error('Please agree to the Terms & Privacy Policy.')
      return
    }
    setLoading(true)
    try {
      await register(fullName, email, password)
      toast.success('Account created. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-navy">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We never ask for Instagram, WhatsApp, Telegram, or Snapchat passwords.
      </p>
      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
          <span>
            Agree to{' '}
            <Link to="/terms" className="font-semibold text-accent">
              Terms
            </Link>{' '}
            &{' '}
            <Link to="/privacy" className="font-semibold text-accent">
              Privacy Policy
            </Link>
            . Your data is analyzed only after you provide or authorize access.
          </span>
        </label>
        <Button className="w-full" variant="teal" disabled={loading}>
          {loading ? 'Creating…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </Card>
  )
}
