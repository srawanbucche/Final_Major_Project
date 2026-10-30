import type { ModelName, PlatformName } from '@/lib/constants'

export type ConnectionStatus = 'connected' | 'not_connected' | 'available' | 'syncing' | 'error'
export type AnalysisStatus = 'Not Analyzed' | 'Processing' | 'Analyzed'
export type MessageType = 'text' | 'media' | 'system'
export type ConsentType = 'platform_connect' | 'data_import' | 'analysis' | 'onboarding'

export interface User {
  id: string
  full_name: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
  onboarding_complete: boolean
  consent_onboarding: boolean
  session_timeout_minutes: number
}

export interface Session {
  userId: string
  token: string
  createdAt: string
  lastActivity: string
}

export interface ConnectedPlatform {
  id: string
  user_id: string
  platform: PlatformName
  connection_status: ConnectionStatus
  access_token_reference: string | null
  connected_at: string | null
  last_synced_at: string | null
  messages_collected: number
}

export interface ConsentRecord {
  id: string
  user_id: string
  platform: PlatformName | 'all'
  consent_type: ConsentType
  consent_given: boolean
  consent_timestamp: string
  revoked_at: string | null
  notes?: string
}

export interface Conversation {
  id: string
  user_id: string
  platform: PlatformName
  external_conversation_id: string
  title: string
  created_at: string
  is_demo: boolean
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  platform: PlatformName
  sender: string
  message_text: string
  timestamp: string
  message_type: MessageType
  analysis_status: AnalysisStatus
  is_demo: boolean
}

export interface NormalizedMessage {
  platform: PlatformName | string
  conversation_id: string
  sender: string
  timestamp: string
  message: string
  message_type: MessageType
}

export interface AnalysisResult {
  id: string
  message_id: string
  model_name: ModelName | string
  classification: string
  confidence: number
  analyzed_at: string
}

export interface UserAnalysisSummary {
  id: string
  user_id: string
  analysis_period: string
  risk_indicator: string
  score: number | null
  generated_at: string
}

export interface ModelConfiguration {
  id: string
  user_id: string
  model_name: ModelName
  api_endpoint: string
  status: 'connected' | 'not_connected'
  created_at: string
}

export interface UploadJob {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  message?: string
}

export interface FutureClassificationPayload {
  classification: 'suicidal' | 'non-suicidal' | string
  confidence: number
  model: ModelName | string
  timestamp: string
}

export interface ApiError {
  error: string
  code?: string
}
