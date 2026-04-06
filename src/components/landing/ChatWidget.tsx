import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landing-chat`;

const quickReplies = [
  { label: "What features are free?", message: "What features are free?" },
  { label: "How do I get started?", message: "How do I get started?" },
  { label: "Can I sell products?", message: "Can I sell products on BIOTRA?" },
  { label: "How many themes exist?", message: "How many themes exist?" },
];

const panelMotion = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 12 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [isHeroActive, setIsHeroActive] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm BIOTRA AI.\nI can help you set up your creator page, sell products, or explore features.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(media.matches);
    updateMobile();
    media.addEventListener("change", updateMobile);
    return () => media.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    const syncTheme = () => setIsLight(document.documentElement.classList.contains("light"));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncHeroState = () => {
      const hero = document.getElementById("hero");
      if (!hero || isMobile) {
        setIsHeroActive(false);
        return;
      }

      const rect = hero.getBoundingClientRect();
      setIsHeroActive(rect.bottom > 220 && rect.top < window.innerHeight * 0.75);
    };

    syncHeroState();
    window.addEventListener("scroll", syncHeroState, { passive: true });
    window.addEventListener("resize", syncHeroState);

    return () => {
      window.removeEventListener("scroll", syncHeroState);
      window.removeEventListener("resize", syncHeroState);
    };
  }, [isMobile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    if (!isMobile) return;

    const originalOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobile, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setShowQuickReplies(false);
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            reader.cancel();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantText += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > newMessages.length) {
                  return prev.map((message, index) =>
                    index === prev.length - 1 ? { ...message, content: assistantText } : message,
                  );
                }

                return [...prev, { role: "assistant", content: assistantText }];
              });
            }
          } catch {
            // Ignore partial streamed chunks until valid JSON arrives.
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    }

    setLoading(false);
  };

  const desktopBottom = isHeroActive ? 104 : 24;
  const desktopStyle = !isMobile
    ? {
        bottom: `${desktopBottom}px`,
        right: "24px",
      }
    : undefined;

  const panelStyle = isMobile
    ? undefined
    : {
        ...desktopStyle,
        width: "360px",
        height: "480px",
        backdropFilter: "blur(22px)",
        background: isLight ? "rgba(245, 239, 232, 0.93)" : "rgba(20,20,20,0.75)",
        border: isLight ? "1px solid rgba(75, 56, 40, 0.2)" : "1px solid rgba(255,255,255,0.08)",
      };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpen(true)}
            className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-[0_16px_36px_-18px_rgba(255,132,34,0.85)] transition-transform hover:scale-105"
            style={{
              ...desktopStyle,
              background:
                "linear-gradient(135deg, rgba(255,122,26,1) 0%, rgba(255,163,74,1) 100%)",
            }}
            aria-label="Open chat"
          >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
            <MessageCircle className="relative h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            className={`fixed z-50 flex flex-col overflow-hidden ${
              isMobile
                ? `inset-0 h-[100dvh] w-screen rounded-none border-0 ${isLight ? "bg-[#f4eee6]" : "bg-[#121212]"}`
                : "rounded-[20px]"
            }`}
            style={panelStyle}
          >
            <div className={`flex h-14 items-center justify-between px-4 ${isLight ? "border-b border-[#d7c5b3]" : "border-b border-white/8"}`}>
              <div className="flex items-center gap-3">
                <div className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary ${isLight ? "ring-1 ring-[#d8c7b4]" : "ring-1 ring-white/10"}`}>
                  <Bot className="h-4 w-4" />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${isLight ? "border-[#f4eee6]" : "border-[#141414]"} bg-emerald-400`} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isLight ? "text-[#33251a]" : "text-white"}`}>BIOTRA AI</div>
                  <div className={`text-[10px] uppercase tracking-[0.18em] ${isLight ? "text-[#6e5946]" : "text-white/45"}`}>
                    Online
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  isLight
                    ? "text-[#7f6651] hover:bg-[#eadfce] hover:text-[#3b2a1f]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
                aria-label="Close chat"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="phone-scroll flex-1 overflow-y-auto px-4 py-4"
              style={{
                background:
                  isLight
                    ? "radial-gradient(circle at top, rgba(255,132,34,0.14), rgba(244,238,230,0.9) 30%)"
                    : "radial-gradient(circle at top, rgba(255,132,34,0.10), transparent 28%)",
              }}
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ${isLight ? "ring-1 ring-[#d7c4b0]" : "ring-1 ring-white/10"}`}>
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[84%] rounded-[18px] px-3.5 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : isLight
                            ? "rounded-bl-md border border-[#ccb8a2] bg-white/80 text-[#3a2b21]"
                            : "rounded-bl-md border border-white/8 bg-white/[0.04] text-white/90"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="max-w-none [&_ol]:my-2 [&_p]:m-0 [&_ul]:my-2 [&_li]:my-1">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isLight ? "bg-[#eadfce] text-[#3b2a1f] ring-1 ring-[#d7c4b0]" : "bg-white/10 text-white ring-1 ring-white/10"}`}>
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-white/10">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className={`rounded-[18px] rounded-bl-md px-4 py-3 ${isLight ? "border border-[#ccb8a2] bg-white/80" : "border border-white/8 bg-white/[0.04]"}`}>
                      <span className="flex items-center gap-1.5">
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary/70"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary/70"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary/70"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        />
                      </span>
                    </div>
                  </motion.div>
                )}

                {showQuickReplies && !loading && messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.22 }}
                    className={`rounded-[18px] p-3 ${isLight ? "border border-[#ccb8a2] bg-white/72" : "border border-white/8 bg-white/[0.03]"}`}
                  >
                    <div className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${isLight ? "text-[#725f4d]" : "text-white/45"}`}>
                      Quick questions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.message}
                          onClick={() => sendMessage(reply.message)}
                          className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            isLight
                              ? "border border-[#d3bfaa] bg-[#f4ece2] text-[#5d4a39] hover:border-primary/40 hover:bg-primary/10 hover:text-[#38281d]"
                              : "border border-white/10 bg-white/[0.03] text-white/80 hover:border-primary/40 hover:bg-primary/10 hover:text-white hover:shadow-[0_0_18px_rgba(255,132,34,0.18)]"
                          }`}
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className={`px-4 py-3 ${isLight ? "border-t border-[#d7c5b3] bg-[#efe5d9]" : "border-t border-white/8 bg-[#141414]"}`}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything about BIOTRA..."
                  className={`max-h-[120px] min-h-[44px] flex-1 resize-none rounded-[16px] px-4 py-3 text-sm shadow-[0_10px_28px_-22px_rgba(0,0,0,0.8)] outline-none transition-colors ${
                    isLight
                      ? "border border-[#ccb8a2] bg-white/85 text-[#3b2a1f] placeholder:text-[#8f7865] focus:border-primary/45"
                      : "border border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-primary/35"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-20px_rgba(255,132,34,0.7)] transition-transform hover:scale-105 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
