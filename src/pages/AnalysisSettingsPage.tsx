import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { analysisService } from '@/services/analysisService'
import { analysisStore } from '@/services/analysisStore'

export function AnalysisSettingsPage() {
  const [endpoint, setEndpoint] = useState('')
  const [status, setStatus] = useState('Not Connected')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    void analysisService.getConfig().then((cfg) => {
      if (!cfg) return
      setEndpoint(cfg.api_endpoint)
      setStatus(cfg.status === 'connected' ? 'Connected' : 'Not Connected')
    })
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    await analysisService.configure({ model_name: 'Naive Bayes', api_endpoint: endpoint })
    toast.success('Configuration saved. The service remains Not Connected until Flask reports a healthy model.')
    setStatus('Not Connected')
  }

  const handleClearHistory = () => {
    analysisStore.clearRecords()
    toast.success('Analysis history cleared')
    setShowClearConfirm(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">AI Analysis Settings</h1>
      <Card className="p-6">
        <form className="space-y-4" onSubmit={(e) => void onSave(e)}>
          <div>
            <Label>AI Service Status</Label>
            <p className="mt-1 text-sm font-semibold">{status}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              placeholder="http://127.0.0.1:5000/api/analysis/run"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <p className="mt-1 text-sm font-medium">Naive Bayes</p>
            <p className="text-xs text-muted-foreground">This application uses Naive Bayes with TF-IDF for text classification.</p>
          </div>
          <Button variant="teal" type="submit">
            Save Configuration
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">Analysis History</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clear all analysis history from the application. This will not delete the trained Naive Bayes model.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => setShowClearConfirm(true)}
        >
          Clear Analysis History
        </Button>
      </Card>

      <ConfirmationModal
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear Analysis History?"
        description="This will delete all analysis records from the application. The trained Naive Bayes model will not be affected."
        confirmLabel="Clear History"
        destructive
        onConfirm={handleClearHistory}
      />
    </div>
  )
}
