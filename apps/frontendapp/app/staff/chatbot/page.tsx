'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function StaffChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('staff_chatbot_messages')
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
        content: 'Hello! I\'m your HealthBridge AI assistant. I can help with patient management, scheduling, and operational questions.',
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
      localStorage.setItem('staff_chatbot_messages', JSON.stringify(messages))
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I\'m here to help with administrative and operational tasks.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="flex items-center space-x-2 sm:space-x-3 w-full">
          <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">AI Assistant</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">Chat with your administrative AI assistant</p>
          </div>
        </div>

        <div className="md:h-[70vh] bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col w-full max-w-full" style={{ height: 'calc(100vh - 160px)' }}>
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

          <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 w-full overflow-x-hidden">
            <div className="flex flex-wrap gap-1 sm:gap-2 w-full">
              <button
                onClick={() => setInputValue('Show appointment statistics for today')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                Today's stats
              </button>
              <button
                onClick={() => setInputValue('Help me manage the patient queue')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                Manage queue
              </button>
              <button
                onClick={() => setInputValue('Schedule a new appointment')}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
              >
                New appointment
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-6 sm:pt-3 border-t border-gray-200 dark:border-gray-700 w-full">
            <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-3 w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about scheduling, patient management, or operations..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 text-sm sm:text-base min-w-0 w-0"
                style={{ '--tw-ring-color': '#38B7FF' } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                style={{ background: 'linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)' }}
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