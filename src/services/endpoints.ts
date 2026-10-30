/**
 * REST contract for the future Flask backend.
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/user/profile
 * PUT  /api/user/profile
 * GET  /api/platforms
 * POST /api/platforms/connect
 * POST /api/platforms/disconnect
 * POST /api/platforms/sync
 * GET  /api/messages
 * GET  /api/messages/:id
 * POST /api/chat-upload
 * GET  /api/conversations
 * POST /api/analysis/run
 * GET  /api/analysis/status
 * GET  /api/analysis/results
 * GET  /api/trends
 * GET  /api/reports
 * GET  /api/models
 * POST /api/models/configure
 * GET  /api/consent
 * POST /api/consent
 * DELETE /api/consent
 */
export const API_PATHS = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  profile: '/api/user/profile',
  platforms: '/api/platforms',
  connect: '/api/platforms/connect',
  disconnect: '/api/platforms/disconnect',
  sync: '/api/platforms/sync',
  messages: '/api/messages',
  chatUpload: '/api/chat-upload',
  conversations: '/api/conversations',
  analysisRun: '/api/analysis/run',
  analysisStatus: '/api/analysis/status',
  analysisResults: '/api/analysis/results',
  trends: '/api/trends',
  reports: '/api/reports',
  models: '/api/models',
  modelsConfigure: '/api/models/configure',
  consent: '/api/consent',
} as const
