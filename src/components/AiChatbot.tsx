import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Send, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SUGGESTIONS = [
  "What services do you offer?",
  "How does LocalConnect work?",
  "How do I become a provider?",
  "Contact support",
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || "Something went wrong");
    return;
  }
  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim()) continue;
      if (!line.startsWith("data: ")) continue;

      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }

      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }

  // flush
  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* skip */ }
    }
  }

  onDone();
}

export default function AiChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! 👋 I'm the **LocalConnect AI Assistant**. How can I help you today?" },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setDraft("");
    setIsStreaming(true);

    const userMsg: Msg = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === updated.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updated,
        onDelta: upsert,
        onDone: () => setIsStreaming(false),
        onError: (msg) => {
          toast.error(msg);
          setIsStreaming(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI");
      setIsStreaming(false);
    }
  };

  return (
    <>
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 gap-2 rounded-full gradient-primary border-0 px-4 shadow-lg"
        >
          <Sparkles className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">AI Chat</span>
        </Button>
      ) : (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[400px]">
          <Card className="overflow-hidden border-border/60 bg-background/90 backdrop-blur-xl shadow-elevated flex flex-col" style={{ height: "520px" }}>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">LocalConnect AI</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isStreaming ? "Typing..." : "Powered by AI"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div ref={listRef} className="space-y-3 px-4 pb-4 pt-3">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground border border-border/60"
                      )}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ))}

                {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground border border-border/60">
                      <span className="animate-pulse">Thinking…</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick suggestions */}
            {messages.length <= 2 && !isStreaming && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    size="sm"
                    className="h-7 rounded-full bg-accent/10 px-2.5 text-xs hover:bg-accent/20"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-border/60 px-3 py-3 shrink-0"
              onSubmit={(e) => { e.preventDefault(); void send(draft); }}
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask anything about LocalConnect..."
                className="h-10"
                disabled={isStreaming}
              />
              <Button
                type="submit"
                className="h-10 w-10 rounded-full gradient-primary border-0"
                aria-label="Send message"
                disabled={!draft.trim() || isStreaming}
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
