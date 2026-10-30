import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClassificationResultSlot, RiskIndicatorCard } from '@/components/RiskIndicatorCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { NLP_PIPELINE, RISK_INDICATOR_KEYS } from '@/lib/constants'
import { analysisService, MODEL_NOT_CONNECTED_MESSAGE } from '@/services/analysisService'
import { analysisStore } from '@/services/analysisStore'
import type { ModelConfiguration } from '@/types'

export function AnalysisPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<ModelConfiguration | null>(null)
  const [health, setHealth] = useState<{ status: string; model: string; model_loaded: boolean } | null>(null)
  const [inputText, setInputText] = useState('')
  const [prediction, setPrediction] = useState<{ success: boolean; prediction: string; confidence: number; model: string; error?: string } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    void analysisService.getConfig().then(setConfig)
    void analysisService.getHealth().then(setHealth)
  }, [])

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    setAnalyzing(true)
    setPrediction(null)

    try {
      const result = await analysisService.predictText(inputText)
      setPrediction(result)
      
      if (result.success) {
        // Save to analysis store
        analysisStore.addRecord({
          text: inputText,
          prediction: result.prediction,
          confidence: result.confidence,
          model: result.model,
          source: 'Manual Text',
        })
        toast.success('Analysis completed and saved')
      } else {
        toast.error(result.error || 'Analysis failed')
      }
    } catch (error) {
      toast.error('Failed to analyze text')
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  const isModelConnected = health?.model_loaded && health?.status === 'ok'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">AI Mental Health Analysis</h1>
          <p className="text-sm text-muted-foreground">Language used here: potential risk indicator, requires further assessment.</p>
        </div>
        <Badge variant={isModelConnected ? 'success' : 'warning'}>
          {isModelConnected ? 'AI Model Connected' : 'AI Model Not Connected'}
        </Badge>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold">Model configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current Model: Naive Bayes. Saved endpoint:{' '}
          {config?.api_endpoint || 'not set'} · {config?.model_name || 'no model selected'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NLP_PIPELINE.map((step) => (
            <Badge key={step} variant="secondary">
              {step}
            </Badge>
          ))}
        </div>
        <p className="mt-4 text-sm">
          AI Service Status: <strong>{isModelConnected ? 'Connected' : 'Not Connected'}</strong>
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => navigate('/analysis-settings')}>
            Open API configuration
          </Button>
          <Button
            variant="teal"
            onClick={async () => {
              try {
                await analysisService.run()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : MODEL_NOT_CONNECTED_MESSAGE)
              }
            }}
          >
            Run Analysis
          </Button>
        </div>
      </Card>

      {/* Text Analysis Section */}
      <Card className="p-6">
        <h2 className="font-semibold">Analyze Text</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter or paste text for analysis using the Naive Bayes model.
        </p>
        <div className="mt-4 space-y-4">
          <Textarea
            placeholder="Enter or paste text for analysis..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            disabled={!isModelConnected}
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={!isModelConnected || analyzing || !inputText.trim()}
            variant="teal"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">AI TEXT ANALYSIS</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Prediction:</span>
                <p className="font-medium">
                  {prediction.prediction === 'suicidal' ? 'Potential Suicidal Content' : 'Non-Suicidal Content'}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <p className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Model:</span>
                <p className="font-medium">{prediction.model}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              This result is generated from textual patterns learned from the training dataset. It is not a medical diagnosis.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RISK_INDICATOR_KEYS.map((key) => (
          <RiskIndicatorCard key={key} title={key} />
        ))}
      </div>
      <ClassificationResultSlot />
    </div>
  )
}
