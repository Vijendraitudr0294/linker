import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Twitter, Facebook, Linkedin, Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
}

export const ShareModal = ({ isOpen, onClose, url, name }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const sharePlatforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`Check out ${name}'s profile: ${url}`)}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      color: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s profile: `)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      color: "#0088cc",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${name}'s profile`)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "#EA4335",
      href: `mailto:?subject=${encodeURIComponent(`Check out ${name}'s profile`)}&body=${encodeURIComponent(`I thought you'd like this: ${url}`)}`,
    },
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[24px] border-none shadow-2xl overflow-hidden p-0 bg-white dark:bg-slate-950">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-xl font-bold tracking-tight">Share this profile</DialogTitle>
          <DialogDescription className="text-sm opacity-60">
            Tell your friends and followers about {name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 group">
            <div className="relative p-2 bg-white rounded-xl shadow-lg ring-1 ring-black/5 transition-transform group-hover:scale-105 duration-300">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Scan to visit profile</p>
          </div>

          {/* Share Grid */}
          <div className="grid grid-cols-3 gap-3">
            {sharePlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{platform.name}</span>
              </a>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="flex items-center gap-2 p-2 pl-4 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group">
            <span className="flex-1 text-xs truncate font-medium opacity-60">{url}</span>
            <Button
              onClick={handleCopy}
              className="rounded-full h-10 px-4 font-bold text-xs uppercase tracking-wider"
              variant={copied ? "outline" : "default"}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
