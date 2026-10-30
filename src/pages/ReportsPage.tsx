import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { reportService, type ReportKind } from '@/services/reportService'
import { analysisStore } from '@/services/analysisStore'

const reports: { kind: ReportKind; title: string }[] = [
  { kind: 'mental-health', title: 'Mental Health Analysis Report' },
  { kind: 'platform-activity', title: 'Platform Activity Report' },
  { kind: 'trend', title: 'Trend Report' },
]

export function ReportsPage() {
  const [summary, setSummary] = useState(analysisStore.getSummary())
  const [hasData, setHasData] = useState(summary.totalMessages > 0)

  useEffect(() => {
    const loadData = () => {
      const data = analysisStore.getSummary()
      setSummary(data)
      setHasData(data.totalMessages > 0)
    }

    loadData()

    const handleStorageChange = () => loadData()
    const handleAnalysisUpdate = () => loadData()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('analysis-updated', handleAnalysisUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('analysis-updated', handleAnalysisUpdate)
    }
  }, [])

  async function act(kind: ReportKind, mode: 'generate' | 'pdf' | 'csv') {
    try {
      await reportService.generate(kind)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `${err.message} (${mode})`
          : 'Reports become available after data analysis.',
      )
    }
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="text-sm text-muted-foreground">Export actions are wired; content requires completed analysis.</p>
        </div>
        <EmptyState
          title="No report data available yet"
          description="Analyze some text or upload chat data to generate reports."
          actionLabel="Go to Analysis"
          onAction={() => window.location.href = '/analysis'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="text-sm text-muted-foreground">Export actions are wired; content requires completed analysis.</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Analysis Summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Messages</p>
            <p className="font-medium">{summary.totalMessages}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Files Analyzed</p>
            <p className="font-medium">{summary.totalFiles}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Average Confidence</p>
            <p className="font-medium">{(summary.averageConfidence * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Suicidal Predictions</p>
            <p className="font-medium">{summary.suicidalPredictions}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Non-Suicidal Predictions</p>
            <p className="font-medium">{summary.nonSuicidalPredictions}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Failed Messages</p>
            <p className="font-medium">{summary.failedMessages}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Prediction Distribution</h2>
        <div className="mt-4 space-y-2">
          {Object.entries(summary.classCounts).map(([label, count]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{count}</span>
                <span className="text-sm text-muted-foreground">
                  {summary.classPercentages[label]?.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Model Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Model</p>
            <p className="font-medium">Naive Bayes</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Feature Extraction</p>
            <p className="font-medium">TF-IDF</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.kind} className="p-5">
            <h2 className="font-semibold">{r.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Reports become available after data analysis.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="teal" onClick={() => void act(r.kind, 'generate')}>
                Generate Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => void act(r.kind, 'pdf')}>
                Export PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => void act(r.kind, 'csv')}>
                Export CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
