import { motion } from "framer-motion";
import { Instagram, Youtube, Twitter, Github, Globe, Link2, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const accounts = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "hover:text-pink-500", connected: true, handle: "@volkov_design" },
  { id: "tiktok", name: "TikTok", icon: Globe, color: "hover:text-cyan-400", connected: false },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "hover:text-red-500", connected: true, handle: "Architect Visuals" },
  { id: "twitter", name: "X / Twitter", icon: Twitter, color: "hover:text-blue-400", connected: false },
  { id: "github", name: "GitHub", icon: Github, color: "hover:text-white", connected: true, handle: "volkov-arch" },
];

export function ConnectAccountModule() {
  const [connecting, setConnecting] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Identity Nodes</h3>
          <p className="text-sm text-white/40 font-medium">Sync your external digital influence.</p>
        </div>
        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest px-4 hover:bg-white/10">
          Sync All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account, i) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
               "group relative p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 overflow-hidden",
               account.connected && "border-primary/20 bg-primary/[0.02]"
            )}
          >
            <div className="relative z-10 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-colors", account.color)}>
                     <account.icon className="w-6 h-6" />
                  </div>
                  {account.connected ? (
                     <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Syncing
                     </div>
                  ) : (
                     <button 
                       onClick={() => setConnecting(account.id)}
                       className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-primary hover:text-white transition-all group-hover:scale-110"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  )}
               </div>

               <div>
                  <h4 className="text-sm font-black text-white">{account.name}</h4>
                  {account.connected ? (
                     <p className="text-[12px] text-primary font-bold">{account.handle}</p>
                  ) : (
                     <p className="text-[12px] text-white/40 font-medium">Not connected</p>
                  )}
               </div>
            </div>

            {/* Background Accent Mesh */}
            <div className={cn(
               "absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
               account.connected && "bg-primary/10 opacity-100"
            )} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
