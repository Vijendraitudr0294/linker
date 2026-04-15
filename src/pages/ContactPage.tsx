import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

const contacts = [
  { icon: Mail, label: "EMAIL", value: "support@biotra.ai", color: "bg-[#FBCFE8]" },
  { icon: MessageCircle, label: "COMMUNITY", value: "Discord Server", color: "bg-[#22C55E]" },
  { icon: MapPin, label: "OFFICE", value: "Remote / Global", color: "bg-[#FDE047]" },
];

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please complete all fields.");
      return;
    }
    const subject = encodeURIComponent(`BIOTRA contact request from ${name.trim()}`);
    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
    window.location.href = `mailto:support@biotra.ai?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <LandingNav />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="inline-block px-4 py-2 bg-[#FBCFE8] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  CONNECT WITH US
                </span>
                <h1 className="text-[72px] md:text-[100px] font-black tracking-tighter text-black uppercase leading-[0.85]">
                  WE'D LOVE TO<br />HEAR FROM<br />YOU.
                </h1>
                <p className="text-sm font-black uppercase tracking-widest text-black/40 leading-relaxed max-w-sm">
                  PLATFORM SUPPORT, BUSINESS INQUIRIES, OR JUST SAYING HI — WE'RE ALL EARS.
                </p>
              </div>

              <div className="space-y-4">
                {contacts.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 p-5 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <div className={`w-14 h-14 ${item.color} border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] shrink-0`}>
                      <item.icon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">{item.label}</p>
                      <p className="text-lg font-black text-black uppercase tracking-tight">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-8 border-black rounded-[48px] p-10 md:p-14 shadow-[16px_16px_0_0_rgba(0,0,0,1)] space-y-6"
            >
              {[
                { label: "YOUR NAME", placeholder: "Alex Volkov", value: name, setter: setName, type: "text" },
                { label: "YOUR EMAIL", placeholder: "alex@example.com", value: email, setter: setEmail, type: "email" },
              ].map((field) => (
                <div key={field.label} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full h-14 px-5 bg-[#F3F4F6] border-4 border-black rounded-2xl font-black text-black placeholder:text-black/20 focus:outline-none focus:border-[#22C55E] focus:shadow-[4px_4px_0_0_rgba(34,197,94,1)] transition-all uppercase tracking-wide"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">MESSAGE</label>
                <textarea
                  rows={5}
                  placeholder="HOW CAN WE HELP YOU?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-5 bg-[#F3F4F6] border-4 border-black rounded-2xl font-black text-black placeholder:text-black/20 focus:outline-none focus:border-[#22C55E] focus:shadow-[4px_4px_0_0_rgba(34,197,94,1)] transition-all resize-none uppercase tracking-wide"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full h-20 bg-black text-white font-black uppercase tracking-widest text-base border-4 border-black rounded-2xl shadow-[8px_8px_0_0_rgba(251,207,232,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                SEND MESSAGE <Send className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;
