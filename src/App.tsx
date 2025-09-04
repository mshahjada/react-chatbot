import React, { useRef, useState } from 'react'
import FloatingChatWidget from './components/FloatingChatWidget/FloatingChatWidget'
import type { ApiResponse, Message } from './components/FloatingChatWidget/types'
import './App.css'
import { API_CONFIG } from './components/FloatingChatWidget/constants'

function App() {
  const [currentTheme, setCurrentTheme] = useState<'modern' | 'classic' | 'minimal' | 'dark'>('dark')
  const chatWidgetRef = useRef<{ addBotResponse: (content: string) => void }>(null)

  const handleSendMessage = async (message: Message): Promise<void> => {
    console.log('Message sent:', message)
    try {
      const response = await fetch('https://localhost:7166/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add CORS headers if needed
          // 'Access-Control-Allow-Origin': '*',
          // Add auth headers if needed
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify({ Query: message.content })
      })

      debugger;;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      if (data!=null) {
        // Add the bot response to the chat
        chatWidgetRef.current?.addBotResponse(data.response)
      } else {
        chatWidgetRef.current?.addBotResponse(
         'Sorry, I encountered an error processing your message.'
        )
      }
      
    } catch (error) {
      console.error('Error sending message to API:', error)
      
      // Handle network/connection errors
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again.'
      
      if (error instanceof TypeError) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.'
      } else if (error instanceof Error) {
        errorMessage = `Connection error: ${error.message}`
      }
      
      //chatWidgetRef.current?.addBotResponse(`❌ ${errorMessage}`)
    }

  }

  const handleApiResponse = (response: any) => {
    // Optional: Handle any additional processing of API responses
    console.log('Received API response:', response)
  }

  function handleOpenChat(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="app">
      <div className="demo-content">
        <h1 className="demo-title">🌟 Modular Chat Widget 🌟</h1>
        <p className="demo-subtitle">
          A production-ready chat widget built with TypeScript, modular architecture, and best practices
        </p>

        <div className="demo-features">
          <h3>🔧 Architecture Features</h3>
          <ul>
            <li><strong>Separated Concerns:</strong> Individual TypeScript files for types, constants, utilities, styles, and components</li>
            <li><strong>Type Safety:</strong> Comprehensive TypeScript interfaces and proper error handling</li>
            <li><strong>Performance:</strong> Debounced scrolling, memoized callbacks, and optimized re-renders</li>
            <li><strong>Accessibility:</strong> ARIA labels, keyboard navigation, screen reader support</li>
            <li><strong>Responsive Design:</strong> Mobile-friendly with adaptive layouts and touch support</li>
            <li><strong>API Integration:</strong> Timeout handling, retry logic, and proper error states</li>
            <li><strong>File Uploads:</strong> Drag & drop support with validation and preview</li>
            <li><strong>Customizable:</strong> Theming, positioning, colors, and behavior options</li>
          </ul>
        </div>

        <div className="demo-controls">
          <h3>🎮 Demo Controls</h3>
          <div className="demo-buttons">
            <button className="demo-button" onClick={handleOpenChat}>
              💬 Open Chat
            </button>
            <button className="demo-button" onClick={handleAddTestMessage}>
              🤖 Add Bot Message
            </button>
            <button className="demo-button" onClick={handleTriggerTyping}>
              ⌨️ Trigger Typing
            </button>
            <button className="demo-button" onClick={handleClearChat}>
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        <div className="api-status">
          <h4>📡 API Configuration</h4>
          <p>
            The widget is configured to connect to your API endpoint. 
            Update the API configuration in <code>constants.ts</code>:
          </p>
          <div className="api-endpoint">
            POST {API_CONFIG.baseURL}{API_CONFIG.endpoints.chat}
          </div>
          <p>
            Expected request format: <code>{'{ Query: string, Files?: FileInfo[] }'}</code><br/>
            Expected response format: <code>{'{ response: string, success?: boolean, error?: string }'}</code>
          </p>
        </div>
      </div>

      {/* Chat Widget with ref for API integration */}
      <FloatingChatWidget
        ref={chatWidgetRef}
        title="AI Assistant"
        subtitle="Powered by modular architecture"
        onSendMessage={handleSendMessage}
        position="bottom-right"
        primaryColor="#6366f1"
        iconSize={60}
        theme="modern"
        maxFileSize={10 * 1024 * 1024} // 10MB
        allowedFileTypes={['*/*']}
        maxMessages={100}
        welcomeMessage="👋 Hi! I'm your AI assistant. How can I help you today?"
      />
    </div>
  );
}

export default App