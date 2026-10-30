import { request, simulate, useRemoteApi } from '@/services/apiClient'

export type ReportKind =
  | 'mental-health'
  | 'platform-activity'
  | 'trend'

export const reportService = {
  async list() {
    if (useRemoteApi()) return request('/api/reports')
    return simulate(async () => [])
  },

  async generate(_kind: ReportKind) {
    void _kind
    if (useRemoteApi()) {
      return request('/api/reports', { method: 'POST', body: JSON.stringify({ kind: _kind }) })
    }
    throw new Error('Reports become available after data analysis.')
  },
}
