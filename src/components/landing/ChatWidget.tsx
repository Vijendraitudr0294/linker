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
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "HI — I'M BIOTRA AI.\nI CAN HELP YOU SET UP YOUR CREATOR PAGE, SELL PRODUCTS, OR EXPLORE FEATURES.",
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setShowQuickReplies(false);
    const userMsg: Msg = { role: "user", content: text.trim().toUpperCase() };
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
                    index === prev.length - 1 ? { ...message, content: assistantText.toUpperCase() } : message,
                  );
                }

                return [...prev, { role: "assistant", content: assistantText.toUpperCase() }];
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
          content: "SORRY, I'M HAVING TROUBLE CONNECTING RIGHT NOW. PLEASE TRY AGAIN IN A MOMENT.",
        },
      ]);
    }

    setLoading(false);
  };

  const desktopStyle = !isMobile
    ? {
        bottom: "24px",
        right: "24px",
      }
    : undefined;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.9, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            style={desktopStyle}
            aria-label="Open chat"
          >
            <MessageCircle className="h-8 w-8 text-black" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 20, rotate: -2 }}
            className={`fixed z-50 flex flex-col overflow-hidden bg-white border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] ${
              isMobile
                ? "inset-0 h-[100dvh] w-screen rounded-none"
                : "rounded-[32px] w-[380px] h-[520px]"
            }`}
            style={isMobile ? undefined : desktopStyle}
          >
            {/* Header */}
            <div className="flex h-20 items-center justify-between px-6 border-b-4 border-black bg-pink-300">
              <div className="flex items-center gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Bot className="h-5 w-5 text-black" strokeWidth={3} />
                </div>
                <div>
                  <div className="text-sm font-[1000] uppercase italic tracking-tighter text-black">BIOTRA AI</div>
                  <div className="flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest text-black/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 border border-black" />
                    SYSTEM ONLINE
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-black" strokeWidth={3} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-[#fdfcf3]"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div 
                    className={`shrink-0 w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
                      message.role === "user" ? "bg-yellow-400" : "bg-emerald-400"
                    }`}
                  >
                    {message.role === "user" ? <User size={20} className="text-black" strokeWidth={3} /> : <Bot size={20} className="text-black" strokeWidth={3} />}
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl border-4 border-black px-5 py-4 text-[12px] font-black uppercase tracking-wider leading-relaxed shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose-sm max-w-none prose-p:my-0 prose-headings:my-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-emerald-400">
                    <Bot size={20} className="text-black" strokeWidth={3} />
                  </div>
                  <div className="rounded-2xl border-4 border-black bg-white px-6 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <div className="flex gap-2">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div
                          key={delay}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                          className="w-2 h-2 rounded-full bg-black"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showQuickReplies && !loading && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">SUGGESTIONS</div>
                  <div className="flex flex-col gap-3">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.message}
                        onClick={() => sendMessage(reply.message)}
                        className="text-left w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-[#FEF08A]"
                      >
                        {reply.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t-4 border-black">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-end gap-3"
              >
                <div className="relative flex-1">
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
                    placeholder="ASK ANYTHING..."
                    className="w-full max-h-[120px] min-h-[56px] resize-none rounded-2xl border-4 border-black bg-white px-5 py-4 text-[12px] font-black uppercase tracking-wider outline-none placeholder:text-black/30 focus:bg-yellow-50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="h-6 w-6 text-black" strokeWidth={3} />
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
