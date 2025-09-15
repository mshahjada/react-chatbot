export interface Message {
  id: number
  sender: 'user' | 'bot'
  content: string
  files?: File[] | null
  timestamp: Date
  isWelcome?: boolean
  userContext?: string // Optional: for user context
  showSegments?: boolean // Optional: for segment options rendering
  hasProducts?: boolean // Optional: indicates if product segments are available
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

export type ContextType = 'POLICY_INFO' | 'CLAIM_INFO' | 'CLAIM_SUBMISSION' | 'PRODUCT_INFO' | 'DEFAULT';

export const UserContext = {
  PolicyInfo: "POLICY_INFO",
  ClaimInfo: "CLAIM_INFO",
  SubmitClaim: "CLAIM_SUBMISSION",
  ProductInfo: "PRODUCT_INFO",
  Default: "DEFAULT",
} as const;

