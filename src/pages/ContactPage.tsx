import { motion } from "framer-motion";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import Footer from "@/components/landing/Footer";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error("Please complete your name, email, and message.");
      return;
    }

    const subject = encodeURIComponent(`BIOTRA contact request from ${trimmedName}`);
    const body = encodeURIComponent([
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      "",
      trimmedMessage,
    ].join("\n"));

    window.location.href = `mailto:support@biotra.ai?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white relative noise-overlay dark">
      <RedesignedNavbar />

      <section className="pt-32 lg:pt-48 pb-20 relative overflow-hidden text-center">
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
           
           {/* Info Cards */}
           <div className="space-y-6 text-left flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[36px] md:text-[52px] font-black leading-[1.05] tracking-tight text-foreground mb-4"
              >
                 Get in <span className="text-primary">Touch.</span>
              </motion.h1>
              <p className="text-lg text-muted-foreground font-medium mb-8">
                 We're here to help you scale your creator ecosystem.
              </p>

              <div className="space-y-4">
                 {[
                    { icon: Mail, label: "Email", value: "support@BIOTRA.ai" },
                    { icon: MessageCircle, label: "Community", value: "Discord server" },
                    { icon: MapPin, label: "Office", value: "Remote / Global" }
                 ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                    >
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-white/80" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-white ledning-relaxed">{item.value}</p>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Contact Form Form */}
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl text-left flex flex-col gap-5 shadow-2xl"
           >
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-white/60 tracking-widest">Name</label>
                 <input type="text" placeholder="Alex Volkov" value={name} onChange={(event) => setName(event.target.value)} className="w-full h-12 px-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-white/60 tracking-widest">Email</label>
                 <input type="email" placeholder="alex@creators.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full h-12 px-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-white/60 tracking-widest">Message</label>
                 <textarea rows={4} placeholder="Tell us about your setup nodes..." value={message} onChange={(event) => setMessage(event.target.value)} className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 rezise-none" />
              </div>

              <Button onClick={handleSubmit} className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-xs">Send Message</Button>
           </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
