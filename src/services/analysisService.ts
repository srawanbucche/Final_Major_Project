import type { ModelName } from '@/lib/constants'
import { authService } from '@/services/authService'
import { request, simulate, useRemoteApi } from '@/services/apiClient'
import { getStore, patchStore } from '@/services/mockStore'
import type { AnalysisResult, ModelConfiguration } from '@/types'

const NOT_CONNECTED = 'AI model integration is not configured yet.'
const FLASK_API_URL = 'http://localhost:5000'

async function requireUserId() {
  const user = await authService.currentUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const analysisService = {
  async getConfig(): Promise<ModelConfiguration | null> {
    if (useRemoteApi()) return request<ModelConfiguration | null>('/api/models')
    return simulate(async () => {
      const userId = await requireUserId()
      const config = getStore().modelConfig
      if (!config || config.user_id !== userId) return null
      return config
    })
  },

  async configure(input: { model_name: ModelName; api_endpoint: string }) {
    if (useRemoteApi()) {
      return request<ModelConfiguration>('/api/models/configure', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    }
    return simulate(async () => {
      const userId = await requireUserId()
      const config: ModelConfiguration = {
        id: crypto.randomUUID(),
        user_id: userId,
        model_name: input.model_name,
        api_endpoint: input.api_endpoint.trim(),
        status: 'not_connected',
        created_at: new Date().toISOString(),
      }
      patchStore({ modelConfig: config })
      return config
    })
  },

  async run() {
    if (useRemoteApi()) {
      return request('/api/analysis/run', { method: 'POST' })
    }
    return simulate(async () => {
      const config = await this.getConfig()
      if (!config || config.status !== 'connected' || !config.api_endpoint) {
        throw new Error(NOT_CONNECTED)
      }
      throw new Error(NOT_CONNECTED)
    })
  },

  async status() {
    if (useRemoteApi()) return request('/api/analysis/status')
    return simulate(async () => ({
      status: 'not_connected' as const,
      message: 'AI Model Not Connected',
    }))
  },

  async results(): Promise<AnalysisResult[]> {
    if (useRemoteApi()) return request<AnalysisResult[]>('/api/analysis/results')
    return simulate(async () => [])
  },

  async trends(params?: Record<string, string>) {
    if (useRemoteApi()) {
      const search = new URLSearchParams(params).toString()
      return request(`/api/trends?${search}`)
    }
    return simulate(async () => ({
      emotional: [],
      volume: [],
      risk: [],
      platforms: [],
    }))
  },

  // New methods for Flask API integration
  async predictText(text: string): Promise<{ success: boolean; prediction: string; confidence: number; model: string; error?: string }> {
    try {
      const response = await fetch(`${FLASK_API_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Prediction error:', error)
      return {
        success: false,
        prediction: 'error',
        confidence: 0,
        model: 'Naive Bayes',
        error: 'Failed to connect to prediction service'
      }
    }
  },

  async getHealth(): Promise<{ status: string; model: string; model_loaded: boolean }> {
    try {
      const response = await fetch(`${FLASK_API_URL}/api/health`)
      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      return {
        status: 'error',
        model: 'Naive Bayes',
        model_loaded: false
      }
    }
  },

  async getModelPerformance(): Promise<{ model_name: string; metrics: any } | null> {
    // Model performance page has been removed
    return null
  },

  async analyzeFile(file: File, onProgress?: (progress: number) => void): Promise<{
    success: boolean;
    model: string;
    total_messages: number;
    analyzed_messages: number;
    failed_messages: number;
    results: Array<{
      text: string;
      prediction: string;
      confidence: number;
      error?: string;
    }>;
    summary: {
      class_counts: Record<string, number>;
      class_percentages: Record<string, number>;
      average_confidence: number;
    };
    error?: string;
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      onProgress?.(10)

      const response = await fetch(`${FLASK_API_URL}/api/analyze-file`, {
        method: 'POST',
        body: formData,
      })

      onProgress?.(50)

      const data = await response.json()

      onProgress?.(100)

      return data
    } catch (error) {
      console.error('File analysis error:', error)
      return {
        success: false,
        model: 'Naive Bayes',
        total_messages: 0,
        analyzed_messages: 0,
        failed_messages: 0,
        results: [],
        summary: {
          class_counts: {},
          class_percentages: {},
          average_confidence: 0,
        },
        error: 'Failed to connect to analysis service',
      }
    }
  },
}

export const MODEL_NOT_CONNECTED_MESSAGE = NOT_CONNECTED
