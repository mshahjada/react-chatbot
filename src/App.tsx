import React, { useRef, useState } from 'react'
import FloatingChatWidget from './components/FloatingChatWidget/FloatingChatWidget'
import type { ApiResponse, Message } from './components/FloatingChatWidget/types'
import './App.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState<'modern' | 'classic' | 'minimal' | 'dark'>('dark')
  const chatWidgetRef = useRef<{ addBotResponse: (content: string) => void, enableAttachment: boolean }>({
  addBotResponse: () => {},
  enableAttachment: false
})


  const handleSendMessage = async (message: Message): Promise<void> => {
    console.log('Message sent:', message)
    
    try {
      const formData = new FormData()
      formData.append("query", message.content)

      // if you have multiple files
      message.files?.forEach(file => {
        formData.append("files", file) 
      })

      const response = await fetch("https://localhost:7166/api/chat", {
        method: "POST",
        headers: {
          'x-user-context': message.userContext || 'DEFAULT' // Default context if none provided
        },
        body: formData
      })


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json();
      if (data!=null) {
        chatWidgetRef.current?.addBotResponse(data.response);

        if(data.queryStage!=null && data.queryStage?.type === "CLAIM_SUBMISSION" && data.queryStage?.stage==="DocumentsRequired") {
          chatWidgetRef.current!.enableAttachment = true;
        }
        else{
           chatWidgetRef.current!.enableAttachment = false;
        }
      } else {
        chatWidgetRef.current?.addBotResponse(
         'Sorry, I encountered an error processing your message.'
        )
      }
      
    } catch (error) {
      console.error('Error sending message to API:', error)
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again.'
      
      if (error instanceof TypeError) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.'
      } else if (error instanceof Error) {
        errorMessage = `Connection error: ${error.message}`
      }
    }

  }

  const handleApiResponse = (response: any) => {
    // Optional: Handle any additional processing of API responses
    console.log('Received API response:', response)
  }

  return (
    <div className="app">
      {/* Your main website content */}
      <header className="app-header">
        <h1>🚀 My React + TypeScript Application</h1>
        <p>Professional chat widget with Vite, React, and TypeScript</p>
      </header>

      <main className="app-main">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Vite Powered</h3>
            <p>Lightning fast development with instant hot reload</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔷</div>
            <h3>TypeScript</h3>
            <p>Full type safety and excellent developer experience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Works perfectly on all devices and screen sizes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">♿</div>
            <h3>Accessible</h3>
            <p>Built with accessibility and keyboard navigation in mind</p>
          </div>
        </div>

        <div className="theme-showcase">
          <h2>Available Themes</h2>
          <div className="theme-buttons">
            <button onClick={() => setCurrentTheme('modern')}>Modern</button>
            <button onClick={() => setCurrentTheme('classic')}>Classic</button>
            <button onClick={() => setCurrentTheme('minimal')}>Minimal</button>
            <button onClick={() => setCurrentTheme('dark')}>Dark</button>
          </div>
          <p>Current theme: <strong>{currentTheme}</strong></p>
        </div>
      </main>

      {/* Chat Widget */}
      <FloatingChatWidget
        ref={chatWidgetRef} 
        title="Hello! I'm your smart assistant"
        subtitle="Ask me anything related to policy & claims!"
        onSendMessage={handleSendMessage}
        position="bottom-right"
        primaryColor="#6366f1"
        theme={currentTheme}
        iconSize={60}
      />
    </div>
  )
}

export default App