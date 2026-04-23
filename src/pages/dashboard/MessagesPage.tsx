import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Trash2, Eye, Clock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  read: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("profile_user_id", user.user_id)
        .order("created_at", { ascending: false });
      if (data) setMessages(data as ContactMessage[]);
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  const markAsRead = async (msg: ContactMessage) => {
    if (!msg.read) {
      await supabase.from("contact_messages").update({ read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    }
    setSelectedMessage(msg);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
    toast.success("Message deleted");
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Communication Center</h4>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-baseline gap-3">
            Interaction <span className="font-script text-primary text-2xl lowercase opacity-80">hub</span>
          </h1>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-medium text-sm px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
            {unreadCount} New Requests
          </Badge>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message list */}
        <div className="space-y-2">
          {messages.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Messages from your public profile contact form will appear here</p>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card
                key={msg.id}
                className={cn(
                  "p-5 cursor-pointer transition-all duration-300 border-black/5 rounded-[24px] overflow-hidden relative group",
                  selectedMessage?.id === msg.id ? "border-emerald-500/30 shadow-xl shadow-black/5" : "hover:border-black/10 hover:bg-black/[0.01]",
                  !msg.read && "bg-emerald-500/[0.02]"
                )}
                onClick={() => markAsRead(msg)}
              >
                {!msg.read && <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "text-foreground"}`}>
                        {msg.sender_name}
                      </p>
                      {!msg.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.sender_email}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Message detail */}
        {selectedMessage && (
          <Card className="p-6 space-y-4 lg:sticky lg:top-20 self-start">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedMessage.sender_name}</p>
                  <a href={`mailto:${selectedMessage.sender_email}`} className="text-xs text-primary hover:underline">
                    {selectedMessage.sender_email}
                  </a>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" asChild>
                <a href={`mailto:${selectedMessage.sender_email}?subject=Re: Message from your profile`}>
                  <Mail className="w-4 h-4 mr-1" /> Reply via Email
                </a>
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteMessage(selectedMessage.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;

