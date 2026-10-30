import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONSENT_STATEMENT } from '@/lib/constants'
import { platformService } from '@/services/platformService'
import { messageService } from '@/services/messageService'
import { analysisService } from '@/services/analysisService'
import { analysisStore } from '@/services/analysisStore'
import type { ConnectedPlatform } from '@/types'
import type { AnalysisRecord } from '@/services/analysisStore'

export function DashboardPage() {
  const navigate = useNavigate()
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])
  const [collected, setCollected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<{ status: string; model: string; model_loaded: boolean } | null>(null)
  const [analysisStats, setAnalysisStats] = useState({
    messagesAnalyzed: 0,
    suicidalPredictions: 0,
    nonSuicidalPredictions: 0,
    averageConfidence: 0,
    totalFiles: 0,
    failedMessages: 0,
  })
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([])

  const loadAnalysisStats = () => {
    const summary = analysisStore.getSummary()
    setAnalysisStats({
      messagesAnalyzed: summary.totalMessages,
      suicidalPredictions: summary.suicidalPredictions,
      nonSuicidalPredictions: summary.nonSuicidalPredictions,
      averageConfidence: summary.averageConfidence,
      totalFiles: summary.totalFiles,
      failedMessages: summary.failedMessages,
    })
    
    // Load recent analyses (last 5)
    const records = analysisStore.getRecords()
    setRecentAnalyses(records.slice(-5).reverse())
  }

  useEffect(() => {
    void Promise.all([platformService.list(), messageService.list({ pageSize: 1 })]).then(
      ([p, messages]) => {
        setPlatforms(p)
        setCollected(messages.total)
        setLoading(false)
      },
    )
    
    // Check AI model health
    void analysisService.getHealth().then(setHealth)
    
    // Load analysis stats from store
    loadAnalysisStats()
    
    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = () => {
      loadAnalysisStats()
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab updates
    const handleAnalysisUpdate = () => {
      loadAnalysisStats()
    }
    window.addEventListener('analysis-updated', handleAnalysisUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('analysis-updated', handleAnalysisUpdate)
    }
  }, [])

  const connected = platforms.filter((p) => p.connection_status === 'connected').length
  const isModelConnected = health?.model_loaded && health?.status === 'ok'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{CONSENT_STATEMENT}</p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading metrics…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Connected Platforms" value={`${connected} Connected`} icon={Database} />
          <StatCard title="Messages Collected" value={collected.toLocaleString()} icon={MessageSquare} />
          <StatCard
            title="Messages Analyzed"
            value={analysisStats.messagesAnalyzed.toLocaleString()}
            hint={isModelConnected ? "AI analysis active" : "AI analysis not connected"}
            icon={Sparkles}
          />
          <StatCard 
            title="Current Model" 
            value={isModelConnected ? "Naive Bayes" : "Not Connected"} 
            icon={ShieldAlert}
          />
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-semibold">Data Collection Status</h2>
        <div className="mt-4 divide-y">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 text-sm">
              <span>{p.platform}</span>
              <StatusBadge status={p.connection_status} />
            </div>
          ))}
        </div>
      </Card>

      {/* AI Model Status */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">AI Model Status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Current Model: <strong>{isModelConnected ? "Naive Bayes" : "Not Connected"}</strong>
            </p>
          </div>
          <Badge variant={isModelConnected ? 'success' : 'warning'}>
            {isModelConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        
        {isModelConnected && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Feature Extraction</p>
              <p className="font-medium">TF-IDF</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Classification</p>
              <p className="font-medium">Multinomial Naive Bayes</p>
            </div>
          </div>
        )}
      </Card>

      {/* Analysis Statistics */}
      {isModelConnected && analysisStats.messagesAnalyzed > 0 ? (
        <Card className="p-5">
          <h2 className="font-semibold">Analysis Statistics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Messages Analyzed</p>
              <p className="font-medium">{analysisStats.messagesAnalyzed}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Files Analyzed</p>
              <p className="font-medium">{analysisStats.totalFiles}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Average Confidence</p>
              <p className="font-medium">{(analysisStats.averageConfidence * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Suicidal Predictions</p>
              <p className="font-medium">{analysisStats.suicidalPredictions}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Non-Suicidal Predictions</p>
              <p className="font-medium">{analysisStats.nonSuicidalPredictions}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Failed Messages</p>
              <p className="font-medium">{analysisStats.failedMessages}</p>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title={isModelConnected ? "No analysis data available yet" : "AI analysis will appear here"}
          description={isModelConnected 
            ? "Start analyzing messages to see statistics here." 
            : "Connect the NLP/ML analysis service to generate mental-health risk indicators."}
          actionLabel={isModelConnected ? "Go to Analysis" : "Configure AI Model"}
          onAction={() => navigate(isModelConnected ? '/analysis' : '/analysis-settings')}
        />
      )}

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold">Recent Analyzed Messages</h2>
          <div className="mt-4 space-y-2">
            {recentAnalyses.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" title={record.text}>{record.text}</p>
                  <p className="text-xs text-muted-foreground">{record.source} • {new Date(record.timestamp).toLocaleString()}</p>
                </div>
                <div className="ml-4 text-right">
                  <Badge variant={record.prediction === 'suicidal' ? 'warning' : 'success'}>
                    {record.prediction === 'suicidal' ? 'Potential Suicidal' : 'Non-Suicidal'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{(record.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <MedicalDisclaimer />
    </div>
  )
}
