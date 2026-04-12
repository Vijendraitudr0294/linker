import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="bg-[#F0F2F5] min-h-screen text-black selection:bg-black selection:text-white font-sans">
      <LandingNav />
      
      <main className="pt-40 pb-40 px-6 md:px-10 max-w-[1200px] mx-auto min-h-[80vh]">
        
        {/* Title Tag */}
        <div className="flex justify-center md:justify-start">
            <div className="inline-block px-6 py-2 bg-yellow-300 text-black font-black text-[12px] uppercase tracking-[0.3em] mb-12 border-4 border-black rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all">
                CONNECT WITH US
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-20">
          
          {/* Left Column: Text & Info */}
          <div className="space-y-10 text-center md:text-left">
            <h1 className="text-[52px] md:text-[80px] font-[1000] tracking-tighter uppercase leading-[0.85]">
                WE'D LOVE TO <br /> <span className="text-pink-500">HEAR FROM YOU.</span>
            </h1>
            
            <p className="text-lg md:text-xl font-bold text-black/70 leading-relaxed border-l-8 border-pink-400 pl-6 mx-auto md:mx-0 max-w-md">
                We're here to help you scale your creator ecosystem. Drop us a line if you need platform support or business inquiries.
            </p>

            <div className="space-y-6 pt-4 flex flex-col items-center md:items-start">
                {[
                { icon: Mail, label: "Email", value: "support@biotra.ai", color: "bg-blue-300" },
                { icon: MessageCircle, label: "Community", value: "Discord server", color: "bg-emerald-300" },
                { icon: MapPin, label: "Office", value: "Remote / Global", color: "bg-orange-300" }
                ].map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 p-4 w-full max-w-sm rounded-2xl border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
                >
                    <div className={cn("w-14 h-14 rounded-xl border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]", item.color)}>
                        <item.icon className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black uppercase text-black/50 tracking-[0.2em] leading-none mb-1">{item.label}</p>
                        <p className="text-lg font-[900] text-black leading-tight tracking-tight">{item.value}</p>
                    </div>
                </motion.div>
                ))}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 md:p-12 rounded-[40px] border-8 border-black bg-white text-left flex flex-col gap-6 shadow-[24px_24px_0_0_rgba(0,0,0,1)] h-fit"
          >
            <div className="space-y-3">
                <label className="text-sm font-black uppercase text-black tracking-[0.1em]">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Alex Volkov" 
                  value={name} 
                  onChange={(event) => setName(event.target.value)} 
                  className="w-full h-14 px-5 bg-[#F0F2F5] border-4 border-black rounded-2xl text-base font-bold text-black focus:outline-none focus:bg-white focus:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all placeholder:text-black/30" 
                />
            </div>
            <div className="space-y-3">
                <label className="text-sm font-black uppercase text-black tracking-[0.1em]">Your Email</label>
                <input 
                  type="email" 
                  placeholder="alex@example.com" 
                  value={email} 
                  onChange={(event) => setEmail(event.target.value)} 
                  className="w-full h-14 px-5 bg-[#F0F2F5] border-4 border-black rounded-2xl text-base font-bold text-black focus:outline-none focus:bg-white focus:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all placeholder:text-black/30" 
                />
            </div>
            <div className="space-y-3">
                <label className="text-sm font-black uppercase text-black tracking-[0.1em]">Message</label>
                <textarea 
                  rows={4} 
                  placeholder="Tell us about how we can help..." 
                  value={message} 
                  onChange={(event) => setMessage(event.target.value)} 
                  className="w-full p-5 bg-[#F0F2F5] border-4 border-black rounded-2xl text-base font-bold text-black focus:outline-none focus:bg-white focus:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all placeholder:text-black/30 resize-none" 
                />
            </div>

            <button 
              onClick={handleSubmit} 
              className="mt-4 w-full h-16 rounded-2xl bg-black text-white font-black uppercase tracking-[0.15em] hover:bg-black/90 active:scale-[0.98] transition-transform text-sm shadow-[8px_8px_0_0_rgba(236,72,153,1)] hover:shadow-[4px_4px_0_0_rgba(236,72,153,1)] hover:translate-y-1 hover:translate-x-1"
            >
              Submit Ticket
            </button>
          </motion.div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;
