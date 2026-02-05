import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Info,
  Download,
  CloudUpload,
  Send,
  ExternalLink,
  Edit,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import AppDetailModal from '@/components/AppDetailModal'
import DeploySuccessModal from '@/components/DeploySuccessModal'
import { useUserStore } from '@/stores/userStore'
import {
  getAppVoById,
  deployApp as deployAppApi,
  deleteApp as deleteAppApi,
} from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenTypes'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
import { VisualEditor, type ElementInfo } from '@/utils/visualEditor'
import request from '@/request'
import aiAvatarImg from '@/assets/aiAvatar.png'

interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  createTime?: string
}

export default function AppChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loginUser } = useUserStore()

  // App info
  const [appInfo, setAppInfo] = useState<API.AppVO>()
  const appId = id

  // Chat related
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Chat history related
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [hasMoreHistory, setHasMoreHistory] = useState(false)
  const [lastCreateTime, setLastCreateTime] = useState<string>()

  // Preview related
  const [previewUrl, setPreviewUrl] = useState('')

  // Deploy related
  const [deploying, setDeploying] = useState(false)
  const [deployModalVisible, setDeployModalVisible] = useState(false)
  const [deployUrl, setDeployUrl] = useState('')

  // Download related
  const [downloading, setDownloading] = useState(false)

  // Visual editing related
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedElementInfo, setSelectedElementInfo] = useState<ElementInfo | null>(null)
  const visualEditorRef = useRef<VisualEditor | null>(null)

  // App detail modal
  const [appDetailVisible, setAppDetailVisible] = useState(false)

  // Permissions
  const isOwner = appInfo?.userId === loginUser.id
  const isAdmin = loginUser.userRole === 'admin'

  // Initialize visual editor
  useEffect(() => {
    visualEditorRef.current = new VisualEditor({
      onElementSelected: (elementInfo: ElementInfo) => {
        setSelectedElementInfo(elementInfo)
      },
    })

    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      visualEditorRef.current?.handleIframeMessage(event)
    }
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])

  // Update preview
  const updatePreview = useCallback(() => {
    if (appId && appInfo?.codeGenType) {
      const newPreviewUrl = getStaticPreviewUrl(
        appInfo.codeGenType || CodeGenTypeEnum.HTML,
        appId
      )
      setPreviewUrl(newPreviewUrl)
    }
  }, [appId, appInfo?.codeGenType])

  // Load chat history
  const loadChatHistory = useCallback(
    async (isLoadMore = false) => {
      if (!appId || loadingHistory) return
      setLoadingHistory(true)

      try {
        const params: API.listAppChatHistoryParams = {
          appId: Number(appId),
          pageSize: 10,
        }
        if (isLoadMore && lastCreateTime) {
          params.lastCreateTime = lastCreateTime
        }

        const res = await listAppChatHistory(params)
        if (res.data.code === 0 && res.data.data) {
          const chatHistories = res.data.data.records || []
          if (chatHistories.length > 0) {
            const historyMessages: Message[] = chatHistories
              .map((chat) => ({
                type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: chat.message || '',
                createTime: chat.createTime,
              }))
              .reverse()

            if (isLoadMore) {
              setMessages((prev) => [...historyMessages, ...prev])
            } else {
              setMessages(historyMessages)
            }
            setLastCreateTime(chatHistories[chatHistories.length - 1]?.createTime)
            setHasMoreHistory(chatHistories.length === 10)
          } else {
            setHasMoreHistory(false)
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        toast.error('Failed to load chat history')
      } finally {
        setLoadingHistory(false)
      }
    },
    [appId, loadingHistory, lastCreateTime]
  )

  // Generate code - use EventSource for streaming
  const generateCode = useCallback(
    async (userMessage: string, aiMessageIndex: number) => {
      let streamCompleted = false

      try {
        const baseURL = request.defaults.baseURL || API_BASE_URL
        const params = new URLSearchParams({
          appId: appId || '',
          message: userMessage,
        })

        const url = `${baseURL}/app/chat/gen/code?${params}`
        const eventSource = new EventSource(url, { withCredentials: true })

        let fullContent = ''

        eventSource.onmessage = (event) => {
          if (streamCompleted) return

          try {
            const parsed = JSON.parse(event.data)
            const content = parsed.d

            if (content !== undefined && content !== null) {
              fullContent += content
              setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[aiMessageIndex] = {
                  ...newMessages[aiMessageIndex],
                  content: fullContent,
                  loading: false,
                }
                return newMessages
              })
              scrollToBottom()
            }
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        eventSource.addEventListener('done', () => {
          if (streamCompleted) return

          streamCompleted = true
          setIsGenerating(false)
          eventSource.close()

          // Delay update preview
          setTimeout(async () => {
            const res = await getAppVoById({ id: Number(appId) })
            if (res.data.code === 0 && res.data.data) {
              setAppInfo(res.data.data)
            }
            updatePreview()
          }, 1000)
        })

        eventSource.addEventListener('business-error', (event: MessageEvent) => {
          if (streamCompleted) return

          try {
            const errorData = JSON.parse(event.data)
            const errorMessage = errorData.message || 'Error occurred during generation'
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content: `❌ ${errorMessage}`,
                loading: false,
              }
              return newMessages
            })
            toast.error(errorMessage)

            streamCompleted = true
            setIsGenerating(false)
            eventSource.close()
          } catch (parseError) {
            console.error('Failed to parse error event:', parseError)
          }
        })

        eventSource.onerror = () => {
          if (streamCompleted || !isGenerating) return

          if (eventSource.readyState === EventSource.CONNECTING) {
            streamCompleted = true
            setIsGenerating(false)
            eventSource.close()

            setTimeout(async () => {
              const res = await getAppVoById({ id: Number(appId) })
              if (res.data.code === 0 && res.data.data) {
                setAppInfo(res.data.data)
              }
              updatePreview()
            }, 1000)
          } else {
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content: 'Sorry, an error occurred during generation. Please try again.',
                loading: false,
              }
              return newMessages
            })
            toast.error('Generation failed, please try again')
            setIsGenerating(false)
          }
        }
      } catch (error) {
        console.error('Failed to create EventSource:', error)
        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[aiMessageIndex] = {
            ...newMessages[aiMessageIndex],
            content: 'Sorry, an error occurred during generation. Please try again.',
            loading: false,
          }
          return newMessages
        })
        toast.error('Generation failed, please try again')
        setIsGenerating(false)
      }
    },
    [appId, isGenerating, scrollToBottom, updatePreview]
  )

  // Fetch app info
  const fetchAppInfo = useCallback(async () => {
    if (!appId) {
      toast.error('App ID does not exist')
      navigate('/')
      return
    }

    try {
      const res = await getAppVoById({ id: Number(appId) })
      if (res.data.code === 0 && res.data.data) {
        setAppInfo(res.data.data)
        return res.data.data
      } else {
        toast.error('Failed to get app info')
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to get app info:', error)
      toast.error('Failed to get app info')
      navigate('/')
    }
  }, [appId, navigate])

  // Initial load
  useEffect(() => {
    const initPage = async () => {
      const app = await fetchAppInfo()
      if (!app) return

      // Load chat history
      const params: API.listAppChatHistoryParams = {
        appId: Number(appId),
        pageSize: 10,
      }
      const historyRes = await listAppChatHistory(params)

      if (historyRes.data.code === 0 && historyRes.data.data) {
        const chatHistories = historyRes.data.data.records || []
        if (chatHistories.length > 0) {
          const historyMessages: Message[] = chatHistories
            .map((chat) => ({
              type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
              content: chat.message || '',
              createTime: chat.createTime,
            }))
            .reverse()

          setMessages(historyMessages)
          setLastCreateTime(chatHistories[chatHistories.length - 1]?.createTime)
          setHasMoreHistory(chatHistories.length === 10)

          // If there are messages, show preview
          if (historyMessages.length >= 2 && app.codeGenType) {
            setPreviewUrl(getStaticPreviewUrl(app.codeGenType, appId!))
          }
        }
      }

      // Check if need to auto send initial prompt
      const isUserOwner = app.userId === loginUser.id
      if (
        app.initPrompt &&
        isUserOwner &&
        (!historyRes.data.data?.records || historyRes.data.data.records.length === 0)
      ) {
        // Auto send initial message
        const newMessages = [
          { type: 'user' as const, content: app.initPrompt },
          { type: 'ai' as const, content: '', loading: true },
        ]
        setMessages(newMessages)

        setIsGenerating(true)
        const baseURL = request.defaults.baseURL || API_BASE_URL
        const params = new URLSearchParams({
          appId: appId || '',
          message: app.initPrompt,
        })

        const url = `${baseURL}/app/chat/gen/code?${params}`
        const eventSource = new EventSource(url, { withCredentials: true })
        let streamCompleted = false
        let fullContent = ''

        eventSource.onmessage = (event) => {
          if (streamCompleted) return
          try {
            const parsed = JSON.parse(event.data)
            const content = parsed.d
            if (content !== undefined && content !== null) {
              fullContent += content
              setMessages([
                { type: 'user', content: app.initPrompt! },
                { type: 'ai', content: fullContent, loading: false },
              ])
            }
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        eventSource.addEventListener('done', () => {
          if (streamCompleted) return
          streamCompleted = true
          setIsGenerating(false)
          eventSource.close()

          setTimeout(async () => {
            const res = await getAppVoById({ id: Number(appId) })
            if (res.data.code === 0 && res.data.data) {
              setAppInfo(res.data.data)
              if (res.data.data.codeGenType) {
                setPreviewUrl(getStaticPreviewUrl(res.data.data.codeGenType, appId!))
              }
            }
          }, 1000)
        })

        eventSource.onerror = () => {
          if (streamCompleted) return
          streamCompleted = true
          setIsGenerating(false)
          eventSource.close()
        }
      }
    }

    initPage()
  }, [appId, loginUser.id])

  // Send message
  const sendMessage = async () => {
    if (!userInput.trim() || isGenerating) return

    let message = userInput.trim()

    // If element is selected, add element info to prompt
    if (selectedElementInfo) {
      let elementContext = `\n\nSelected element info:`
      if (selectedElementInfo.pagePath) {
        elementContext += `\n- Page path: ${selectedElementInfo.pagePath}`
      }
      elementContext += `\n- Tag: ${selectedElementInfo.tagName.toLowerCase()}\n- Selector: ${selectedElementInfo.selector}`
      if (selectedElementInfo.textContent) {
        elementContext += `\n- Current content: ${selectedElementInfo.textContent.substring(0, 100)}`
      }
      message += elementContext
    }

    setUserInput('')

    const newMessages: Message[] = [
      ...messages,
      { type: 'user', content: message },
      { type: 'ai', content: '', loading: true },
    ]
    setMessages(newMessages)
    const aiMessageIndex = newMessages.length - 1

    // Clear selected element and exit edit mode
    if (selectedElementInfo) {
      clearSelectedElement()
      if (isEditMode) {
        toggleEditMode()
      }
    }

    setTimeout(scrollToBottom, 100)
    setIsGenerating(true)
    await generateCode(message, aiMessageIndex)
  }

  // Download code
  const downloadCode = async () => {
    if (!appId) {
      toast.error('App ID does not exist')
      return
    }

    setDownloading(true)
    try {
      const baseURL = request.defaults.baseURL || ''
      const url = `${baseURL}/app/download/${appId}`
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName =
        contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId}.zip`

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.click()

      URL.revokeObjectURL(downloadUrl)
      toast.success('Code downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed, please try again')
    } finally {
      setDownloading(false)
    }
  }

  // Deploy app
  const deployApp = async () => {
    if (!appId) {
      toast.error('App ID does not exist')
      return
    }

    setDeploying(true)
    try {
      const res = await deployAppApi({ appId: Number(appId) })

      if (res.data.code === 0 && res.data.data) {
        setDeployUrl(res.data.data)
        setDeployModalVisible(true)
        toast.success('Deploy successful')
      } else {
        toast.error('Deploy failed: ' + res.data.message)
      }
    } catch (error) {
      console.error('Deploy failed:', error)
      toast.error('Deploy failed, please try again')
    } finally {
      setDeploying(false)
    }
  }

  // Open preview in new tab
  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  // Open deployed site
  const openDeployedSite = () => {
    if (deployUrl) {
      window.open(deployUrl, '_blank')
    }
  }

  // iframe load handler
  const onIframeLoad = () => {
    const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
    if (iframe && visualEditorRef.current) {
      visualEditorRef.current.init(iframe)
      visualEditorRef.current.onIframeLoad()
    }
  }

  // Edit app
  const editApp = () => {
    if (appInfo?.id) {
      navigate(`/app/edit/${appInfo.id}`)
    }
  }

  // Delete app
  const deleteApp = async () => {
    if (!appInfo?.id) return

    try {
      const res = await deleteAppApi({ id: appInfo.id })
      if (res.data.code === 0) {
        toast.success('Delete successful')
        setAppDetailVisible(false)
        navigate('/')
      } else {
        toast.error('Delete failed: ' + res.data.message)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Delete failed')
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
    if (!iframe) {
      toast.warning('Please wait for page to load')
      return
    }

    if (!visualEditorRef.current) {
      toast.warning('Please wait for page to load')
      return
    }

    const newEditMode = visualEditorRef.current.toggleEditMode()
    setIsEditMode(newEditMode)
  }

  // Clear selected element
  const clearSelectedElement = () => {
    setSelectedElementInfo(null)
    visualEditorRef.current?.clearSelection()
  }

  // Get input placeholder
  const getInputPlaceholder = () => {
    if (selectedElementInfo) {
      return `Editing ${selectedElementInfo.tagName.toLowerCase()} element, describe the changes you want...`
    }
    return 'Describe the website you want to generate, the more detailed the better'
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col p-4 bg-gray-50">
      {/* Header bar */}
      <div className="flex justify-between items-center py-3 px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            {appInfo?.appName || 'Website Generator'}
          </h1>
          {appInfo?.codeGenType && (
            <Badge variant="secondary">{formatCodeGenType(appInfo.codeGenType)}</Badge>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAppDetailVisible(true)}>
            <Info className="w-4 h-4 mr-2" />
            App Details
          </Button>
          <Button
            variant="outline"
            onClick={downloadCode}
            disabled={!isOwner || downloading}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Code
          </Button>
          <Button onClick={deployApp} disabled={deploying}>
            {deploying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4 mr-2" />
            )}
            Deploy
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 p-2 overflow-hidden">
        {/* Left chat area */}
        <div className="flex-[2] flex flex-col bg-white rounded-lg shadow overflow-hidden">
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto scroll-smooth"
          >
            {/* Load more button */}
            {hasMoreHistory && (
              <div className="text-center pb-4">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => loadChatHistory(true)}
                  disabled={loadingHistory}
                >
                  {loadingHistory ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more history'
                  )}
                </Button>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className="mb-3">
                {message.type === 'user' ? (
                  <div className="flex justify-end items-start gap-2">
                    <div className="max-w-[70%] px-4 py-3 rounded-xl bg-blue-500 text-white leading-relaxed break-words">
                      {message.content}
                    </div>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={loginUser.userAvatar} />
                      <AvatarFallback>
                        {loginUser.userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={aiAvatarImg} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] px-3 py-2 rounded-xl bg-gray-100 text-gray-900">
                      {message.content ? (
                        <MarkdownRenderer content={message.content} />
                      ) : null}
                      {message.loading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected element info */}
          {selectedElementInfo && (
            <Alert className="mx-4 mb-2">
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        Selected: {selectedElementInfo.tagName.toLowerCase()}
                      </span>
                      {selectedElementInfo.id && (
                        <span className="text-green-600">#{selectedElementInfo.id}</span>
                      )}
                      {selectedElementInfo.className && (
                        <span className="text-yellow-600">
                          .{selectedElementInfo.className.split(' ').join('.')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedElementInfo.textContent && (
                        <div>
                          Content: {selectedElementInfo.textContent.substring(0, 50)}
                          {selectedElementInfo.textContent.length > 50 ? '...' : ''}
                        </div>
                      )}
                      {selectedElementInfo.pagePath && (
                        <div>Page path: {selectedElementInfo.pagePath}</div>
                      )}
                      <div>
                        Selector:{' '}
                        <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs text-red-600 border">
                          {selectedElementInfo.selector}
                        </code>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelectedElement}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Input area */}
          <div className="p-4 bg-white">
            <div className="relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={getInputPlaceholder()}
                        rows={4}
                        maxLength={1000}
                        disabled={isGenerating || !isOwner}
                        className="pr-12 resize-none"
                      />
                    </div>
                  </TooltipTrigger>
                  {!isOwner && (
                    <TooltipContent>
                      <p>Cannot chat in others' works</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <div className="absolute bottom-2 right-2">
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={isGenerating || !isOwner}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right preview area */}
        <div className="flex-[3] flex flex-col bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="text-base font-semibold">Generated Website Preview</h3>
            <div className="flex gap-2">
              {isOwner && previewUrl && (
                <Button
                  variant="link"
                  className={`h-auto p-0 ${isEditMode ? 'text-red-500' : ''}`}
                  onClick={toggleEditMode}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                </Button>
              )}
              {previewUrl && (
                <Button variant="link" className="h-auto p-0" onClick={openInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {!previewUrl && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-5xl mb-4">🌐</div>
                <p>Website preview will appear here after generation</p>
              </div>
            )}
            {isGenerating && !previewUrl && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p>Generating website...</p>
              </div>
            )}
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="preview-iframe w-full h-full border-none"
                onLoad={onIframeLoad}
              />
            )}
          </div>
        </div>
      </div>

      {/* App detail modal */}
      <AppDetailModal
        open={appDetailVisible}
        onOpenChange={setAppDetailVisible}
        app={appInfo}
        showActions={isOwner || isAdmin}
        onEdit={editApp}
        onDelete={deleteApp}
      />

      {/* Deploy success modal */}
      <DeploySuccessModal
        open={deployModalVisible}
        onOpenChange={setDeployModalVisible}
        deployUrl={deployUrl}
        onOpenSite={openDeployedSite}
      />
    </div>
  )
}
