import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useImperativeHandle, 
  forwardRef 
} from 'react';
import type {
  Message,
  ChatWidgetRef,
  ChatWidgetProps
} from './types';
import { 
  DEFAULT_CONFIG, 
  ERROR_MESSAGES, 
  ANIMATION_DURATIONS 
} from './constants';
import { 
  formatFileSize, 
  getRandomResponse, 
  validateFile, 
  debounce, 
  generateId, 
  sanitizeInput, 
  getPositionStyles 
} from './utils';
import './ChatWidget.css';

const FloatingChatWidget = forwardRef<ChatWidgetRef, ChatWidgetProps>(({
  title = DEFAULT_CONFIG.title,
  subtitle = DEFAULT_CONFIG.subtitle,
  onSendMessage,
  className = "",
  position = DEFAULT_CONFIG.position,
  primaryColor = DEFAULT_CONFIG.primaryColor,
  iconSize = DEFAULT_CONFIG.iconSize,
  theme = DEFAULT_CONFIG.theme,
  maxFileSize = DEFAULT_CONFIG.maxFileSize,
  allowedFileTypes = DEFAULT_CONFIG.allowedFileTypes,
  maxMessages = DEFAULT_CONFIG.maxMessages,
  welcomeMessage = DEFAULT_CONFIG.welcomeMessage
}, ref) => {

  // ==================== STATE MANAGEMENT ====================
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messageIdCounter, setMessageIdCounter] = useState<number>(2);
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
  const [isMinimizing, setIsMinimizing] = useState<boolean>(false);

  // ==================== REFS ====================
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // ==================== UTILITY FUNCTIONS ====================
  
  const autoResizeTextarea = useCallback((): void => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, []);

  const scrollToBottom = useCallback((): void => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, []);

  const debouncedScrollToBottom = useCallback(
    debounce(scrollToBottom, 100),
    [scrollToBottom]
  );

  // ==================== FILE HANDLING ====================
  
  const handleFileSelection = useCallback((files: FileList | null): void => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      // Check if file already exists
      if (attachedFiles.some(f => f.name === file.name && f.size === file.size)) {
        errors.push(`${file.name} is already attached`);
        return;
      }
      
      // Validate file
      if (!validateFile(file, maxFileSize, allowedFileTypes)) {
        if (file.size > maxFileSize) {
          errors.push(`${file.name} exceeds size limit (${formatFileSize(maxFileSize)})`);
        } else {
          errors.push(`${file.name} is not an allowed file type`);
        }
        return;
      }
      
      validFiles.push(file);
    });
    
    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
    
    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
      // You could show these errors in the UI if needed
    }
  }, [attachedFiles, maxFileSize, allowedFileTypes]);

  const removeFile = useCallback((index: number): void => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ==================== CHAT ACTIONS ====================
  
  const addBotResponse = useCallback((content: string): void => {
    setIsTyping(false);
    const botResponse: Message = {
      id: generateId(),
      sender: 'bot',
      content: sanitizeInput(content),
      timestamp: new Date()
    };
    
    setMessages(prev => {
      const newMessages = [...prev, botResponse];
      return newMessages.length > maxMessages ? newMessages.slice(-maxMessages) : newMessages;
    });
    
    if (!isOpen) {
      setHasNewMessage(true);
    }
  }, [isOpen, maxMessages]);

  const addErrorResponse = useCallback((errorMessage: string = ERROR_MESSAGES.GENERAL_ERROR): void => {
    setIsTyping(false);
    const errorResponse: Message = {
      id: generateId(),
      sender: 'bot',
      content: errorMessage,
      timestamp: new Date(),
      isError: true
    };
    
    setMessages(prev => {
      const newMessages = [...prev, errorResponse];
      return newMessages.length > maxMessages ? newMessages.slice(-maxMessages) : newMessages;
    });
    
    if (!isOpen) {
      setHasNewMessage(true);
    }
  }, [isOpen, maxMessages]);

  const clearChat = useCallback((): void => {
    setMessages([{
      id: 1,
      sender: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      isWelcome: true
    }]);
    setMessageIdCounter(2);
  }, [welcomeMessage]);

  const openChat = useCallback((): void => {
    setIsOpen(true);
    setHasNewMessage(false);
    setTimeout(() => textareaRef.current?.focus(), ANIMATION_DURATIONS.slideIn);
  }, []);

  const closeChat = useCallback((): void => {
    setIsMinimizing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimizing(false);
    }, ANIMATION_DURATIONS.slideOut);
  }, []);

  const toggleChat = useCallback((): void => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  // ==================== MESSAGE SENDING ====================
  
  const sendMessage = useCallback(async (): Promise<void> => {
    const message = sanitizeInput(inputValue);
    if (!message && attachedFiles.length === 0) return;

    const newUserMessage: Message = {
      id: generateId(),
      sender: 'user',
      content: message,
      files: attachedFiles.length > 0 ? [...attachedFiles] : null,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => {
      const newMessages = [...prev, newUserMessage];
      return newMessages.length > maxMessages ? newMessages.slice(-maxMessages) : newMessages;
    });
    
    setInputValue('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Handle API call or fallback
    if (onSendMessage) {
      try {
        await onSendMessage(newUserMessage);
      } catch (error) {
        console.error('Error in onSendMessage:', error);
        addErrorResponse();
      }
    } else {
      // Fallback: simulate bot response
      setTimeout(() => {
        addBotResponse(getRandomResponse());
      }, ANIMATION_DURATIONS.typing + Math.random() * 2000);
    }
  }, [inputValue, attachedFiles, maxMessages, onSendMessage, addBotResponse, addErrorResponse]);

  // ==================== EVENT HANDLERS ====================
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(e.target.value);
    autoResizeTextarea();
  }, [autoResizeTextarea]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFileSelection(e.target.files);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [handleFileSelection]);

  // ==================== REF METHODS ====================
  
  useImperativeHandle(ref, (): ChatWidgetRef => ({
    addBotResponse,
    addErrorResponse,
    setTyping: setIsTyping,
    clearChat,
    openChat,
    closeChat
  }), [addBotResponse, addErrorResponse, clearChat, openChat, closeChat]);

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node) && isOpen) {
        closeChat();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeChat]);

  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, isTyping, debouncedScrollToBottom]);

  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue, autoResizeTextarea]);

  // Set CSS custom properties
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.style.setProperty('--primary-color', primaryColor);
      widgetRef.current.style.setProperty('--icon-size', `${iconSize}px`);
    }
  }, [primaryColor, iconSize]);

  // ==================== COMPUTED VALUES ====================
  
  const canSend: boolean = Boolean(sanitizeInput(inputValue)) || attachedFiles.length > 0;
  const positionStyles = getPositionStyles(position);

  // ==================== RENDER ====================
  
  return (
    <div 
      ref={widgetRef}
      className={`chat-widget chat-widget--${theme} ${className}`} 
      style={positionStyles}
    >
      {/* Chat Icon */}
      <button 
        className={`chat-widget__icon ${isMinimizing ? 'chat-widget__icon--closing' : ''}`}
        onClick={toggleChat}
        title={isOpen ? 'Close chat' : 'Open chat'}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '💬'}
        {hasNewMessage && !isOpen && (
          <div className="chat-widget__notification-badge" aria-label="New message">!</div>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div 
          className={`chat-widget__popup ${isMinimizing ? 'chat-widget__popup--minimizing' : ''}`}
          role="dialog"
          aria-labelledby="chat-title"
          aria-describedby="chat-subtitle"
        >
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-content">
              <div id="chat-title" className="chat-widget__title">{title}</div>
              <div id="chat-subtitle" className="chat-widget__subtitle">{subtitle}</div>
            </div>
            <button 
              className="chat-widget__close-button" 
              onClick={closeChat} 
              aria-label="Close chat"
              title="Close chat"
            >
              ✕
            </button>
          </div>
          
          {/* Messages */}
          <div 
            className="chat-widget__messages" 
            ref={chatMessagesRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`chat-widget__message chat-widget__message--${message.sender} ${message.isError ? 'error' : ''}`}
              >
                <div className="chat-widget__message-avatar" aria-hidden="true">
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className="chat-widget__message-content">
                  {message.content}
                  {message.files && message.files.map((file, index) => (
                    <div key={index} className="chat-widget__file-attachment">
                      <span className="chat-widget__file-icon" aria-hidden="true">📄</span>
                      <span>{file.name} ({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-widget__message chat-widget__message--bot">
                <div className="chat-widget__message-avatar" aria-hidden="true">AI</div>
                <div className="chat-widget__message-content">
                  <div className="chat-widget__typing-indicator" aria-label="AI is typing">
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
                    <span className="chat-widget__file-icon" aria-hidden="true">📄</span>
                    <span className="chat-widget__attached-file-name" title={file.name}>
                      {file.name}
                    </span>
                    <button 
                      className="chat-widget__remove-file" 
                      onClick={() => removeFile(index)}
                      title={`Remove ${file.name}`}
                      aria-label={`Remove ${file.name}`}
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
                aria-label="Message input"
                disabled={isTyping}
              />
              <div className="chat-widget__input-actions">
                <button 
                  className="chat-widget__file-button" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  aria-label="Attach file"
                  type="button"
                  disabled={isTyping}
                >
                  📎
                </button>
                <button 
                  className="chat-widget__send-button" 
                  onClick={sendMessage}
                  disabled={!canSend || isTyping}
                  title="Send message"
                  aria-label="Send message"
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
              accept={allowedFileTypes.join(',')}
              onChange={handleFileInputChange}
              aria-label="File upload"
            />
          </div>
        </div>
      )}
    </div>
  );
});

// Set display name for better debugging
FloatingChatWidget.displayName = 'FloatingChatWidget';

export default FloatingChatWidget;