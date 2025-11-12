import {
  ChatCanvas,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
  useChatUI,
  type ChatHandler,
  type Message,
} from "@llamaindex/chat-ui";

import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import "@llamaindex/chat-ui/styles/editor.css";
import { useState, useCallback, useEffect, useMemo } from "react";
import {API_BASE_URL, tokenService} from "@/shared/api/base";
import { Copy, Check, Send, Loader2, TriangleAlert } from "lucide-react";
import { ReportModal } from "@/features/report/modal/report-modal";
// import { useGetSessionInfoQuery } from "@/shared/api/queries/getSessionInfoQuery";
import { useGetSessionMessagesQuery } from "@/shared/api/queries/getSessionMessagesQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReportHallucinationMutation } from "@/shared/api/queries/reportHallucinationMutation";
import { Button } from "./ui/button";

export function ChatSection() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("id") || "";

  console.log("sessionId", sessionId);

  // const { data: session } = useGetSessionInfoQuery(sessionId || "");

  const { data: messages = [] } = useGetSessionMessagesQuery(sessionId || "");

  const initialMessages = useMemo(() => messages?.map((message) => ({
    id: `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    role: message.role,
    parts: [{ type: "text", text: message.content }],
  })), [messages]);

  const handler = useChat(initialMessages, sessionId || "");

  return (
    <ChatSectionUI
      handler={handler}
      className="block h-full flex-row gap-6 p-0 md:flex w-full"
    >
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <ChatMessages className="flex-1 overflow-hidden w-full h-full">
          <ChatMessages.List className="mx-auto w-full max-w-[80%] space-y-8 overflow-y-auto px-2 py-8 md:px-8 h-full max-h-[calc(100vh-270px)] overscroll-none">
            <CustomChatMessages />
          </ChatMessages.List>
          <ChatMessages.Loading>
            <TypingIndicator />
          </ChatMessages.Loading>
          <ChatMessages.Empty
            heading="💬 Готов к общению"
            subheading="Задайте любой вопрос, чтобы начать"
          />
        </ChatMessages>
        <div className="mx-auto max-w-4xl px-4 md:px-8 md:py-6 w-full">
          <ChatInput>
            <ChatInput.Form className="relative">
              <ChatInput.Field
                placeholder="Введите ваше сообщение..."
                className="min-h-[56px] w-full resize-none rounded-3xl border border-input bg-background px-6 py-4 pr-16 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <ChatInput.Submit className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                {handler.status === "streaming" ||
                  handler.status === "submitted" ? (
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
  );
}

function CustomChatMessages() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("id") || "";
  const { messages } = useChatUI();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  // Сообщение о галлюцинации
  const [reportedMessageId, setReportedMessageId] = useState<string>();
  const [reportDescription, setReportDescription] = useState<string>();
  const [reportedMessageResponse, setReportedMessageResponse] = useState<any>();

  const navigate = useNavigate();

  const handleCopy = async (message: Message) => {
    const textContent = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { text: string }).text)
      .join("");

    await navigator.clipboard.writeText(textContent);
    setCopiedId(message.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReportHallucination = async (message: Message) => {
    const textContent = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { text: string }).text)
      .join("");
    console.log("Report hallucination", textContent);
    setSelectedMessage(message);
    setReportModalOpen(true);
  };
  const { mutate: reportHallucination } = useReportHallucinationMutation({
    onSuccess: (data) => {
      setReportedMessageResponse(data);
      setReportModalOpen(false);
    },
  });

  const handleReportHallucinationSubmit = (_: Message, reason: string, sourceUrl: string) => {
    setReportedMessageId(_.id);
    setReportDescription(reason);
    reportHallucination({ sessionId: sessionId || "", report: { incorrect_fact: reason, source_url: sourceUrl } });
    setReportModalOpen(false);
  };


  return (
    <>
      {selectedMessage && reportModalOpen && (
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          message={selectedMessage}
          onSubmit={handleReportHallucinationSubmit}
        />
      )}
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
            {message.role === "assistant" && (
              <ChatMessage.Avatar className="shrink-0 self-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold">
                  AI
                </div>
              </ChatMessage.Avatar>
            )}

            <div className={`flex min-w-0 flex-1 flex-col gap-2 items-end `}>
              {message.role !== "assistant" && (
                <div className="rounded-xl px-4 py-2.5 w-full">
                  <ChatMessage.Content className="text-sm w-full">
                    <ChatMessage.Part.Markdown />
                  </ChatMessage.Content>
                </div>
              )}

              {message.role === "assistant" && (
                <>
                  <ChatMessage.Content className="ml-2 self-start prose prose-sm max-w-none text-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 rounded-2xl">
                    <ChatMessage.Part.File />
                    <ChatMessage.Part.Event />
                    <ChatMessage.Part.Markdown />
                    <ChatMessage.Part.Artifact />
                    <ChatMessage.Part.Source />
                    <ChatMessage.Part.Suggestion />
                  </ChatMessage.Content>

                  <div className="flex ml-2 self-start items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                      title="Сообщить о галлюцинации"
                      onClick={() => handleReportHallucination(message)}
                    >
                      <TriangleAlert className="h-3 w-3" />
                      Сообщить о галлюцинации
                    </button>
                    <button
                      onClick={() => handleCopy(message)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                      title="Копировать сообщение"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Копировать
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
              {
                reportedMessageId === message.id && <div>{reportDescription}
                  {reportedMessageResponse === undefined ? <Loader2 className="animate-spin"/> : 
                  <div>Ответ {!reportedMessageResponse?.is_valid && "не"} зачтен: {reportedMessageResponse?.reasoning}</div>}
                  <Button variant="secondary" onClick={() => navigate("/reports")}>Подробнее</Button></div>
              }
            </div>
          </ChatMessage>
        </div>
      ))}
      {/* {
        reportResponses.map((response) =>
          <div
            key={response.id || index}
            className="group animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <ChatMessage
              message={message}
              isLast={index === messages.length - 1}
              className="flex gap-3"
            ></ChatMessage>
          </div>)
      } */}
    </>
  );
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
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">ИИ размышляет...</span>
      </div>
    </div>
  );
}

function useChat(initialMessages: Message[], sessionId: string): ChatHandler {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState<
    "streaming" | "ready" | "error" | "submitted"
  >("ready");

  console.log("messages", messages, initialMessages, sessionId);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);


  const sendMessage = useCallback(
    async (message: Message) => {
      setStatus("submitted");

      try {
        // Add user message to state
        setMessages((prev) => [...prev, message]);

        // Extract text content from the new message
        const messageText = message.parts
          .filter((part) => part.type === "text")
          .map((part) => (part as { text: string }).text)
          .join("");

        // Create assistant message placeholder for streaming
        const assistantMessageId = `msg-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          parts: [{ type: "text", text: "" }],
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStatus("streaming");

        // Make SSE request to backend
        // API_BASE_URL already includes '/api', so we use '/chat/stream'
        const response = await fetch(`${API_BASE_URL}sessions/${sessionId}/message/stream?message=${messageText}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenService.getAccessToken()}`,
          },
        })

        // Используем ReadableStream для чтения потока
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = "";
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: false, value: null };

            if (done) {
              break;
            }

            // Декодируем chunk и добавляем в буфер
            buffer += decoder.decode(value || new Uint8Array(), { stream: true });

            // Обрабатываем все полные SSE сообщения из буфера
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Оставляем неполную строку в буфере

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim(); // Remove 'data: ' prefix

                // Check for completion signal
                if (data === "[DONE]") {
                  setStatus("ready");
                  return;
                }

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.content) {
                    streamedContent += parsed.content;

                    // Update the assistant message with streamed content
                    setMessages((prev) => {
                      return prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                            ...msg,
                            parts: [{ type: "text", text: streamedContent }],
                          }
                          : msg
                      );
                    });
                  } else if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (e) {
                  // Skip invalid JSON (might be partial chunk)
                  if (e instanceof SyntaxError) {
                    continue;
                  }
                  throw e;
                }
              }
            }
          }

          // Обрабатываем оставшийся буфер
          if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    streamedContent += parsed.content;
                    setMessages((prev) => {
                      return prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                            ...msg,
                            parts: [{ type: "text", text: streamedContent }],
                          }
                          : msg
                      );
                    });
                  }
                } catch {
                  // Ignore parsing errors for incomplete data
                }
              }
            }
          }

          setStatus("ready");
        } finally {
          reader?.releaseLock?.();
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setStatus("error");

        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `Ошибка: ${error instanceof Error
                ? error.message
                : "Не удалось отправить сообщение"
                }`,
            },
          ],
        };

        setMessages((prev) => {
          // Remove the placeholder assistant message and add error message
          const withoutPlaceholder = prev.slice(0, -1);
          return [...withoutPlaceholder, errorMessage];
        });

        // Reset status after a moment
        setTimeout(() => {
          setStatus("ready");
        }, 2000);
      }
    },
    [messages]
  );

  return {
    messages,
    status,
    sendMessage,
  };
}
