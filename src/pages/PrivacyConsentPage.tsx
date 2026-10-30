import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { ConsentCard } from '@/components/ConsentCard'
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CONSENT_STATEMENT, PLATFORMS } from '@/lib/constants'
import { PLATFORM_META } from '@/lib/platforms'
import { formatDate } from '@/lib/utils'
import { consentService } from '@/services/consentService'
import { messageService } from '@/services/messageService'
import { platformService } from '@/services/platformService'
import type { ConnectedPlatform, ConsentRecord } from '@/types'

export function PrivacyConsentPage() {
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [disconnectAll, setDisconnectAll] = useState(false)
  const [deleteData, setDeleteData] = useState(false)
  const [revoke, setRevoke] = useState<ConsentRecord | null>(null)

  async function reload() {
    const [p, c] = await Promise.all([platformService.list(), consentService.list()])
    setPlatforms(p)
    setConsents(c)
  }

  useEffect(() => {
    void reload()
  }, [])

  function latestFor(platform: string) {
    return consents.find((c) => c.platform === platform && !c.revoked_at && c.consent_given)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Your Data & Consent</h1>
        <p className="text-sm text-muted-foreground">{CONSENT_STATEMENT}</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Connected Platforms</h2>
        <div className="mt-3 divide-y text-sm">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <span>{p.platform}</span>
              <span className="text-muted-foreground">{p.connection_status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold">Data Permissions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PLATFORMS.map((name) => {
            const meta = PLATFORM_META[name]
            return (
              <ConsentCard
                key={name}
                title={name}
                accessible={meta.access}
                purpose={meta.purpose}
                record={latestFor(name)}
                onRevoke={() => {
                  const record = latestFor(name)
                  if (record) setRevoke(record)
                }}
              />
            )
          })}
        </div>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Consent History</h2>
        {consents.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No consent events yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {consents.map((c) => (
              <li key={c.id} className="rounded-xl bg-secondary/60 p-3">
                <p className="font-medium">
                  {c.platform} · {c.consent_type.replace('_', ' ')}
                </p>
                <p className="text-muted-foreground">
                  {c.consent_given && !c.revoked_at ? 'Granted' : 'Revoked'} · {formatDate(c.consent_timestamp)}
                  {c.revoked_at ? ` · revoked ${formatDate(c.revoked_at)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Data Retention</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Imported messages stay in your account until you delete them. Minimize stored content by
          removing sources you no longer need. Production deployments should use HTTPS and keep
          platform tokens on the backend only.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Delete My Data</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Destructive actions require confirmation. They cannot be undone from this demo store.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDisconnectAll(true)}>
            Disconnect All Platforms
          </Button>
          <Button variant="destructive" onClick={() => setDeleteData(true)}>
            Delete All Imported Data
          </Button>
        </div>
      </Card>
      <MedicalDisclaimer />

      <ConfirmationModal
        open={disconnectAll}
        onOpenChange={setDisconnectAll}
        title="Disconnect all platforms?"
        description="Every connected source will be revoked. Imported messages remain until you delete them."
        confirmLabel="Disconnect all"
        destructive
        onConfirm={async () => {
          await platformService.disconnectAll()
          toast.success('All platforms disconnected')
          await reload()
        }}
      />
      <ConfirmationModal
        open={deleteData}
        onOpenChange={setDeleteData}
        title="Delete all imported data?"
        description="This removes conversations and messages collected for your account."
        confirmLabel="Delete data"
        destructive
        onConfirm={async () => {
          await messageService.deleteAllImported()
          toast.success('Imported data deleted')
          await reload()
        }}
      />
      <ConfirmationModal
        open={Boolean(revoke)}
        onOpenChange={() => setRevoke(null)}
        title={`Revoke ${revoke?.platform} consent?`}
        description="Access for this source will be withdrawn. You can reconnect later with a new authorization."
        confirmLabel="Revoke"
        destructive
        onConfirm={async () => {
          if (!revoke) return
          await consentService.revoke(revoke.id)
          if (revoke.platform !== 'all') {
            await platformService.disconnect(revoke.platform)
          }
          toast.success('Consent revoked')
          setRevoke(null)
          await reload()
        }}
      />
    </div>
  )
}
