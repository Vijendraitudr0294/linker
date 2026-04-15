import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

interface ContactFormProps {
  profileUserId: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  buttonStyle: string;
  hasPhoto: boolean;
  inputBg?: string;
  inputBorder?: string;
  cardBg?: string;
  cardBorder?: string;
  compact?: boolean;
  isBrutalism?: boolean;
}

const ContactForm = ({
  profileUserId,
  textColor,
  buttonBg,
  buttonText,
  buttonStyle,
  hasPhoto,
  inputBg,
  inputBorder,
  cardBg,
  cardBorder,
  compact = false,
  isBrutalism = false
}: ContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getBtnRadius = () => {
    switch (buttonStyle) {
      case "pill": return "rounded-full";
      case "square": return "rounded-none";
      default: return "rounded-xl";
    }
  };

  const isDarkText = textColor === "#000000" || textColor === "#111111";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);

    const { error } = await supabase.from("contact_messages").insert({
      profile_user_id: profileUserId,
      sender_name: result.data.name,
      sender_email: result.data.email,
      message: result.data.message,
    });

    if (error) {
      toast.error("Failed to send message");
      setSending(false);
      return;
    }

    try {
      await supabase.functions.invoke("contact-notify", {
        body: {
          profile_user_id: profileUserId,
          sender_name: result.data.name,
          sender_email: result.data.email,
          message: result.data.message,
        },
      });
    } catch {
      // Email is best-effort
    }

    setSending(false);
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message sent successfully");
  };

  if (sent) {
    return (
      <div
        className={cn(
          "w-full text-center transition-all",
          compact ? "p-4 border" : "p-8",
          isBrutalism
            ? (compact ? "rounded-xl border-2" : "rounded-none border-4")
            : (compact ? "rounded-[1rem]" : "rounded-[2rem] border border-white/10 backdrop-blur-md")
        )}
        style={{ 
          backgroundColor: isBrutalism ? (cardBg || "#ffffff") : (cardBg || "rgba(255,255,255,0.05)"), 
          color: textColor, 
          borderColor: isBrutalism ? (cardBorder || "#000") : (cardBorder || "rgba(255,255,255,0.1)"),
          boxShadow: compact
            ? `0 8px 20px -12px ${buttonBg}35`
            : isBrutalism ? `8px 8px 0 0 #000` : `0 20px 40px rgba(0,0,0,0.15)`
        }}
      >
        <Mail className={cn("mx-auto mb-3 opacity-80", compact ? "w-6 h-6" : "w-10 h-10")} />
        <p className={cn("font-black tracking-wide", compact ? "text-xs uppercase" : "text-lg")}>Message Delivered</p>
        <p className={cn("opacity-60 font-medium mt-2", compact ? "text-[10px]" : "text-sm")}>Thanks for reaching out. We'll be in touch soon.</p>
        <button onClick={() => setSent(false)} className={cn("mt-4 font-bold underline opacity-80 hover:opacity-100 transition-opacity", compact ? "text-xs" : "text-sm")}>
          Send another message
        </button>
      </div>
    );
  }

  // Common input styles based on theme
  const getBaseInputClass = () => cn(
    "w-full focus:outline-none focus:ring-2 focus:ring-current/20 transition-all placeholder:opacity-40 font-medium",
    isBrutalism ? "rounded-none border-2 border-black" : "rounded-2xl border",
    compact ? "px-3 py-2 text-xs" : "h-[52px] px-4 text-sm"
  );
  
  const getTextAreaClass = () => cn(
    "w-full focus:outline-none focus:ring-2 focus:ring-current/20 resize-none transition-all placeholder:opacity-40 font-medium leading-relaxed",
    isBrutalism ? "rounded-none border-2 border-black" : "rounded-2xl border",
    compact ? "px-3 py-2 text-xs" : "px-4 py-3.5 text-sm"
  );

  const defaultInputBg = isBrutalism ? "#fff" : "rgba(255,255,255,0.06)";
  const defaultInputBorder = isBrutalism ? "#000" : "rgba(255,255,255,0.15)";
  const activeInputBg = inputBg || defaultInputBg;
  const activeInputBorder = inputBorder || defaultInputBorder;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full flex flex-col",
        compact ? "gap-2 p-3 border" : "gap-4 p-5 md:p-8",
        isBrutalism 
          ? (compact ? "rounded-xl border-2" : "rounded-none border-4")
          : (compact ? "rounded-[1rem]" : "rounded-[2rem] border backdrop-blur-md relative overflow-hidden")
      )}
      style={{ 
        backgroundColor: isBrutalism ? (cardBg || "#ffffff") : (cardBg || "rgba(255,255,255,0.03)"), 
        color: textColor, 
        borderColor: isBrutalism ? (cardBorder || "#000") : (cardBorder || "rgba(255,255,255,0.1)"),
        boxShadow: compact
          ? `0 4px 12px -8px ${buttonBg}50`
          : isBrutalism ? `8px 8px 0 0 rgba(0,0,0,1)` : `0 20px 40px -10px rgba(0,0,0,0.15)`
      }}
    >
      <div className={cn("flex flex-col", compact ? "mb-1" : "mb-2")}>
        <div className="flex items-center gap-2 mb-1.5 opacity-90">
          <Mail className={cn(compact ? "w-3 h-3" : "w-5 h-5")} />
          <span className={cn(compact ? "text-xs font-bold" : "text-[14px] font-black uppercase tracking-[0.16em]")}>Send Message</span>
        </div>
        {!compact && <p className="text-[13px] font-medium opacity-60">Quick note and we will reply soon.</p>}
      </div>

      <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
        <div className="flex flex-col gap-1.5">
          {!compact && <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50 ml-1">Name</label>}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            className={getBaseInputClass()}
            style={{ 
              color: textColor, 
              backgroundColor: activeInputBg, 
              borderColor: errors.name ? '#f87171' : activeInputBorder 
            }}
            maxLength={100}
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          {!compact && <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50 ml-1">Email</label>}
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
            className={getBaseInputClass()}
            style={{ 
              color: textColor, 
              backgroundColor: activeInputBg, 
              borderColor: errors.email ? '#f87171' : activeInputBorder 
            }}
            maxLength={255}
          />
          {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          {!compact && <label className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50 ml-1">Message</label>}
          <textarea
            placeholder="Your message..."
            value={message}
            onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
            rows={compact ? 2 : 3}
            className={getTextAreaClass()}
            style={{ 
              color: textColor, 
              backgroundColor: activeInputBg, 
              borderColor: errors.message ? '#f87171' : activeInputBorder 
            }}
            maxLength={1000}
          />
          {errors.message && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className={cn(
          "w-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1 hover:brightness-110",
          compact ? "py-2.5 px-3 text-[10px]" : "h-[54px] px-6 text-[13px] font-black tracking-[0.1em]",
          isBrutalism 
            ? "border-4 border-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1" 
            : "uppercase shadow-xl active:scale-[0.98]",
          getBtnRadius()
        )}
        style={{ backgroundColor: buttonBg, color: buttonText }}
      >
        {sending ? <Loader2 className={cn("animate-spin", compact ? "w-3.5 h-3.5" : "w-5 h-5")} /> : <Send className={cn(compact ? "w-3.5 h-3.5" : "w-5 h-5", isBrutalism ? "" : "opacity-90")} />}
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
