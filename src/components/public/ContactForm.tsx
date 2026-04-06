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
        className="w-full p-6 text-center rounded-2xl border shadow-xl"
        style={{ 
          backgroundColor: cardBg || "#ffffff", 
          color: textColor, 
          borderColor: cardBorder || `${textColor}15`,
          boxShadow: `0 10px 30px -10px ${buttonBg}20`
        }}
      >
        <Mail className="w-8 h-8 mx-auto mb-2 opacity-70" />
        <p className="font-medium">Thanks! Your message has been sent.</p>
        <button onClick={() => setSent(false)} className="text-sm underline mt-2 opacity-70">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full space-y-3 rounded-2xl border shadow-lg", compact ? "p-3" : "p-5")}
      style={{ 
        backgroundColor: cardBg || "#ffffff", 
        color: textColor, 
        borderColor: cardBorder || `${textColor}15`,
        boxShadow: `0 10px 30px -10px ${buttonBg}15`
      }}
    >
      <div className={cn("flex items-center gap-2 mb-1", compact && "mb-0.5")}>
        <Mail className={cn("w-4 h-4", compact && "w-3 h-3")} />
        <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>Contact Me</span>
      </div>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          errors.name ? "border-red-400" : ""
        )}
        style={{ color: textColor, backgroundColor: inputBg || 'rgba(128,128,128,0.1)', borderColor: errors.name ? undefined : (inputBorder || `${textColor}20`) }}
        maxLength={100}
      />
      {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          errors.email ? "border-red-400" : ""
        )}
        style={{ color: textColor, backgroundColor: inputBg || 'rgba(128,128,128,0.1)', borderColor: errors.email ? undefined : (inputBorder || `${textColor}20`) }}
        maxLength={255}
      />
      {errors.email && <p className="text-[10px] text-red-400">{errors.email}</p>}
      <textarea
        placeholder="Your message..."
        value={message}
        onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
        rows={compact ? 2 : 3}
        className={cn(
          "w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-current/20 resize-none transition-colors",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
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
          "w-full font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50",
          compact ? "py-2 px-3 text-xs" : "py-3 px-4 text-sm",
          getBtnRadius()
        )}
        style={{ backgroundColor: buttonBg, color: buttonText }}
      >
        {sending ? <Loader2 className={cn("animate-spin", compact ? "w-3 h-3" : "w-4 h-4")} /> : <Send className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />}
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
