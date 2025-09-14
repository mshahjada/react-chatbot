export interface Message {
  id: number
  sender: 'user' | 'bot'
  content: string
  files?: File[] | null
  timestamp: Date
  isWelcome?: boolean
}

export interface ApiResponse {
  response: string,
  source: string,
  queryStage: QueryStage
  processedAt?: Date
}

interface QueryStage {
  type: string
  stage: string
}


export type ChatWidgetRef = {
  addBotResponse: (content: string) => void
  enableAttachment: boolean
}
export interface ChatWidgetProps {
  title?: string
  subtitle?: string
  onSendMessage?: (message: Message) => void,
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  primaryColor?: string
  iconSize?: number
  theme?: 'modern' | 'classic' | 'minimal' | 'dark'
}

export type Theme = 'modern' | 'classic' | 'minimal' | 'dark'
export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
