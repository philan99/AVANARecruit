import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function getRole(): string | null {
  return localStorage.getItem("avanatalent_role");
}

function getCompanyId(): string | null {
  return localStorage.getItem("avanatalent_company_id");
}

function getCandidateId(): string | null {
  return localStorage.getItem("avanatalent_candidate_id");
}

function getGreeting(): string {
  const role = getRole();
  if (role === "company") {
    return "Hello! I'm AVANA, your recruitment assistant. I can help you with posting jobs, finding candidates, understanding match scores, and navigating the platform. How can I help?";
  }
  if (role === "candidate") {
    return "Hello! I'm AVANA, your job search assistant. I can help you with your profile, finding jobs, understanding match scores, and making the most of the platform. How can I help?";
  }
  return "Hello! I'm AVANA, your recruitment assistant. I can help you learn about our AI-powered job matching platform. Would you like to know how it works?";
}

function getSessionKey(): string {
  const role = getRole() || "anonymous";
  const companyId = getCompanyId() || "";
  const candidateId = getCandidateId() || "";
  return `${role}:${companyId}:${candidateId}`;
}

function MessageContent({ content, onNavigate }: { content: string; onNavigate: (path: string) => void }) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<{ type: "text"; value: string } | { type: "link"; label: string; path: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "link", label: match[1], path: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  if (parts.length === 0) return <>{content}</>;

  return (
    <>
      {parts.map((part, i) =>
        part.type === "link" ? (
          <button
            key={i}
            onClick={() => onNavigate(part.path)}
            className="inline-flex items-center gap-0.5 text-[#4CAF50] underline underline-offset-2 hover:text-[#43a047] font-medium cursor-pointer"
          >
            {part.label} →
          </button>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </>
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [sessionKey, setSessionKey] = useState(getSessionKey);
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const handleNavigate = useCallback((path: string) => {
    setLocation(path);
    setIsOpen(false);
  }, [setLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getSessionKey();
      if (currentKey !== sessionKey) {
        setSessionKey(currentKey);
        setMessages([]);
        setHasGreeted(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setMessages([{ role: "assistant", content: getGreeting() }]);
      setHasGreeted(true);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${basePath}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          role: getRole(),
          companyId: getCompanyId(),
          candidateId: getCandidateId(),
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                assistantContent += data.content;
                const updatedContent = assistantContent;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: updatedContent };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, basePath]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#4CAF50] text-white shadow-lg hover:bg-[#43a047] transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border bg-background">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a2035] text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">AVANA Assistant</p>
                <p className="text-[10px] text-white/60">AI-powered help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#4CAF50]/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-[#4CAF50]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#4CAF50] text-white rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content ? (
                    <MessageContent content={msg.content} onNavigate={handleNavigate} />
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Thinking...
                    </span>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-[#1a2035] flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-[#4CAF50] placeholder:text-muted-foreground"
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="p-2 rounded-xl bg-[#4CAF50] text-white disabled:opacity-50 hover:bg-[#43a047] transition-colors disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
