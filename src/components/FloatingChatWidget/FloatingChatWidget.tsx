import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { Message, ChatWidgetProps } from './types'
import './FloatingChatWidget.css'

const FloatingChatWidget: React.FC<ChatWidgetProps> = ({ 
  title = "AI Assistant", 
  subtitle = "We're here to help!",
  onSendMessage,
  className = "",
  position = "bottom-right",
  primaryColor = "#6366f1",
  iconSize = 60,
  theme = "modern"
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      content: '👋 Hi there! How can I help you today?',
      timestamp: new Date(),
      isWelcome: true
    }
  ])
  const [inputValue, setInputValue] = useState<string>('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [messageIdCounter, setMessageIdCounter] = useState<number>(2)
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false)
  const [isMinimizing, setIsMinimizing] = useState<boolean>(false)

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Position styles
  const getPositionStyles = useCallback((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    }

    switch (position) {
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' }
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' }
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' }
      default:
        return { ...baseStyles, bottom: '20px', right: '20px' }
    }
  }, [position])

  // Auto-resize textarea
  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [])

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Handle file selection
  const handleFileSelection = useCallback((files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => 
      !attachedFiles.some(f => f.name === file.name && f.size === file.size)
    )
    setAttachedFiles(prev => [...prev, ...newFiles])
  }, [attachedFiles])

  // Remove file
  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Generate bot response
  const generateBotResponse = useCallback((_userMessage: string): string => {
    const responses = [
      "Thanks for your message! I'd be happy to help you with that.",
      "I understand what you're asking. Let me provide you with some information.",
      "Great question! Here's what I can tell you about that.",
      "I'm here to help! Based on your message, I can suggest a few things.",
      "That's an interesting point. Let me break that down for you."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }, [])

  // Send message
  const sendMessage = useCallback(async () => {

    debugger;
    const message = inputValue.trim()
    if (!message && attachedFiles.length === 0) return

    debugger;
    const newUserMessage: Message = {
      id: messageIdCounter,
      sender: 'user',
      content: message,
      files: attachedFiles.length > 0 ? [...attachedFiles] : null,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setMessageIdCounter(prev => prev + 1)
    setInputValue('')
    setAttachedFiles([])

    if (onSendMessage) {
      onSendMessage(newUserMessage)
    }

    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botResponse: Message = {
        id: messageIdCounter + 1,
        sender: 'bot',
        content: generateBotResponse(message),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setMessageIdCounter(prev => prev + 2)
      
      if (!isOpen) {
        setHasNewMessage(true)
      }
    }, 1000 + Math.random() * 2000)
  }, [inputValue, attachedFiles, messageIdCounter, onSendMessage, generateBotResponse, isOpen])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    autoResizeTextarea()
  }, [autoResizeTextarea])

  // Toggle chat
  const toggleChat = useCallback(() => {
    if (isOpen) {
      setIsMinimizing(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsMinimizing(false)
      }, 200)
    } else {
      setIsOpen(true)
      setHasNewMessage(false)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 300)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node) && isOpen) {
        toggleChat()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, toggleChat])

  // Effects
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    autoResizeTextarea()
  }, [inputValue, autoResizeTextarea])

  // Set CSS custom properties
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.style.setProperty('--primary-color', primaryColor)
      widgetRef.current.style.setProperty('--icon-size', `${iconSize}px`)
    }
  }, [primaryColor, iconSize])

  const canSend = inputValue.trim() || attachedFiles.length > 0

  return (
    <div 
      ref={widgetRef}
      className={`chat-widget chat-widget--${theme} ${className}`} 
      style={getPositionStyles()}
    >
      {/* Chat Icon */}
      <button 
        className={`chat-widget__icon ${isMinimizing ? 'chat-widget__icon--closing' : ''}`}
        onClick={toggleChat}
        title={isOpen ? 'Close chat' : 'Open chat'}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
        {hasNewMessage && !isOpen && (
          <div className="chat-widget__notification-badge">!</div>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className={`chat-widget__popup ${isMinimizing ? 'chat-widget__popup--minimizing' : ''}`}>
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-content">
              <div className="chat-widget__title">{title}</div>
              <div className="chat-widget__subtitle">{subtitle}</div>
            </div>
            <button 
              className="chat-widget__close-button" 
              onClick={toggleChat} 
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          
          {/* Messages */}
          <div className="chat-widget__messages" ref={chatMessagesRef}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-widget__message chat-widget__message--${message.sender}`}>
                <div className="chat-widget__message-avatar">
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className="chat-widget__message-content">
                  {message.content}
                  {message.files && message.files.map((file, index) => (
                    <div key={index} className="chat-widget__file-attachment">
                      <span className="chat-widget__file-icon">📄</span>
                      <span>{file.name} ({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-widget__message chat-widget__message--bot">
                <div className="chat-widget__message-avatar">AI</div>
                <div className="chat-widget__message-content">
                  <div className="chat-widget__typing-indicator">
                    <div className="chat-widget__typing-dot"></div>
                    <div className="chat-widget__typing-dot"></div>
                    <div className="chat-widget__typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Container */}
          <div className="chat-widget__input-container">
            {attachedFiles.length > 0 && (
              <div className="chat-widget__attached-files">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="chat-widget__attached-file">
                    <span className="chat-widget__file-icon">📄</span>
                    <span>{file.name}</span>
                    <button 
                      className="chat-widget__remove-file" 
                      onClick={() => removeFile(index)}
                      title="Remove file"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="chat-widget__input-wrapper">
              <textarea 
                ref={textareaRef}
                className="chat-widget__input" 
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              <div className="chat-widget__input-actions">
                <button 
                  className="chat-widget__file-button" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  type="button"
                >
                  📎
                </button>
                <button 
                  className="chat-widget__send-button" 
                  onClick={sendMessage}
                  disabled={!canSend}
                  title="Send message"
                  type="button"
                >
                  ➤
                </button>
              </div>
            </div>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="chat-widget__file-input" 
              multiple 
              accept="*/*"
              onChange={(e) => handleFileSelection(e.target.files)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingChatWidget