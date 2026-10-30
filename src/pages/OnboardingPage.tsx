import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/StatusBadge'
import { APP_NAME } from '@/lib/constants'
import { PLATFORM_META } from '@/lib/platforms'
import { useAuth } from '@/context/AuthContext'
import { consentService } from '@/services/consentService'
import { platformService } from '@/services/platformService'
import { userService } from '@/services/userService'
import type { ConnectedPlatform } from '@/types'

export function OnboardingPage() {
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [consent, setConsent] = useState(false)
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])
  const [oauth, setOauth] = useState<ConnectedPlatform | null>(null)

  useEffect(() => {
    void platformService.list().then(setPlatforms)
  }, [])

  async function finish() {
    if (!consent) {
      toast.error('Consent is required to continue.')
      return
    }
    await consentService.grant({
      platform: 'all',
      consent_type: 'onboarding',
      notes: 'I understand and consent to analysis of data that I explicitly provide or authorize.',
    })
    await userService.updateProfile({ consent_onboarding: true, onboarding_complete: true })
    await refresh()
    toast.success('Onboarding complete')
    navigate('/dashboard')
  }

  async function connect(p: ConnectedPlatform) {
    await platformService.connect(p.platform)
    toast.success(`${p.platform} connected via placeholder OAuth (no password collected).`)
    setOauth(null)
    setPlatforms(await platformService.list())
  }

  return (
    <div className="bg-mesh min-h-svh px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-accent">Step {step} of 3</p>
        {step === 1 && (
          <Card className="mt-4 p-8">
            <h1 className="text-3xl font-bold text-navy">Welcome to {APP_NAME}</h1>
            <p className="mt-4 text-muted-foreground">
              MindGuard AI helps you organize authorized personal text so future NLP models can
              surface potential risk indicators. It does not diagnose illness, does not replace a
              clinician, and will not invent scores until a real model is connected.
            </p>
            <Button className="mt-6" variant="teal" onClick={() => setStep(2)}>
              Continue
            </Button>
          </Card>
        )}
        {step === 2 && (
          <Card className="mt-4 p-8">
            <h1 className="text-3xl font-bold text-navy">Privacy & Consent</h1>
            <p className="mt-4 text-muted-foreground">
              You control which data sources are connected and what is analyzed. Tokens are stored
              as backend references, not as social passwords. You can disconnect and delete data later.
            </p>
            <label className="mt-6 flex items-start gap-3 text-sm">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
              <span>I understand and consent to analysis of data that I explicitly provide or authorize.</span>
            </label>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="teal" onClick={() => setStep(3)} disabled={!consent}>
                Continue
              </Button>
            </div>
          </Card>
        )}
        {step === 3 && (
          <Card className="mt-4 p-8">
            <h1 className="text-3xl font-bold text-navy">Connect Data Sources</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional for now. Placeholder OAuth can be replaced with official APIs later.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {platforms
                .filter((p) => p.platform !== 'Chat Export' || true)
                .map((p) => {
                  const meta = PLATFORM_META[p.platform]
                  const Icon = meta.icon
                  return (
                    <div key={p.id} className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-accent" />
                        <StatusBadge status={p.connection_status} />
                      </div>
                      <h3 className="mt-3 font-semibold">{p.platform}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
                      <Button
                        className="mt-3"
                        size="sm"
                        variant={p.connection_status === 'connected' ? 'outline' : 'teal'}
                        onClick={() => setOauth(p)}
                      >
                        {p.connection_status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  )
                })}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="teal" onClick={() => void finish()}>
                Enter dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
      <Dialog open={Boolean(oauth)} onOpenChange={() => setOauth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorize {oauth?.platform}</DialogTitle>
            <DialogDescription>
              You would be redirected to the official {oauth?.platform} authorization flow when this
              integration is enabled. MindGuard AI does not collect that platform&apos;s password.
            </DialogDescription>
          </DialogHeader>
          <Button variant="teal" onClick={() => oauth && void connect(oauth)}>
            Simulate successful connection (demo)
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
