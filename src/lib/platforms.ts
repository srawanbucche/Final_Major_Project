import {
  Camera,
  FileText,
  Images,
  MessageCircle,
  Send,
  type LucideIcon,
} from 'lucide-react'
import type { PlatformName } from '@/lib/constants'

export const PLATFORM_META: Record<
  PlatformName,
  { icon: LucideIcon; description: string; access: string; purpose: string }
> = {
  Instagram: {
    icon: Images,
    description: 'Placeholder official authorization. Chat exports can be used if DM APIs are unavailable.',
    access: 'Authorized media captions and permitted message exports only.',
    purpose: 'Normalize user-authorized text for later NLP screening.',
  },
  WhatsApp: {
    icon: MessageCircle,
    description: 'No WhatsApp password is collected. Use official export or future OAuth-style consent.',
    access: 'User-provided chat export content.',
    purpose: 'Collect permitted conversational text after explicit consent.',
  },
  Telegram: {
    icon: Send,
    description: 'Placeholder bot/OAuth connection for authorized chats.',
    access: 'Chats the user explicitly authorizes.',
    purpose: 'Language-pattern screening after consent.',
  },
  Snapchat: {
    icon: Camera,
    description: 'Direct private APIs are often unavailable; support user-provided exports.',
    access: 'User-uploaded export files.',
    purpose: 'Include Snapchat text only when the user supplies it.',
  },
  'Chat Export': {
    icon: FileText,
    description: 'Upload TXT, CSV, or JSON chat files you already control.',
    access: 'Imported file contents you upload.',
    purpose: 'Normalize unstructured chats into the common message schema.',
  },
}
