import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CONSENT_STATEMENT } from '@/lib/constants'
import { loadJson, saveJson } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'
import { messageService } from '@/services/messageService'
import { platformService } from '@/services/platformService'
import { userService } from '@/services/userService'
import type { ConnectedPlatform } from '@/types'

export function SettingsPage() {
  const { user, logout, refresh } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [timeout, setTimeoutMinutes] = useState(String(user?.session_timeout_minutes ?? 30))
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])
  const [emailAlerts, setEmailAlerts] = useState(loadJson('notify.email', true))
  const [productTips, setProductTips] = useState(loadJson('notify.tips', false))
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [disconnectOpen, setDisconnectOpen] = useState(false)

  useEffect(() => {
    void platformService.list().then(setPlatforms)
  }, [])

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    await userService.updateProfile({
      full_name: name,
      email,
      session_timeout_minutes: Number(timeout) || 30,
    })
    await refresh()
    toast.success('Profile updated')
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    try {
      await userService.changePassword(currentPassword, nextPassword)
      setCurrentPassword('')
      setNextPassword('')
      toast.success('Password changed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password')
    }
  }

  async function downloadData() {
    const data = await messageService.exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mindguard-data-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-muted-foreground">{CONSENT_STATEMENT}</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="platforms">Connected Platforms</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <form className="max-w-md space-y-4" onSubmit={(e) => void saveProfile(e)}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button variant="teal" type="submit">
                Save profile
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 space-y-6">
            <form className="max-w-md space-y-4" onSubmit={(e) => void changePassword(e)}>
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next">New password</Label>
                <Input id="next" type="password" minLength={8} value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} />
              </div>
              <Button variant="teal" type="submit">
                Change Password
              </Button>
            </form>
            <div className="max-w-md space-y-2">
              <Label htmlFor="timeout">Session timeout (minutes)</Label>
              <Input id="timeout" type="number" min={5} value={timeout} onChange={(e) => setTimeoutMinutes(e.target.value)} />
              <Button
                variant="outline"
                onClick={async () => {
                  await userService.updateProfile({ session_timeout_minutes: Number(timeout) || 30 })
                  toast.success('Session timeout saved')
                }}
              >
                Save timeout
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await logout()
                toast.success('Signed out')
                navigate('/login')
              }}
            >
              Logout
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="space-y-4 p-6">
            <label className="flex items-center justify-between gap-4">
              <span>Email product notices (no message content)</span>
              <Switch
                checked={emailAlerts}
                onCheckedChange={(v) => {
                  setEmailAlerts(v)
                  saveJson('notify.email', v)
                  toast.success('Notification preference saved')
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>Research update tips</span>
              <Switch
                checked={productTips}
                onCheckedChange={(v) => {
                  setProductTips(v)
                  saveJson('notify.tips', v)
                  toast.success('Notification preference saved')
                }}
              />
            </label>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6 text-sm text-muted-foreground">
            <p>HTTPS is required in production. Platform tokens are stored as backend references, not as raw secrets in local storage.</p>
            <p className="mt-2">You can revoke access and delete imported data at any time.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate('/privacy-consent')}>
              Open Privacy & Consent
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="p-6">
            <div className="space-y-3">
              {platforms.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span>{p.platform}</span>
                  <StatusBadge status={p.connection_status} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => navigate('/data-sources')}>
                Manage connections
              </Button>
              <Button variant="destructive" onClick={() => setDisconnectOpen(true)}>
                Disconnect Platforms
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="flex flex-wrap gap-2 p-6">
            <Button variant="outline" onClick={() => void downloadData()}>
              Download My Data
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              Delete My Data
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Configure the future Flask NLP endpoint without running models from the browser.
            </p>
            <Button className="mt-4" variant="teal" onClick={() => navigate('/analysis-settings')}>
              Open AI Analysis Settings
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete my imported data?"
        description="Conversations and messages for this account will be removed from the local store."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await messageService.deleteAllImported()
          toast.success('Imported data deleted')
        }}
      />
      <ConfirmationModal
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect all platforms?"
        description="Authorization for every source will be revoked."
        confirmLabel="Disconnect"
        destructive
        onConfirm={async () => {
          await platformService.disconnectAll()
          setPlatforms(await platformService.list())
          toast.success('Platforms disconnected')
        }}
      />
    </div>
  )
}
