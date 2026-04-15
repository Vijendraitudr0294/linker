import { motion } from "framer-motion";
import { Zap, Sparkles, User, ShoppingBag, Newspaper, Radio, QrCode, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const ICON_MAP: Record<string, any> = {
  Zap, Sparkles, User, ShoppingBag, Newspaper, Radio, QrCode, BarChart3, ArrowRight
};

export const MarketingHero = ({ content }: any) => (
  <section className="relative pt-40 pb-20 bg-white overflow-hidden border-b-8 border-black">
    <div className="container max-w-[1400px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
        <h1 className="text-[56px] md:text-[92px] font-[1000] tracking-tighter leading-[0.9] text-black uppercase mb-10">
          <span className="bg-emerald-400 px-4 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] inline-block mb-4">
             {content.title.split(' ').slice(0, 2).join(' ')}
          </span><br />
          {content.title.split(' ').slice(2).join(' ')}
        </h1>
        <p className="text-xl font-black text-black/60 uppercase tracking-widest leading-relaxed mb-12 max-w-lg">
          {content.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-6 mb-12">
          <Link to={content.primaryCTA.href} className="px-10 py-6 bg-black text-white border-4 border-black rounded-2xl font-[1000] uppercase tracking-[0.2em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[8px_8px_0_0_rgba(16,185,129,1)] flex items-center gap-3">
            {content.primaryCTA.label} <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </Link>
          <Link to={content.secondaryCTA.href} className="px-10 py-6 bg-white text-black border-4 border-black rounded-2xl font-[1000] uppercase tracking-[0.2em] transition-all hover:bg-gray-50 underline decoration-4 underline-offset-8">
            {content.secondaryCTA.label}
          </Link>
        </div>
        <div className="inline-flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-emerald-400 font-black uppercase text-[11px] tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
           <Zap className="w-5 h-5 fill-black" /> {content.trustLine}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95, rotate: 2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} className="relative">
         {/* Live Preview Mockup - BRUTALIST STYLE */}
         <div className="w-full aspect-[4/5] max-w-[440px] mx-auto bg-white border-8 border-black rounded-[40px] shadow-[32px_32px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-10 bg-black z-20 flex items-center justify-center">
               <div className="w-24 h-4 bg-white/20 rounded-full" />
            </div>
            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80" alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-emerald-400/20 mix-blend-multiply transition-opacity group-hover:opacity-0" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-10">
               <div className="w-20 h-20 bg-white border-4 border-black mb-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
               <div className="h-6 w-40 bg-black mb-3" />
               <div className="h-4 w-60 bg-black/40 mb-10" />
               <div className="flex gap-4">
                  <div className="h-16 flex-1 bg-white border-4 border-black font-black uppercase flex items-center justify-center text-xs">Profile</div>
                  <div className="h-16 flex-1 bg-black text-white font-black uppercase flex items-center justify-center text-xs italic">Connect</div>
               </div>
            </div>
         </div>
         {/* Floating Labels */}
         <div className="absolute top-10 -right-4 px-6 py-2 bg-pink-300 border-4 border-black font-black uppercase text-xs rotate-12 shadow-[6px_6px_0_0_rgba(0,0,0,1)] animate-bounce">Live Builder</div>
         <div className="absolute bottom-20 -left-4 px-6 py-2 bg-emerald-400 border-4 border-black font-black uppercase text-xs -rotate-12 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">Secure OS</div>
      </motion.div>
    </div>
  </section>
);

export const MarketingFeatures = ({ content }: any) => (
  <section className="py-40 bg-white border-b-8 border-black" id="solutions">
    <div className="container max-w-[1400px] mx-auto px-10">
      <div className="text-left max-w-4xl mb-24">
        <h2 className="text-[56px] md:text-[80px] font-[1000] tracking-tighter leading-[0.9] text-black uppercase mb-8">
           <span className="bg-black text-white px-6 inline-block mb-4 italic">Capabilities</span><br />
           {content.heading}
        </h2>
        <p className="text-xl font-black text-black/50 uppercase tracking-[0.2em]">High Performance Modules // Infinite Scaling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {(content.items || []).map((item: any, i: number) => {
          const Icon = ICON_MAP[item.icon] || Zap;
          const colors = [
            "bg-emerald-400", "bg-pink-300", "bg-indigo-300", 
            "bg-blue-300", "bg-fuchsia-300", "bg-orange-300"
          ];
          const color = colors[i % colors.length];
          
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-10 border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] group",
                color
              )}
            >
              <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-black fill-black/10" />
              </div>
              <h3 className="text-2xl font-[1000] text-black uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-black font-black uppercase text-xs leading-relaxed opacity-70 italic">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export const MarketingCTA = ({ content }: any) => (
  <section className="py-40 bg-black overflow-hidden relative border-b-8 border-black">
    <div className="absolute inset-0 pointer-events-none">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400 opacity-20 blur-[150px] rounded-full" />
    </div>
    <div className="container max-w-[1400px] mx-auto px-10 relative z-10 text-center">
      <h2 className="text-[48px] md:text-[84px] font-[1000] tracking-tighter text-white uppercase mb-16 leading-[0.9] max-w-4xl mx-auto">
        {content.title}
      </h2>
      <Link to={content.buttonHref} className="inline-flex items-center gap-6 px-16 py-8 bg-white text-black border-4 border-black rounded-[24px] font-[1000] uppercase text-2xl tracking-[0.2em] shadow-[16px_16px_0_0_rgba(16,185,129,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all">
        {content.buttonLabel} <ArrowRight className="w-8 h-8 stroke-[4]" />
      </Link>
      
      <div className="mt-20 flex flex-col items-center gap-4">
         <div className="px-6 py-2 bg-emerald-400 border-4 border-black font-[1000] uppercase text-[10px] tracking-[0.4em] rotate-1">Standing Backup Online</div>
         <p className="text-white/30 font-black text-[9px] uppercase tracking-[0.6em]">Zero Third-Party Dependencies // Absolute Data Ownership</p>
      </div>
    </div>
  </section>
);
export const MarketingTeam = ({ content }: any) => (
  <section className="py-40 bg-white border-b-8 border-black">
    <div className="container max-w-[1400px] mx-auto px-10">
      <div className="text-left max-w-4xl mb-24">
        <h2 className="text-[56px] md:text-[80px] font-[1000] tracking-tighter leading-[0.9] text-black uppercase mb-8">
           <span className="bg-black text-white px-6 inline-block mb-4 italic">Executive</span><br />
           The Core Leadership
        </h2>
        <p className="text-xl font-black text-black/50 uppercase tracking-[0.2em]">Pioneer Nodes // Strategic Orchestration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {(content.members || []).map((member: any, i: number) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-black rounded-3xl translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
               <div className="relative aspect-square border-4 border-black rounded-3xl overflow-hidden bg-gray-100">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                       <User className="w-12 h-12 text-black/20" />
                    </div>
                  )}
               </div>
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-1">{member.name}</h3>
            <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest mb-4 italic">
               {member.role}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide leading-relaxed">
               {member.bio}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
