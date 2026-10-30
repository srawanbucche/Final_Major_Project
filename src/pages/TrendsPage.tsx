import { useEffect, useState } from 'react'
import { TrendChart } from '@/components/TrendChart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { PLATFORMS } from '@/lib/constants'
import { analysisStore } from '@/services/analysisStore'

export function TrendsPage() {
  const [range, setRange] = useState('30')
  const [platform, setPlatform] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [trendData, setTrendData] = useState(analysisStore.getTrendData())
  const [hasData, setHasData] = useState(trendData.length > 0)

  useEffect(() => {
    const loadData = () => {
      const data = analysisStore.getTrendData()
      setTrendData(data)
      setHasData(data.length > 0)
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

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Trends</h1>
          <p className="text-sm text-muted-foreground">
            Visualizations stay empty until analysis results exist. No invented scores.
          </p>
        </div>
        <EmptyState
          title="No trend data available yet"
          description="Analyze some text or upload chat data to see trends."
          actionLabel="Go to Analysis"
          onAction={() => window.location.href = '/analysis'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Trends</h1>
        <p className="text-sm text-muted-foreground">
          Analysis trends based on actual predictions from Naive Bayes model.
        </p>
      </div>
      
      <Card className="p-5">
        <h2 className="font-semibold">Analysis Summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Days with Analysis</p>
            <p className="font-medium">{trendData.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Messages Analyzed</p>
            <p className="font-medium">{trendData.reduce((sum, d) => sum + d.total, 0)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Suicidal Predictions</p>
            <p className="font-medium">{trendData.reduce((sum, d) => sum + d.suicidal, 0)}</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {['7', '30', '90'].map((d) => (
          <Button key={d} size="sm" variant={range === d ? 'teal' : 'outline'} onClick={() => setRange(d)}>
            {d} Days
          </Button>
        ))}
        <Button size="sm" variant={range === 'custom' ? 'teal' : 'outline'} onClick={() => setRange('custom')}>
          Custom
        </Button>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {range === 'custom' ? (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart 
          title="Predictions over time" 
          data={trendData.map(d => ({ label: d.date, value: d.total }))} 
        />
        <TrendChart 
          title="Message volume over time" 
          data={trendData.map(d => ({ label: d.date, value: d.total }))} 
        />
        <TrendChart 
          title="Risk-indicator trend" 
          data={trendData.map(d => ({ label: d.date, value: d.suicidal }))} 
        />
        <TrendChart 
          title="Non-suicidal predictions" 
          data={trendData.map(d => ({ label: d.date, value: d.nonSuicidal }))} 
        />
      </div>
      <TrendChart 
        title="Daily analysis volume" 
        data={trendData.map(d => ({ label: d.date, value: d.total }))} 
      />
    </div>
  )
}
