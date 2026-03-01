import {
  Bot,
  CloudUpload,
  Download,
  Edit,
  ExternalLink,
  Info,
  Loader2,
  Send,
  X,
} from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import request from "@/api/request";
import AppDetailModal from "@/components/app-detail-modal";
import DeploySuccessModal from "@/components/deploy-success-modal";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API_BASE_URL, getStaticPreviewUrl } from "@/config";
import {
  useDeleteAppMutation,
  useDeployAppMutation,
} from "@/hooks/mutations/use-app-mutations";
import { useAppVoById } from "@/hooks/queries/use-app-queries";
import { useUserStore } from "@/stores/user-store";
import type { BaseResponse, PageChatHistory } from "@/types";
import { CodegenTypeEnum, formatCodegenType } from "@/utils/codegen-types";
import { type ElementInfo, VisualEditor } from "@/utils/visual-editor";

interface Message {
  type: "user" | "ai";
  content: string;
  loading?: boolean;
  createTime?: string;
}

export default function AppChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loginUser } = useUserStore();

  // App info via react-query
  const appId = id;
  const numericAppId = id ? Number(id) : undefined;
  const { data: appInfo, refetch: refetchAppInfo } = useAppVoById(numericAppId);

  // Mutations
  const deployAppMutation = useDeployAppMutation();
  const deleteAppMutation = useDeleteAppMutation();

  // Chat related
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Chat history related
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [lastCreateTime, setLastCreateTime] = useState<string>();

  // Preview related
  const [previewUrl, setPreviewUrl] = useState("");

  // Deploy related
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");

  // Download related
  const [downloading, setDownloading] = useState(false);

  // Visual editing related
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] =
    useState<ElementInfo | null>(null);
  const visualEditorRef = useRef<VisualEditor | null>(null);

  // App detail modal
  const [appDetailVisible, setAppDetailVisible] = useState(false);

  // Permissions
  const isOwner = appInfo?.userId === loginUser.id;
  const isAdmin = loginUser.userRole === "admin";

  // Initialize visual editor
  useEffect(() => {
    visualEditorRef.current = new VisualEditor({
      onElementSelected: (elementInfo: ElementInfo) => {
        setSelectedElementInfo(elementInfo);
      },
    });

    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      visualEditorRef.current?.handleIframeMessage(event);
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Update preview
  const updatePreview = useCallback(() => {
    if (appId && appInfo?.codegenType) {
      const newPreviewUrl = getStaticPreviewUrl(
        appInfo.codegenType || CodegenTypeEnum.HTML,
        appId,
      );
      setPreviewUrl(newPreviewUrl);
    }
  }, [appId, appInfo?.codegenType]);

  // Load chat history
  const loadChatHistory = useCallback(
    async (isLoadMore = false) => {
      if (!appId || loadingHistory) return;
      setLoadingHistory(true);

      try {
        const queryParams: Record<string, string> = {
          pageSize: "10",
        };
        if (isLoadMore && lastCreateTime) {
          queryParams.lastCreateTime = lastCreateTime;
        }

        const res = await request<BaseResponse<PageChatHistory>>(
          `/chatHistory/app/${appId}`,
          { method: "GET", params: queryParams },
        );
        if (res.data.code === 0 && res.data.data) {
          const chatHistories = res.data.data.records || [];
          if (chatHistories.length > 0) {
            const historyMessages: Message[] = chatHistories
              .map((chat) => ({
                type: (chat.messageType === "user" ? "user" : "ai") as
                  | "user"
                  | "ai",
                content: chat.message || "",
                createTime: chat.createTime,
              }))
              .reverse();

            if (isLoadMore) {
              setMessages((prev) => [...historyMessages, ...prev]);
            } else {
              setMessages(historyMessages);
            }
            setLastCreateTime(
              chatHistories[chatHistories.length - 1]?.createTime,
            );
            setHasMoreHistory(chatHistories.length === 10);
          } else {
            setHasMoreHistory(false);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        toast.error("Failed to load chat history");
      } finally {
        setLoadingHistory(false);
      }
    },
    [appId, loadingHistory, lastCreateTime],
  );

  // Generate code - use EventSource for streaming
  const generateCode = useCallback(
    async (userMessage: string, aiMessageIndex: number) => {
      let streamCompleted = false;

      try {
        const baseURL = request.defaults.baseURL || API_BASE_URL;
        const params = new URLSearchParams({
          appId: appId || "",
          message: userMessage,
        });

        const url = `${baseURL}/app/chat/codegen?${params}`;
        const eventSource = new EventSource(url, { withCredentials: true });

        let fullContent = "";

        eventSource.onmessage = (event) => {
          if (streamCompleted) return;

          try {
            const parsed = JSON.parse(event.data);
            const content = parsed.d;

            if (content !== undefined && content !== null) {
              fullContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[aiMessageIndex] = {
                  ...newMessages[aiMessageIndex],
                  content: fullContent,
                  loading: false,
                };
                return newMessages;
              });
              scrollToBottom();
            }
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        };

        eventSource.addEventListener("done", () => {
          if (streamCompleted) return;

          streamCompleted = true;
          setIsGenerating(false);
          eventSource.close();

          // Delay update preview
          setTimeout(async () => {
            await refetchAppInfo();
            updatePreview();
          }, 1000);
        });

        eventSource.addEventListener(
          "business-error",
          (event: MessageEvent) => {
            if (streamCompleted) return;

            try {
              const errorData = JSON.parse(event.data);
              const errorMessage =
                errorData.message || "Error occurred during generation";
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[aiMessageIndex] = {
                  ...newMessages[aiMessageIndex],
                  content: errorMessage,
                  loading: false,
                };
                return newMessages;
              });
              toast.error(errorMessage);

              streamCompleted = true;
              setIsGenerating(false);
              eventSource.close();
            } catch (parseError) {
              console.error("Failed to parse error event:", parseError);
            }
          },
        );

        eventSource.onerror = () => {
          if (streamCompleted || !isGenerating) return;

          if (eventSource.readyState === EventSource.CONNECTING) {
            streamCompleted = true;
            setIsGenerating(false);
            eventSource.close();

            setTimeout(async () => {
              await refetchAppInfo();
              updatePreview();
            }, 1000);
          } else {
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[aiMessageIndex] = {
                ...newMessages[aiMessageIndex],
                content:
                  "Sorry, an error occurred during generation, please try again",
                loading: false,
              };
              return newMessages;
            });
            toast.error("Generation failed, please try again");
            setIsGenerating(false);
          }
        };
      } catch (error) {
        console.error("Failed to create EventSource:", error);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[aiMessageIndex] = {
            ...newMessages[aiMessageIndex],
            content:
              "Sorry, an error occurred during generation, please try again",
            loading: false,
          };
          return newMessages;
        });
        toast.error("Generation failed, please try again");
        setIsGenerating(false);
      }
    },
    [appId, isGenerating, scrollToBottom, updatePreview, refetchAppInfo],
  );

  // Initial load - triggered when appInfo is available from react-query
  useEffect(() => {
    if (!appId) {
      toast.error("App ID does not exist");
      navigate("/");
      return;
    }
    if (!appInfo) return;

    const initPage = async () => {
      const app = appInfo;

      // Load chat history
      const historyRes = await request<BaseResponse<PageChatHistory>>(
        `/chat-history/app/${appId}`,
        { method: "GET", params: { pageSize: "10" } },
      );

      if (historyRes.data.code === 0 && historyRes.data.data) {
        const chatHistories = historyRes.data.data.records || [];
        if (chatHistories.length > 0) {
          const historyMessages: Message[] = chatHistories
            .map((chat) => ({
              type: (chat.messageType === "user" ? "user" : "ai") as
                | "user"
                | "ai",
              content: chat.message || "",
              createTime: chat.createTime,
            }))
            .reverse();

          setMessages(historyMessages);
          setLastCreateTime(
            chatHistories[chatHistories.length - 1]?.createTime,
          );
          setHasMoreHistory(chatHistories.length === 10);

          // If there are messages, show preview
          if (historyMessages.length >= 2 && app.codegenType) {
            setPreviewUrl(getStaticPreviewUrl(app.codegenType, appId ?? ""));
          }
        }
      }

      // Check if need to auto send initial prompt
      const isUserOwner = app.userId === loginUser.id;
      if (
        app.initPrompt &&
        isUserOwner &&
        (!historyRes.data.data?.records ||
          historyRes.data.data.records.length === 0)
      ) {
        // Auto send initial message
        const newMessages = [
          { type: "user" as const, content: app.initPrompt },
          { type: "ai" as const, content: "", loading: true },
        ];
        setMessages(newMessages);

        setIsGenerating(true);
        const baseURL = request.defaults.baseURL || API_BASE_URL;
        const params = new URLSearchParams({
          appId: appId || "",
          message: app.initPrompt,
        });

        const url = `${baseURL}/app/chat/codegen?${params}`;
        const eventSource = new EventSource(url, { withCredentials: true });
        let streamCompleted = false;
        let fullContent = "";

        eventSource.onmessage = (event) => {
          if (streamCompleted) return;
          try {
            const parsed = JSON.parse(event.data);
            const content = parsed.d;
            if (content !== undefined && content !== null) {
              fullContent += content;
              setMessages([
                { type: "user", content: app.initPrompt ?? "" },
                {
                  type: "ai",
                  content: fullContent,
                  loading: false,
                },
              ]);
            }
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        };

        eventSource.addEventListener("done", () => {
          if (streamCompleted) return;
          streamCompleted = true;
          setIsGenerating(false);
          eventSource.close();

          setTimeout(async () => {
            await refetchAppInfo();
            if (app.codegenType) {
              setPreviewUrl(getStaticPreviewUrl(app.codegenType, appId ?? ""));
            }
          }, 1000);
        });

        eventSource.onerror = () => {
          if (streamCompleted) return;
          streamCompleted = true;
          setIsGenerating(false);
          eventSource.close();
        };
      }
    };

    initPage();
  }, [appId, appInfo, navigate, refetchAppInfo, loginUser.id]);

  // Send message
  const sendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    let message = userInput.trim();

    // If element is selected, add element info to prompt
    if (selectedElementInfo) {
      let elementContext = `\n\nSelected element info:`;
      if (selectedElementInfo.pagePath) {
        elementContext += `\n- Page path: ${selectedElementInfo.pagePath}`;
      }
      elementContext += `\n- Tag: ${selectedElementInfo.tagName.toLowerCase()}\n- Selector: ${selectedElementInfo.selector}`;
      if (selectedElementInfo.textContent) {
        elementContext += `\n- Current content: ${selectedElementInfo.textContent.substring(0, 100)}`;
      }
      message += elementContext;
    }

    setUserInput("");

    const newMessages: Message[] = [
      ...messages,
      { type: "user", content: message },
      { type: "ai", content: "", loading: true },
    ];
    setMessages(newMessages);
    const aiMessageIndex = newMessages.length - 1;

    // Clear selected element and exit edit mode
    if (selectedElementInfo) {
      clearSelectedElement();
      if (isEditMode) {
        toggleEditMode();
      }
    }

    setTimeout(scrollToBottom, 100);
    setIsGenerating(true);
    await generateCode(message, aiMessageIndex);
  };

  // Download code
  const downloadCode = async () => {
    if (!appId) {
      toast.error("App ID does not exist");
      return;
    }

    setDownloading(true);
    try {
      const baseURL = request.defaults.baseURL || "";
      const url = `${baseURL}/app/download/${appId}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const fileName =
        contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId}.zip`;

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(downloadUrl);
      toast.success("Code downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed, please try again");
    } finally {
      setDownloading(false);
    }
  };

  // Deploy app
  const deploying = deployAppMutation.isPending;
  const deployApp = () => {
    if (!appId) {
      toast.error("App ID does not exist");
      return;
    }

    deployAppMutation.mutate(
      { appId: Number(appId) },
      {
        onSuccess: (res) => {
          if (res.code === 0 && res.data) {
            setDeployUrl(res.data);
            setDeployModalVisible(true);
            toast.success("Deploy successful");
          } else {
            toast.error("Deploy failed: " + res.message);
          }
        },
        onError: () => {
          toast.error("Deploy failed, please try again");
        },
      },
    );
  };

  // Open preview in new tab
  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  // Open deployed site
  const openDeployedSite = () => {
    if (deployUrl) {
      window.open(deployUrl, "_blank");
    }
  };

  // iframe load handler
  const onIframeLoad = () => {
    const iframe = document.querySelector(
      ".preview-iframe",
    ) as HTMLIFrameElement;
    if (iframe && visualEditorRef.current) {
      visualEditorRef.current.init(iframe);
      visualEditorRef.current.onIframeLoad();
    }
  };

  // Edit app
  const editApp = () => {
    if (appInfo?.id) {
      navigate(`/app/edit/${appInfo.id}`);
    }
  };

  // Delete app
  const deleteApp = () => {
    if (!appInfo?.id) return;

    deleteAppMutation.mutate(
      { id: appInfo.id },
      {
        onSuccess: (res) => {
          if (res.code === 0) {
            toast.success("Delete successful");
            setAppDetailVisible(false);
            navigate("/");
          } else {
            toast.error("Delete failed: " + res.message);
          }
        },
        onError: () => {
          toast.error("Delete failed");
        },
      },
    );
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    const iframe = document.querySelector(
      ".preview-iframe",
    ) as HTMLIFrameElement;
    if (!iframe) {
      toast.warning("Please wait for page to load");
      return;
    }

    if (!visualEditorRef.current) {
      toast.warning("Please wait for page to load");
      return;
    }

    const newEditMode = visualEditorRef.current.toggleEditMode();
    setIsEditMode(newEditMode);
  };

  // Clear selected element
  const clearSelectedElement = () => {
    setSelectedElementInfo(null);
    visualEditorRef.current?.clearSelection();
  };

  // Get input placeholder
  const getInputPlaceholder = () => {
    if (selectedElementInfo) {
      return `Editing ${selectedElementInfo.tagName.toLowerCase()} element, describe the changes you want...`;
    }
    return "Describe the website you want to generate, the more detailed the better";
  };

  // Handle key down
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col bg-gray-50 p-4">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            {appInfo?.appName || "Website Generator"}
          </h1>
          {appInfo?.codegenType && (
            <Badge variant="secondary">
              {formatCodegenType(appInfo.codegenType)}
            </Badge>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAppDetailVisible(true)}>
            <Info className="mr-2 h-4 w-4" />
            App Details
          </Button>
          <Button
            variant="outline"
            onClick={downloadCode}
            disabled={!isOwner || downloading}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Code
          </Button>
          <Button onClick={deployApp} disabled={deploying}>
            {deploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="mr-2 h-4 w-4" />
            )}
            Deploy
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 gap-4 overflow-hidden p-2">
        {/* Left chat area */}
        <div className="flex flex-2 flex-col overflow-hidden rounded-lg bg-white shadow">
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth p-4"
          >
            {/* Load more button */}
            {hasMoreHistory && (
              <div className="pb-4 text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => loadChatHistory(true)}
                  disabled={loadingHistory}
                >
                  {loadingHistory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more history"
                  )}
                </Button>
              </div>
            )}

            {messages.map((message, idx) => (
              <div key={idx} className="mb-3">
                {message.type === "user" ? (
                  <div className="flex items-start justify-end gap-2">
                    <div className="max-w-[70%] rounded-xl bg-blue-500 px-4 py-3 leading-relaxed wrap-break-word text-white">
                      {message.content}
                    </div>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={loginUser.userAvatar} />
                      <AvatarFallback>
                        {loginUser.userName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] rounded-xl bg-gray-100 px-3 py-2 text-gray-900">
                      {message.content ? (
                        <MarkdownRenderer content={message.content} />
                      ) : null}
                      {message.loading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
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
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        Selected: {selectedElementInfo.tagName.toLowerCase()}
                      </span>
                      {selectedElementInfo.id && (
                        <span className="text-green-600">
                          #{selectedElementInfo.id}
                        </span>
                      )}
                      {selectedElementInfo.className && (
                        <span className="text-yellow-600">
                          .{selectedElementInfo.className.split(" ").join(".")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {selectedElementInfo.textContent && (
                        <div>
                          Content:{" "}
                          {selectedElementInfo.textContent.substring(0, 50)}
                          {selectedElementInfo.textContent.length > 50
                            ? "..."
                            : ""}
                        </div>
                      )}
                      {selectedElementInfo.pagePath && (
                        <div>Page path: {selectedElementInfo.pagePath}</div>
                      )}
                      <div>
                        Selector:{" "}
                        <code className="rounded border bg-gray-100 px-1 py-0.5 font-mono text-xs text-red-600">
                          {selectedElementInfo.selector}
                        </code>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSelectedElement}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Input area */}
          <div className="bg-white p-4">
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
                        className="resize-none pr-12"
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
              <div className="absolute right-2 bottom-2">
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={isGenerating || !isOwner}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right preview area */}
        <div className="flex flex-3 flex-col overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-base font-semibold">
              Generated Website Preview
            </h3>
            <div className="flex gap-2">
              {isOwner && previewUrl && (
                <Button
                  variant="link"
                  className={`h-auto p-0 ${isEditMode ? "text-red-500" : ""}`}
                  onClick={toggleEditMode}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {isEditMode ? "Exit Edit" : "Edit Mode"}
                </Button>
              )}
              {previewUrl && (
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {!previewUrl && !isGenerating && (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <div className="mb-4 text-5xl">🌐</div>
                <p>Website preview will appear here after generation</p>
              </div>
            )}
            {isGenerating && !previewUrl && (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <Loader2 className="mb-4 h-12 w-12 animate-spin" />
                <p>Generating website...</p>
              </div>
            )}
            {previewUrl && (
              <iframe
                src={previewUrl}
                title="Website Preview"
                className="preview-iframe h-full w-full border-none"
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
        app={appInfo ?? undefined}
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
  );
}
