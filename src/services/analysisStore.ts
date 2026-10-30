export interface AnalysisRecord {
  id: string
  text: string
  prediction: string
  confidence: number
  model: string
  source: 'Manual Text' | 'CSV Upload' | 'TXT Upload' | 'JSON Upload'
  platform?: string
  timestamp: string
  status: 'Pending' | 'Analyzing' | 'Analyzed' | 'Failed'
}

const STORAGE_KEY = 'mental_health_analysis_results'

function getStoredRecords(): AnalysisRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveStoredRecords(records: AnalysisRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('Failed to save analysis records:', error)
  }
}

export const analysisStore = {
  addRecord(record: Omit<AnalysisRecord, 'id' | 'timestamp' | 'status'>): AnalysisRecord {
    const records = getStoredRecords()
    const newRecord: AnalysisRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'Analyzed',
    }
    records.push(newRecord)
    saveStoredRecords(records)
    window.dispatchEvent(new CustomEvent('analysis-updated'))
    return newRecord
  },

  addRecords(records: Omit<AnalysisRecord, 'id' | 'timestamp' | 'status'>[]): AnalysisRecord[] {
    const existing = getStoredRecords()
    const newRecords: AnalysisRecord[] = records.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'Analyzed',
    }))
    saveStoredRecords([...existing, ...newRecords])
    window.dispatchEvent(new CustomEvent('analysis-updated'))
    return newRecords
  },

  updateRecordStatus(id: string, status: AnalysisRecord['status']): void {
    const records = getStoredRecords()
    const index = records.findIndex((r) => r.id === id)
    if (index !== -1) {
      records[index].status = status
      saveStoredRecords(records)
      window.dispatchEvent(new CustomEvent('analysis-updated'))
    }
  },

  getRecords(): AnalysisRecord[] {
    return getStoredRecords()
  },

  getSummary() {
    const records = getStoredRecords()
    const total = records.length
    if (total === 0) {
      return {
        totalMessages: 0,
        suicidalPredictions: 0,
        nonSuicidalPredictions: 0,
        averageConfidence: 0,
        classCounts: {} as Record<string, number>,
        classPercentages: {} as Record<string, number>,
        totalFiles: 0,
        failedMessages: 0,
      }
    }

    const suicidal = records.filter((r) => r.prediction === 'suicidal').length
    const nonSuicidal = records.filter((r) => r.prediction === 'non-suicidal').length
    const failed = records.filter((r) => r.status === 'Failed').length
    const totalConfidence = records.reduce((sum, r) => sum + r.confidence, 0)

    // Count unique files (based on timestamp grouping within same minute = same file upload)
    const uniqueTimestamps = new Set(
      records.map((r) => r.timestamp.substring(0, 16)) // Group by minute
    )
    const totalFiles = uniqueTimestamps.size

    const classCounts: Record<string, number> = {
      suicidal,
      'non-suicidal': nonSuicidal,
    }

    const classPercentages: Record<string, number> = {
      suicidal: total > 0 ? (suicidal / total) * 100 : 0,
      'non-suicidal': total > 0 ? (nonSuicidal / total) * 100 : 0,
    }

    return {
      totalMessages: total,
      suicidalPredictions: suicidal,
      nonSuicidalPredictions: nonSuicidal,
      averageConfidence: total > 0 ? totalConfidence / total : 0,
      classCounts,
      classPercentages,
      totalFiles,
      failedMessages: failed,
    }
  },

  getTrendData() {
    const records = getStoredRecords()
    const trendsByDate: Record<string, { suicidal: number; nonSuicidal: number; total: number }> = {}

    records.forEach((r) => {
      const date = r.timestamp.split('T')[0]
      if (!trendsByDate[date]) {
        trendsByDate[date] = { suicidal: 0, nonSuicidal: 0, total: 0 }
      }
      trendsByDate[date].total++
      if (r.prediction === 'suicidal') {
        trendsByDate[date].suicidal++
      } else {
        trendsByDate[date].nonSuicidal++
      }
    })

    return Object.entries(trendsByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  getSourceStats() {
    const records = getStoredRecords()
    const stats: Record<string, { count: number; messages: number }> = {}

    records.forEach((r) => {
      if (!stats[r.source]) {
        stats[r.source] = { count: 0, messages: 0 }
      }
      stats[r.source].count++
      stats[r.source].messages++
    })

    return stats
  },

  clearRecords(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
