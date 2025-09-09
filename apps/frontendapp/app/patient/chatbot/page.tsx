'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, AlertCircle, Clock } from 'lucide-react'
import { useRateLimit } from '../../hooks/useRateLimit'
import { handleApiError, ApiError } from '../../utils/errorHandler'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Rate limiting: 10 requests per 5 minutes
  const { isRateLimited, addRequest, getTimeUntilReset } = useRateLimit({
    maxRequests: 10,
    windowMs: 5 * 60 * 1000
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('patient_chatbot_messages')
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(parsedMessages)
    } else {
      // Set initial message if no saved messages
      const initialMessage = {
        id: '1',
        type: 'bot' as const,
        content: 'Hello! I\'m your HealthBridge AI assistant. How can I help you today?',
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Save messages to localStorage whenever messages change
    if (messages.length > 0) {
      localStorage.setItem('patient_chatbot_messages', JSON.stringify(messages))
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Check rate limiting
    if (isRateLimited()) {
      const timeUntilReset = getTimeUntilReset()
      const minutes = Math.ceil(timeUntilReset / (60 * 1000))
      setError({
        type: 'rate_limit',
        message: `Rate limit exceeded. Please wait ${minutes} minute(s) before sending another message.`,
        retryable: true,
        retryAfter: timeUntilReset
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setError(null)
    addRequest()

    let response: Response | undefined
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = localStorage.getItem('userRole') || 'patient';
      const aiApiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'https://health-bridge-app-3.onrender.com';

      // First authenticate with AI service
      const authResponse = await fetch(`${aiApiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.email || 'anonymous@healthbridge.com',
          password: 'healthbridge2024', // Default password for AI service
          role: userRole
        })
      });

      if (!authResponse.ok) {
        throw new Error('AI service authentication failed');
      }

      const authData = await authResponse.json();
      const aiToken = authData.access_token;

      // Now make the chat request with AI service token
      response = await fetch(`${aiApiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiToken}`
        },
        body: JSON.stringify({
          message: inputValue,
          context: `You are a friendly healthcare AI assistant helping a ${userRole}. Respond in a conversational, easy-to-understand way. Keep responses concise (2-3 paragraphs max). Avoid clinical jargon and formatting like "Clinical Analysis" or "Evidence-Based Response". Just provide helpful, practical advice while reminding users to consult their healthcare provider for serious concerns.`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || data.message || 'I apologize, but I cannot process your request right now.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botResponse])
      
    } catch (err) {
      const apiError = handleApiError(err, response)
      setError(apiError)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: apiError.message,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full">
          <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">AI Assistant</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">Chat with your healthcare AI assistant</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`p-3 mb-4 rounded-lg flex items-center space-x-2 ${
            error.type === 'rate_limit' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
            error.type === 'auth' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error.type === 'rate_limit' ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{error.message}</span>
          </div>
        )}

        {/* Chat Container */}
        <div className="md:h-[70vh] bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col w-full max-w-full" style={{ height: 'calc(100vh - 160px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-3 sm:space-y-4 w-full">
            {messages.map((message) => (
              <div key={message.id} className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] sm:max-w-md rounded-lg p-3 sm:p-4 break-words overflow-wrap-anywhere ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 sm:mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start w-full">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4 max-w-[80%] sm:max-w-md">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                    <div className="flex space-x-1">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 w-full overflow-x-hidden">
            <div className="flex flex-wrap gap-1 sm:gap-2 w-full">
              <button
                onClick={() => setInputValue('What is my next appointment?')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                Next appointment
              </button>
              <button
                onClick={() => setInputValue('What medications am I taking?')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                My medications
              </button>
              <button
                onClick={() => setInputValue('Give me a wellness tip')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                Wellness tip
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-3 sm:p-6 sm:pt-3 border-t border-gray-200 dark:border-gray-700 w-full">
            <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-3 w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your health..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 text-sm sm:text-base min-w-0 w-0"
                style={{ '--tw-ring-color': '#38B7FF' } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping || isRateLimited()}
                className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                style={{ background: 'linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)' }}
                title={isRateLimited() ? `Rate limited. Wait ${Math.ceil(getTimeUntilReset() / (60 * 1000))} minutes` : ''}
              >
                <Send className="h-4 sm:h-5 w-4 sm:w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}