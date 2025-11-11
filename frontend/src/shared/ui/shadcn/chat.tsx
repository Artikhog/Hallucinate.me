import {
  ChatCanvas,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
  useChatUI,
  type ChatHandler,
  type Message,
} from '@llamaindex/chat-ui'

import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useState, useCallback } from 'react'
import { API_BASE_URL } from '@/shared/api/base'
import { Copy, Check, Send, Loader2 } from 'lucide-react'

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Hello there! How can I help you today?',
      },
    ],
  },
]

export function ChatSection() {
  const handler = useChat()
  
  return (
    <ChatSectionUI
      handler={handler}
      className="block h-full flex-row gap-6 p-0 md:flex w-full"
    >
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <ChatMessages className="flex-1 overflow-hidden w-full h-[calc(100vh-100px)]">
          <ChatMessages.List className="mx-auto w-full max-w-[80%] space-y-8 overflow-y-auto px-2 py-8 md:px-8 h-full max-h-[calc(100vh-300px)]">
            <CustomChatMessages />
          </ChatMessages.List>
          <ChatMessages.Loading>
            <TypingIndicator />
          </ChatMessages.Loading>
          <ChatMessages.Empty
            heading="💬 Ready to Chat"
            subheading="Ask me anything to get started"
          />
        </ChatMessages>
          <div className="mx-auto max-w-4xl px-4 md:px-8 md:py-6 w-full">
            <ChatInput>
              <ChatInput.Form className="relative">
                <ChatInput.Field 
                  placeholder="Type your message here..."
                  className="min-h-[56px] w-full resize-none rounded-3xl border border-input bg-background px-6 py-4 pr-16 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <ChatInput.Submit className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  {handler.status === 'streaming' || handler.status === 'submitted' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </ChatInput.Submit>
              </ChatInput.Form>
            </ChatInput>
          </div>
        </div>
      <ChatCanvas className="w-full md:w-2/5" />
    </ChatSectionUI>
  )
}

function CustomChatMessages() {
  const { messages } = useChatUI()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (message: Message) => {
    const textContent = message.parts
      .filter(part => part.type === 'text')
      .map(part => (part as { text: string }).text)
      .join('')
    
    await navigator.clipboard.writeText(textContent)
    setCopiedId(message.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className="group animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <ChatMessage
            message={message}
            isLast={index === messages.length - 1}
            className="flex gap-3"
          >
            {message.role === 'assistant' && (
              <ChatMessage.Avatar className="shrink-0 self-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold">
                  AI
                </div>
              </ChatMessage.Avatar>
            )}
            
            <div className={`flex min-w-0 flex-1 flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              {message.role === 'user' && (
                <div className="rounded-2xl px-4 py-2.5">
                  <ChatMessage.Content className="text-sm">
                    <ChatMessage.Part.Markdown />
                  </ChatMessage.Content>
                </div>
              )}
              
              {message.role === 'assistant' && (
                <>
                  <ChatMessage.Content className="prose prose-sm max-w-none text-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ChatMessage.Part.File />
                    <ChatMessage.Part.Event />
                    <ChatMessage.Part.Markdown />
                    <ChatMessage.Part.Artifact />
                    <ChatMessage.Part.Source />
                    <ChatMessage.Part.Suggestion />
                  </ChatMessage.Content>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleCopy(message)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {message.role === 'user' && (
              <ChatMessage.Avatar className="shrink-0 self-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  U
                </div>
              </ChatMessage.Avatar>
            )}
          </ChatMessage>
        </div>
      ))}
    </>
  )
}

function TypingIndicator() {
  return (
    <div className="mx-auto flex max-w-4xl items-start gap-3 px-4 py-4 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
        AI
      </div>
      <div className="flex items-center gap-2 py-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  )
}

interface BackendChatMessage {
  role: string
  content: string
}

function useChat(): ChatHandler {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [status, setStatus] = useState<
    'streaming' | 'ready' | 'error' | 'submitted'
  >('ready')

  // Convert frontend Message format to backend ChatMessage format
  const convertToBackendMessage = (message: Message): BackendChatMessage => {
    // Extract text content from message parts
    const textContent = message.parts
      .filter(part => part.type === 'text')
      .map(part => (part as { text: string }).text)
      .join('')
    
    return {
      role: message.role,
      content: textContent,
    }
  }

  const sendMessage = useCallback(async (message: Message) => {
    setStatus('submitted')
    
    try {
      // Add user message to state
      setMessages(prev => [...prev, message])

      // Convert message history to backend format (excluding the initial welcome message)
      const historyMessages = messages.filter(msg => msg.id !== '1')
      const history: BackendChatMessage[] = historyMessages
        .map(convertToBackendMessage)
      
      // Extract text content from the new message
      const messageText = message.parts
        .filter(part => part.type === 'text')
        .map(part => (part as { text: string }).text)
        .join('')

      // Create assistant message placeholder for streaming
      const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setStatus('streaming')

      // Prepare request body
      const requestBody = {
        history,
        message: messageText,
        temperature: 0.7,
      }

      // Make SSE request to backend
      // API_BASE_URL already includes '/api', so we use '/chat/stream'
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is not readable')
      }

      // Используем ReadableStream для чтения потока
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ''
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }

          // Декодируем chunk и добавляем в буфер
          buffer += decoder.decode(value, { stream: true })
          
          // Обрабатываем все полные SSE сообщения из буфера
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Оставляем неполную строку в буфере

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim() // Remove 'data: ' prefix
              
              // Check for completion signal
              if (data === '[DONE]') {
                setStatus('ready')
                return
              }

              try {
                const parsed = JSON.parse(data)
                
                if (parsed.content) {
                  streamedContent += parsed.content
                  
                  // Update the assistant message with streamed content
                  setMessages(prev => {
                    return prev.map(msg => 
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            parts: [{ type: 'text', text: streamedContent }],
                          }
                        : msg
                    )
                  })
                } else if (parsed.error) {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                // Skip invalid JSON (might be partial chunk)
                if (e instanceof SyntaxError) {
                  continue
                }
                throw e
              }
            }
          }
        }

        // Обрабатываем оставшийся буфер
        if (buffer.trim()) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                break
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  streamedContent += parsed.content
                  setMessages(prev => {
                    return prev.map(msg => 
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            parts: [{ type: 'text', text: streamedContent }],
                          }
                        : msg
                    )
                  })
                }
              } catch {
                // Ignore parsing errors for incomplete data
              }
            }
          }
        }

        setStatus('ready')
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setStatus('error')
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
          },
        ],
      }
      
      setMessages(prev => {
        // Remove the placeholder assistant message and add error message
        const withoutPlaceholder = prev.slice(0, -1)
        return [...withoutPlaceholder, errorMessage]
      })
      
      // Reset status after a moment
      setTimeout(() => {
        setStatus('ready')
      }, 2000)
    }
  }, [messages])

  return {
    messages,
    status,
    sendMessage,
  }
}
