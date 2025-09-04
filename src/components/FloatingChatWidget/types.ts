// types.ts
export interface Message {
  id: number;
  sender: 'user' | 'bot';
  content: string;
  files?: File[] | null;
  timestamp: Date;
  isWelcome?: boolean;
  isError?: boolean;
}

export interface ChatWidgetRef {
  addBotResponse: (content: string) => void;
  addErrorResponse: (errorMessage?: string) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

export interface ChatWidgetProps {
  title?: string;
  subtitle?: string;
  onSendMessage?: (message: Message) => Promise<void> | void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  iconSize?: number;
  theme?: 'modern' | 'minimal' | 'rounded';
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxMessages?: number;
  welcomeMessage?: string;
}

export interface ApiResponse {
  response: string;
  success?: boolean;
  error?: string;
}

export interface ChatConfig {
  title: string;
  subtitle: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  iconSize: number;
  theme: 'modern' | 'minimal' | 'rounded';
  maxFileSize: number;
  allowedFileTypes: string[];
  maxMessages: number;
  welcomeMessage: string;
}

export type ErrorMessageType = 
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'EMPTY_RESPONSE'
  | 'GENERAL_ERROR'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE';

export interface FileUploadError {
  type: ErrorMessageType;
  message: string;
}