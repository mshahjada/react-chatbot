// constants.ts
// constants.ts
import type { ChatConfig, ErrorMessageType } from './types';

export const DEFAULT_CONFIG: ChatConfig = {
  title: "AI Assistant",
  subtitle: "We're here to help!",
  position: "bottom-right",
  primaryColor: "#6366f1",
  iconSize: 60,
  theme: "modern",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['*/*'],
  maxMessages: 100,
  welcomeMessage: "👋 Hi there! How can I help you today?"
};

export const FALLBACK_RESPONSES: string[] = [
  "Thanks for your message! I'd be happy to help you with that.",
  "I understand what you're asking. Let me provide you with some information.",
  "Great question! Here's what I can tell you about that.",
  "I'm here to help! Based on your message, I can suggest a few things.",
  "That's an interesting point. Let me break that down for you."
];

export const ERROR_MESSAGES: Record<ErrorMessageType, string> = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  EMPTY_RESPONSE: 'Sorry, I received an empty response from the server.',
  GENERAL_ERROR: 'Sorry, I encountered an error processing your message.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type is not allowed.'
} as const;

export const API_CONFIG = {
  baseURL: 'https://localhost:7166/api',
  endpoints: {
    chat: '/chat'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3
} as const;

export const ANIMATION_DURATIONS = {
  slideIn: 300,
  slideOut: 200,
  typing: 1000,
  bounce: 200
} as const;