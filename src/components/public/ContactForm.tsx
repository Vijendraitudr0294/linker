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
}

const ContactForm = ({ profileUserId, textColor, buttonBg, buttonText, buttonStyle, hasPhoto, inputBg, inputBorder, cardBg, cardBorder, compact = false }: ContactFormProps) => {
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
      default: return "rounded-lg";
    }
  };

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

    // Store in DB
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

    // Send email notification via edge function
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
      // Email is best-effort, message is already saved
    }

    setSending(false);
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message sent!");
  };

  if (sent) {
    return (
      <div
        className={cn(
          "w-full text-center border transition-all",
          compact ? "p-4 rounded-xl border-2" : "p-6 rounded-2xl border-4"
        )}
        style={{ 
          backgroundColor: cardBg || "#ffffff", 
          color: textColor, 
          borderColor: cardBorder || `${textColor}15`,
          boxShadow: compact
            ? `0 8px 20px -12px ${buttonBg}35`
            : `8px 8px 0 0 rgba(0,0,0,1)`
        }}
      >
        <Mail className={cn("mx-auto mb-2 opacity-80", compact ? "w-6 h-6" : "w-8 h-8")} />
        <p className={cn("font-black", compact ? "text-xs" : "text-sm uppercase tracking-[0.14em]")}>Message sent</p>
        <button onClick={() => setSent(false)} className={cn("mt-2 font-bold underline opacity-70", compact ? "text-xs" : "text-sm")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full space-y-3 border",
        compact ? "p-3 rounded-xl border-2" : "p-5 md:p-6 rounded-2xl border-4"
      )}
      style={{ 
        backgroundColor: cardBg || "#ffffff", 
        color: textColor, 
        borderColor: cardBorder || `${textColor}15`,
        boxShadow: compact
          ? `0 8px 20px -12px ${buttonBg}35`
          : `8px 8px 0 0 rgba(0,0,0,1)`
      }}
    >
      <div className={cn("flex items-center gap-2", compact ? "mb-0.5" : "mb-2")}>
        <Mail className={cn("opacity-80", compact ? "w-3 h-3" : "w-4 h-4")} />
        <span className={cn(compact ? "text-xs font-bold" : "text-[11px] font-black uppercase tracking-[0.16em]")}>Send Message</span>
      </div>
      {!compact && <p className="text-sm font-bold text-black/60 -mt-1 mb-1">Quick note and we will reply soon.</p>}
      {!compact && <label className="text-[10px] font-black uppercase tracking-[0.14em] opacity-60">Name</label>}
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "h-12 px-3.5 text-sm font-bold",
          errors.name ? "border-red-400" : ""
        )}
        style={{ color: textColor, backgroundColor: inputBg || 'rgba(128,128,128,0.1)', borderColor: errors.name ? undefined : (inputBorder || `${textColor}20`) }}
        maxLength={100}
      />
      {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
      {!compact && <label className="text-[10px] font-black uppercase tracking-[0.14em] opacity-60">Email</label>}
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "h-12 px-3.5 text-sm font-bold",
          errors.email ? "border-red-400" : ""
        )}
        style={{ color: textColor, backgroundColor: inputBg || 'rgba(128,128,128,0.1)', borderColor: errors.email ? undefined : (inputBorder || `${textColor}20`) }}
        maxLength={255}
      />
      {errors.email && <p className="text-[10px] text-red-400">{errors.email}</p>}
      {!compact && <label className="text-[10px] font-black uppercase tracking-[0.14em] opacity-60">Message</label>}
      <textarea
        placeholder="Your message..."
        value={message}
        onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
        rows={compact ? 2 : 3}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 resize-none transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm font-medium",
          errors.message ? "border-red-400" : ""
        )}
        style={{ color: textColor, backgroundColor: inputBg || 'rgba(128,128,128,0.1)', borderColor: errors.message ? undefined : (inputBorder || `${textColor}20`) }}
        maxLength={1000}
      />
      {errors.message && <p className="text-[10px] text-red-400">{errors.message}</p>}
      <button
        type="submit"
        disabled={sending}
        className={cn(
          "w-full font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50",
          compact ? "py-3 px-3 text-[10px]" : "h-12 px-4 text-[12px] border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
          getBtnRadius()
        )}
        style={{ 
          backgroundColor: buttonBg, 
          color: buttonText
        }}
      >
        {sending ? <Loader2 className={cn("animate-spin", compact ? "w-3.5 h-3.5" : "w-4.5 h-4.5")} /> : <Send className={cn(compact ? "w-3.5 h-3.5" : "w-4.5 h-4.5")} />}
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
