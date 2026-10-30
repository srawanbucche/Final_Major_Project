import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DataUpload } from '@/components/DataUpload'
import { PlatformCard } from '@/components/PlatformCard'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { FileAnalysisResults } from '@/components/FileAnalysisResults'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLATFORM_META } from '@/lib/platforms'
import { messageService, type NormalizedMessage } from '@/services/messageService'
import { platformService } from '@/services/platformService'
import { analysisService } from '@/services/analysisService'
import { analysisStore } from '@/services/analysisStore'
import type { ConnectedPlatform } from '@/types'

export function DataSourcesPage() {
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])
  const [disconnect, setDisconnect] = useState<ConnectedPlatform | null>(null)
  const [oauth, setOauth] = useState<ConnectedPlatform | null>(null)
  const [settings, setSettings] = useState<ConnectedPlatform | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [sourceStats, setSourceStats] = useState<Record<string, { count: number; messages: number }>>({})
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined)

  async function reload() {
    setPlatforms(await platformService.list())
  }

  const loadSourceStats = () => {
    setSourceStats(analysisStore.getSourceStats())
  }

  useEffect(() => {
    void reload()
    loadSourceStats()

    const handleStorageChange = () => loadSourceStats()
    const handleAnalysisUpdate = () => loadSourceStats()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('analysis-updated', handleAnalysisUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('analysis-updated', handleAnalysisUpdate)
    }
  }, [])

  const handleFileAnalysis = async (file: File, onProgress?: (value: number) => void) => {
    setAnalyzing(true)
    setAnalysisResults(null)
    setUploadedFileName(file.name)
    
    try {
      const result = await analysisService.analyzeFile(file, onProgress)
      
      if (result.success) {
        setAnalysisResults(result)
        
        // Save all results to analysis store
        const source = file.name.toLowerCase().endsWith('.csv') ? 'CSV Upload' :
                      file.name.toLowerCase().endsWith('.txt') ? 'TXT Upload' :
                      file.name.toLowerCase().endsWith('.json') ? 'JSON Upload' : 'File Upload'
        
        const records = result.results.map((r) => ({
          text: r.text,
          prediction: r.prediction,
          confidence: r.confidence,
          model: result.model,
          source: source as 'CSV Upload' | 'TXT Upload' | 'JSON Upload',
        }))
        
        analysisStore.addRecords(records)
        
        // Also save messages to messageService for Messages page integration
        const user = await (await import('@/services/authService')).authService.currentUser()
        if (user) {
          await messageService.uploadChatWithAnalysis(file, result.results, onProgress)
        }
        
        toast.success(`Successfully analyzed ${result.analyzed_messages} messages`)
      } else {
        toast.error(result.error || 'File analysis failed')
      }
    } catch (error) {
      toast.error('File analysis failed')
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Data Sources</h1>
        <p className="text-sm text-muted-foreground">
          Official OAuth placeholders only. No third-party passwords are collected.
        </p>
      </div>
      
      {/* File Analysis Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">AI File Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Upload chat/text files for Naive Bayes analysis
            </p>
          </div>
          <Badge variant={analyzing ? 'warning' : 'success'}>
            {analyzing ? 'Analyzing...' : 'Ready'}
          </Badge>
        </div>
        
        <DataUpload
          onUpload={handleFileAnalysis}
          disabled={analyzing}
          buttonText="Analyze with Naive Bayes"
        />
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <FileAnalysisResults
          results={analysisResults.results}
          summary={analysisResults.summary}
          totalMessages={analysisResults.total_messages}
          analyzedMessages={analysisResults.analyzed_messages}
          failedMessages={analysisResults.failed_messages}
          model={analysisResults.model}
          fileName={uploadedFileName}
        />
      )}

      {/* Source Statistics */}
      {Object.keys(sourceStats).length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold">Analysis Data Sources</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Statistics for analyzed data by source
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(sourceStats).map(([source, stats]) => (
              <div key={source} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{source}</p>
                  <p className="text-xs text-muted-foreground">Status: Used</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{stats.messages} Messages</p>
                  <p className="text-xs text-muted-foreground">Analyzed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Connections */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            icon={PLATFORM_META[p.platform].icon}
            description={PLATFORM_META[p.platform].description}
            onConnect={() => setOauth(p)}
            onDisconnect={() => setDisconnect(p)}
            onSettings={() => setSettings(p)}
          />
        ))}
      </div>
      
      {/* Original Data Import Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">Import Chat Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Import chat data for storage and platform normalization (separate from AI analysis)
        </p>
        <DataUpload
          onUpload={async (file, onProgress) => {
            const result = await messageService.uploadChat(file, onProgress)
            toast.success(`Normalized ${result.imported} messages`)
            await reload()
          }}
        />
      </div>

      <Dialog open={Boolean(oauth)} onOpenChange={() => setOauth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {oauth?.platform}</DialogTitle>
            <DialogDescription>
              Placeholder authorization for the official {oauth?.platform} API. You will never be asked
              for that platform&apos;s password.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="teal"
            onClick={async () => {
              if (!oauth) return
              await platformService.connect(oauth.platform)
              toast.success(`${oauth.platform} connected`)
              setOauth(null)
              await reload()
            }}
          >
            Continue with official authorization (demo)
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(settings)} onOpenChange={() => setSettings(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settings?.platform} settings</DialogTitle>
            <DialogDescription>
              Sync uses the stored backend token reference. Raw access tokens are not kept in the browser.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            onClick={async () => {
              if (!settings) return
              await platformService.sync(settings.platform)
              toast.success('Sync timestamp updated')
              setSettings(null)
              await reload()
            }}
          >
            Sync now
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={Boolean(disconnect)}
        onOpenChange={() => setDisconnect(null)}
        title={`Disconnect ${disconnect?.platform}?`}
        description="This revokes consent for the source. Imported messages remain until you delete them."
        confirmLabel="Disconnect"
        destructive
        onConfirm={async () => {
          if (!disconnect) return
          await platformService.disconnect(disconnect.platform)
          toast.success('Platform disconnected')
          setDisconnect(null)
          await reload()
        }}
      />
    </div>
  )
}
