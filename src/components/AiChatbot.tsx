import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getIntentAndReply(raw: string) {
  const text = raw.toLowerCase().trim();

  const matchesAny = (patterns: RegExp[]) => patterns.some((p) => p.test(text));

  // Intents
  const contact = matchesAny([/contact/, /help/, /support/, /email/, /gmail/, /reach out/]);
  const services = matchesAny([/service/, /services/, /plumber/, /electrician/, /clean/, /health/, /doctor/, /real estate/, /b2b/]);
  const howItWorks = matchesAny([/how it works/, /steps/, /book/, /request/, /rate/, /verified/]);
  const login = matchesAny([/login/, /log in/, /sign in/]);
  const signup = matchesAny([/signup/, /sign up/, /register/]);

  if (howItWorks) {
    return {
      intent: "how",
      reply:
        "Here’s how LocalConnect works:\n\n1) Search services and choose a category\n2) Send a request to a verified professional\n3) Get service at your doorstep and rate your experience",
    };
  }

  if (services) {
    return {
      intent: "services",
      reply:
        "We offer categories like home repairs, cleaning services, B2B solutions, healthcare, and real estate.\n\nTell me what you need (e.g., plumber, cleaning, IT support) and I’ll guide you to the right place.",
    };
  }

  if (contact) {
    return {
      intent: "contact",
      reply:
        "You can reach us anytime via the Contact page. We usually respond within 24 hours on weekdays.\n\nEmail: kodequantum@gmail.com\n\nIf you want, go to `Contact` and send your message.",
    };
  }

  if (login) {
    return {
      intent: "auth",
      reply:
        "To log in, open the Login page and enter your email + password. If you don’t have an account yet, you can sign up instead.",
    };
  }

  if (signup) {
    return {
      intent: "auth",
      reply:
        "To create an account, open the Signup page. You can sign up as a customer or as a service provider.",
    };
  }

  // Default help
  return {
    intent: "general",
    reply:
      "Hi! I’m your LocalConnect assistant.\n\nAsk me about services, how it works, or how to contact support.",
  };
}

export default function AiChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [lastIntent, setLastIntent] = useState<string>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content: "Hi! How can I help you today with LocalConnect?",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Focus input after opening
    const t = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    // Keep the latest message visible
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length, isThinking]);

  const suggestions = useMemo(
    () => ["Find services", "How it works", "Contact support", "How do I become a provider"],
    [],
  );

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setDraft("");
    setIsThinking(true);

    const userMsg: ChatMessage = { id: makeId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    const { intent, reply } = getIntentAndReply(trimmed);
    setLastIntent(intent);

    // Simulate an AI response delay
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: reply,
        },
      ]);
      setIsThinking(false);
    }, 650);
  };

  return (
    <>
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 gap-2 rounded-full gradient-primary border-0 px-4"
        >
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">Chat</span>
        </Button>
      ) : (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[380px]">
          <Card className="overflow-hidden border-border/60 bg-background/80 backdrop-blur-xl shadow-elevated">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">LocalConnect Assistant</p>
                  <p className="mt-1 text-xs text-muted-foreground">Usually replies in seconds</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    size="sm"
                    className="h-8 rounded-full border-border/60 bg-accent/10 px-3 text-xs hover:bg-accent/20"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>

              {(lastIntent === "services" || lastIntent === "general") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-border/60"
                    onClick={() => navigate("/services")}
                  >
                    Browse Services
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-border/60"
                    asChild
                  >
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              )}

              {lastIntent === "contact" && (
                <div className="mt-3 flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-border/60"
                    asChild
                  >
                    <Link to="/contact">Open Contact Page</Link>
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[320px]">
              <div
                ref={listRef}
                className={cn("space-y-3 px-4 pb-4 pt-2", messages.length === 0 ? "hidden" : "")}
              >
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground border border-border/60",
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground border border-border/60">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form
              className="flex items-center gap-2 border-t border-border/60 px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message..."
                className="h-10"
              />
              <Button type="submit" className="h-10 w-10 rounded-full gradient-primary border-0" aria-label="Send message" disabled={!draft.trim()}>
                <Send className="h-4 w-4 text-primary-foreground" />
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

