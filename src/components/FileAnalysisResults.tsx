import { useState } from 'react'
import { AlertCircle, CheckCircle, FileText, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AnalysisResult {
  text: string
  prediction: string
  confidence: number
  error?: string
  status?: 'Pending' | 'Analyzing' | 'Analyzed' | 'Failed'
}

interface AnalysisSummary {
  class_counts: Record<string, number>
  class_percentages: Record<string, number>
  average_confidence: number
}

interface FileAnalysisResultsProps {
  results: AnalysisResult[]
  summary: AnalysisSummary
  totalMessages: number
  analyzedMessages: number
  failedMessages: number
  model: string
  fileName?: string
}

const COLORS = {
  'suicidal': '#ef4444',
  'non-suicidal': '#22c55e',
  'error': '#f59e0b',
}

export function FileAnalysisResults({
  results,
  summary,
  totalMessages,
  analyzedMessages,
  failedMessages,
  model,
  fileName,
}: FileAnalysisResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Prepare chart data
  const chartData = Object.entries(summary.class_counts).map(([name, value]) => ({
    name: name === 'suicidal' ? 'Potential Suicidal' : 'Non-Suicidal',
    value,
    percentage: summary.class_percentages[name],
  }))

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(results.length / itemsPerPage)

  const formatPrediction = (prediction: string) => {
    if (prediction === 'suicidal') return 'Potential Suicidal Content'
    if (prediction === 'non-suicidal') return 'Non-Suicidal Content'
    return prediction
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Analysis Summary
        </h2>
        
        {fileName && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">File</p>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-green-600 mt-1">Status: Analysis Complete</p>
          </div>
        )}
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold">{totalMessages}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Successfully Analyzed</p>
            <p className="text-2xl font-bold text-green-600">{analyzedMessages}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Failed to Analyze</p>
            <p className="text-2xl font-bold text-red-600">{failedMessages}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Average Confidence</p>
            <p className="text-2xl font-bold">{(summary.average_confidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="mt-6">
          <h3 className="mb-3 font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Class Distribution
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(summary.class_counts).map(([className, count]) => (
              <div key={className} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {className === 'suicidal' ? 'Potential Suicidal' : 'Non-Suicidal'}
                </p>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">
                  {summary.class_percentages[className].toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Visualization</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name === 'Potential Suicidal' ? 'suicidal' : 'non-suicidal'] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Results Table */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Message Analysis Results</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">Message</th>
                <th className="px-4 py-2 text-left font-medium">Prediction</th>
                <th className="px-4 py-2 text-left font-medium">Confidence</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((result, index) => (
                <tr key={indexOfFirstItem + index} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="px-4 py-2 max-w-md truncate" title={result.text}>
                    {result.text}
                  </td>
                  <td className="px-4 py-2">
                    {result.error ? (
                      <span className="text-muted-foreground">Error</span>
                    ) : (
                      <Badge variant={result.prediction === 'suicidal' ? 'warning' : 'success'}>
                        {formatPrediction(result.prediction)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {result.error ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <span>{(result.confidence * 100).toFixed(1)}%</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {result.error ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Failed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Analyzed</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Model Information */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Model Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Model Used</p>
            <p className="font-medium">{model}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Feature Extraction</p>
            <p className="font-medium">TF-IDF</p>
          </div>
        </div>
      </Card>

      <MedicalDisclaimer />
    </div>
  )
}