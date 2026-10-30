export const APP_NAME = 'MINDGUARD AI'
export const APP_TAGLINE = 'Understand patterns. Support wellbeing.'

export const MEDICAL_DISCLAIMER =
  'This system is a research and early-risk screening tool based on textual patterns. It is not a medical diagnostic system and should not replace assessment by a qualified mental-health professional.'

export const LANDING_DISCLAIMER =
  'This application is designed for research and early-risk screening purposes only. It does not provide a medical diagnosis or replace professional mental-health care.'

export const CONSENT_STATEMENT =
  'Your data is analyzed only after you provide or authorize access.'

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000

export const PLATFORMS = [
  'Instagram',
  'WhatsApp',
  'Telegram',
  'Snapchat',
  'Chat Export',
] as const

export type PlatformName = (typeof PLATFORMS)[number]

export const MODEL_NAMES = ['Naive Bayes'] as const
export type ModelName = (typeof MODEL_NAMES)[number]

export const NLP_PIPELINE = [
  'NLP preprocessing',
  'Tokenization',
  'Stop-word removal',
  'Lemmatization',
  'TF-IDF',
] as const

export const RISK_INDICATOR_KEYS = [
  'Emotional Distress',
  'Suicidal Risk Indicator',
  'Negative Sentiment',
  'Social Withdrawal',
  'Hopelessness-related Language',
  'Stress Indicators',
  'Trend Changes',
] as const
