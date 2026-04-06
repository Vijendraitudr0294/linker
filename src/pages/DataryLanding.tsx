import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, Clock, Users, BarChart3, Globe, Smartphone, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TokkoShowcase from "@/components/landing/TokkoShowcase";
import MockDashboardPreview from "@/components/landing/MockDashboardPreview";
import { MockFeaturePreview, MockFAQPreview } from "@/components/landing/MockUIElements";

const ASSET_BASE = "https://cdn.prod.website-files.com/6794ac644ed360d5530891ce/";

export default function DataryLanding() {
  const navigate = useNavigate();

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] } }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#a6a6a6] font-sans selection:bg-[#f25f30] selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#0c0c0c]/80 border-b border-[#151515]">
        <div className="container max-w-[1200px] mx-auto px-[clamp(1rem,5vw,2rem)] h-20 flex items-center justify-between"> {/* RESPONSIVE FIX */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#f25f30] rounded-md flex items-center justify-center font-black text-white text-xs">B</div>
            <span className="font-black text-white uppercase tracking-wider text-sm">Biotra</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-[clamp(1rem,2vw,2rem)]"> {/* RESPONSIVE FIX */}
            <span className="text-sm font-medium text-[#e5e5e5] hover:text-[#f25f30] transition-colors cursor-pointer" onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>Features</span>
            <span className="text-sm font-medium text-white/70 hover:text-[#f25f30] transition-colors cursor-pointer" onClick={() => window.scrollTo({top: 1500, behavior: 'smooth'})}>Pricing</span>
            <span className="text-sm font-medium text-white/70 hover:text-[#f25f30] transition-colors cursor-pointer" onClick={() => window.scrollTo({top: 2500, behavior: 'smooth'})}>About</span>
            <span className="text-sm font-medium text-white/70 hover:text-[#f25f30] transition-colors cursor-pointer" onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}>Contact</span>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/login')} className="rounded-full bg-white text-[#0c0c0c] hover:bg-[#1e1e1e] hover:text-white font-bold px-6 py-5 flex items-center gap-2 group text-[clamp(10px,1.2vw,12px)] uppercase tracking-wider transition-all touch-manipulation"> {/* RESPONSIVE FIX */}
              Join Now
              <img src={`${ASSET_BASE}6799a3da5e5e38693cf6d135_button-dark-arrow.svg`} alt="arrow" loading="lazy" className="w-3 group-hover:translate-x-1 transition-transform" /> {/* RESPONSIVE FIX */}
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 relative">
        {/* Glow Orb Backdrops for layout shades inside background overlay */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f25f30] rounded-full filter blur-[200px] opacity-10 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#f25f30] rounded-full filter blur-[180px] opacity-5 pointer-events-none -z-10 -translate-x-1/2" />

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${ASSET_BASE}6799fbbd79301875acb4f691_hero-bg-image.webp)` }}>
          <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#f25f30]/10 via-transparent to-transparent rounded-full blur-[120px] opacity-40" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container max-w-[1200px] mx-auto px-6 text-center relative z-10"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#151515] bg-[#0c0c0c] backdrop-blur-xl">
                 <span className="bg-[#151515] text-[#f25f30] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>
                 <span className="text-[11px] font-bold text-white/80 tracking-wide">Offline Data Standalone Sync</span>
                 <img src={`${ASSET_BASE}6799d91973e9b9e5cd873b90_button-primary-arrow.svg`} alt="arrow" className="w-3" />
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-[clamp(2.5rem,10vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white max-w-[800px] mx-auto" /* RESPONSIVE FIX */
            >
              Master your links & <br className="hidden sm:block" />
              <span className="text-[#f25f30]">dynamic QR assets.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[#a6a6a6] font-medium max-w-[600px] mx-auto mt-6 leading-relaxed"
            >
              Consolidate your digital presence. Generate commission-free catalogs, vCard profiles, and feedback redirects with our absolute standalone engine.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 mt-10">
              <Button onClick={() => navigate('/dashboard')} className="rounded-full bg-[#f25f30] text-white hover:bg-white hover:text-black font-black px-8 py-6 text-sm flex items-center gap-2 group shadow-xl shadow-[#f25f30]/10 transition-all">
                Enter Dashboard Free
                <img src={`${ASSET_BASE}6799a3d93d32219bd9776144_button-light-arrow.svg`} alt="arrow" className="w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <span className="text-xs text-white/40">*Runs locally. Zero dependencies.</span>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-16 max-w-[1000px] mx-auto relative rounded-3xl border border-[#151515] bg-[#0c0c0c]/80 p-4 backdrop-blur-3xl"
            >
               <div className="rounded-2xl overflow-hidden border border-[#151515] bg-[#111] relative group h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-50 z-10" />
                  <MockDashboardPreview />
               </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Clients Section */}
        <section className="py-20 border-t border-[#151515] bg-[#0c0c0c] relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0c0c0c] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0c0c0c] to-transparent z-10 pointer-events-none" />
          
          <div className="container max-w-[1200px] mx-auto px-6 relative z-0">
             <p className="text-center text-sm font-bold text-white/50 tracking-wider mb-8">
               Seamless integration with <span className="text-[#f25f30]">industry-leading</span> enterprise platforms
             </p>
             <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60">
               {["stripe", "paypal", "mailchimp", "youtube", "spotify", "tiktok"].map((client, idx) => (
                  <div key={idx} className="px-6 py-2 rounded-full border border-white/10 bg-[#111] font-black tracking-widest uppercase text-white/70 text-sm hover:text-white hover:border-[#f25f30]/40 hover:bg-[#1a1a1a] transition-all cursor-pointer">
                    {client}
                  </div>
               ))}
             </div>
          </div>
        </section>

        {/* Feature Split Section with Edge Radiance Glow */}
        <section className="py-24 border-t border-[#151515] bg-[#0c0c0c] relative">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#f25f30] rounded-full filter blur-[150px] opacity-10 pointer-events-none -z-10 translate-x-1/3 translate-y-1/3" />

          <div className="container max-w-[1200px] mx-auto px-6">
             <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="text-center text-3xl md:text-5xl font-black mb-16 bg-gradient-to-b from-white via-[#a6a6a6] to-[#a6a6a6] bg-clip-text text-transparent"
             >
               Essential modules for your dashboard
             </motion.h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group rounded-[32px] border border-[#151515] bg-[#111] overflow-hidden flex flex-col items-center hover:border-[#f25f30]/30 transition-all duration-500"
                >
                   <MockFeaturePreview type="links" />
                   <div className="p-8 text-center border-t border-[#151515] w-full bg-[#111] relative z-20">
                      <div className="w-2 h-2 bg-[#f25f30] rounded-full mx-auto mb-4" />
                      <h3 className="text-xl font-black mb-2 text-white">Dynamic Asset Routing</h3>
                      <p className="text-sm text-[#a6a6a6]">Structure, assign, and track absolute routing with scalable custom redirects seamlessly.</p>
                   </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group rounded-[32px] border border-[#151515] bg-[#111] overflow-hidden flex flex-col items-center hover:border-[#f25f30]/30 transition-all duration-500"
                >
                   <MockFeaturePreview type="qr" />
                   <div className="p-8 text-center border-t border-[#151515] w-full bg-[#111] relative z-20">
                      <div className="w-2 h-2 bg-[#f25f30] opacity-30 rounded-full mx-auto mb-4" />
                      <h3 className="text-xl font-black mb-2 text-white">Actionable QR Matrix</h3>
                      <p className="text-sm text-[#a6a6a6]">Deploy flawless printable codes through unified QR forms mapped directly to native nodes.</p>
                   </div>
                </motion.div>
             </div>
          </div>
        </section>

        {/* 🆕 NEW SECTION: QR Forge & Local Standing Backup */}
        <section className="py-24 border-t border-[#151515] bg-[#0c0c0c] relative overflow-hidden">
           <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-[#f25f30] filter blur-[100px] opacity-10 rounded-full pointer-events-none" />
           <div className="container max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6 }}
                   className="lg:col-span-5 space-y-6"
                 >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f25f30]/30 bg-[#f25f30]/5 text-[#f25f30] text-xs font-bold tracking-wide">
                        Offline Standalone Vault
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#e5e5e5] to-[#a6a6a6] bg-clip-text text-transparent leading-tight py-2">
                        Dynamic Link Matrix & <span className="text-[#f25f30]">QR Generator</span>
                    </h2>
                    <p className="text-[#a6a6a6] text-base leading-relaxed">
                        Structure beautiful short-links and generate visually dynamic QR Codes for vCard Plus, Feedback Redirects, and Coupons standing fully isolated.
                    </p>

                    <div className="space-y-3 pt-4">
                       {[
                         { title: "Standalone Database Proxy", desc: "No cloud dependencies, runs 100% inside local buffers securely." },
                         { title: "Dynamic Feedback Panels", desc: "Generate Mobile-app styled feedback and review collectors seamlessly." },
                         { title: "Batch Asset Generation", desc: "Bundle dynamic profiles and link matrix layouts accurately offline." }
                       ].map((item, idx) => (
                          <div key={idx} className="flex gap-3 group">
                             <div className="w-5 h-5 mt-0.5 rounded-full bg-[#f25f30]/10 flex items-center justify-center text-[#f25f30] group-hover:bg-[#f25f30] group-hover:text-white transition-all">
                                <CheckCircle2 className="w-3 h-3" />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                <p className="text-xs text-[#a6a6a6]/80">{item.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>

                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                   className="lg:col-span-7 relative"
                 >
                    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-white/10 to-[#f25f30]/20">
                        <div className="bg-[#0c0c0c] rounded-[23px] overflow-hidden border border-[#151515] p-6 backdrop-blur-3xl relative">
                           <div className="absolute inset-0 bg-gradient-to-b from-[#f25f30]/5 to-transparent pointer-events-none" />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* QR Preview Item 1 */}
                              <div className="bg-[#111] border border-[#151515] rounded-xl p-5 hover:border-[#f25f30]/40 transition-all duration-300">
                                 <div className="w-12 h-12 bg-white rounded-xl mb-4 flex items-center justify-center font-black text-black">QR</div>
                                 <h4 className="text-sm font-bold text-white mb-1">Feedback Redirect page</h4>
                                 <p className="text-xs text-[#a6a6a6]">Generates 5-star collectors nodes for local standing backup mirrors.</p>
                              </div>
                              <div className="bg-[#111] border border-[#151515] rounded-xl p-5 hover:border-[#f25f30]/40 transition-all duration-300">
                                 <div className="w-12 h-12 bg-[#222] border border-[#f25f30]/30 rounded-xl mb-4 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-[#f25f30]" />
                                 </div>
                                 <h4 className="text-sm font-bold text-white mb-1">Mirror Proxy Sync</h4>
                                 <p className="text-xs text-[#a6a6a6]">Pulls all 125 objects rows data cleanly into offline local setups.</p>
                              </div>
                              <div className="md:col-span-2 bg-[#111] border border-[#151515] rounded-xl p-5 flex items-center justify-between">
                                 <div>
                                    <h4 className="text-sm font-bold text-white mb-1">Offline state loaded</h4>
                                    <p className="text-xs text-[#f25f30] font-black">27 profiles | 66 links nodes active</p>
                                 </div>
                                 <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/30" />
                              </div>
                           </div>
                        </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Feature Grid with Icons */}
        <section className="py-20 border-t border-[#151515] bg-[#0c0c0c]">
          <div className="container max-w-[1200px] mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
                 <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#a6a6a6] to-[#a6a6a6] bg-clip-text text-transparent max-w-[500px]">Powerful configuration presets</h2>
                 <Button onClick={() => navigate('/dashboard')} className="rounded-full bg-white text-[#0c0c0c] hover:bg-[#1e1e1e] hover:text-white font-bold px-6 py-5 flex items-center gap-2 group text-xs uppercase tracking-wider transition-all">
                     View All Modules
                     <img src={`${ASSET_BASE}6799a3da5e5e38693cf6d135_button-dark-arrow.svg`} alt="arrow" className="w-3 group-hover:translate-x-1 transition-transform" />
                 </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Grid Layout", desc: "Construct, assign, and prioritize metrics with absolute precision.", Icon: CheckCircle2 },
                  { title: "Team Mesh", desc: "Coordinate file sharing pipelines within active nodes.", Icon: Users },
                  { title: "Schedule Mapping", desc: "Reference timelines for accurate metrics tracking.", Icon: Clock },
                  { title: "Customizable Channels", desc: "Adapt pipelines to represent complex setup structures.", Icon: ArrowRightLeft },
                   { title: "Analytical Reporting", desc: "Gain deep insights with precise analytics and tracking metrics.", Icon: BarChart3 },
                   { title: "External Node Sync", desc: "Integrate third-party overlays with fully native layout support.", Icon: Zap },
                   { title: "Flexible Timelines", desc: "Map visual structural timings with absolute precision and clarity.", Icon: Globe },
                   { title: "Client Framework", desc: "Seamlessly deploy powerful frameworks with native scalability.", Icon: Smartphone }
                ].map((feat, idx) => (
                  <div key={idx} className="bg-[#111] border border-[#151515] rounded-2xl p-6 group hover:border-[#f25f30] transition-all duration-300">
                     <div className="w-10 h-10 rounded-xl bg-[#151515] flex items-center justify-center mb-4 border border-[#1e1e1e]">
                         <feat.Icon className="w-5 h-5 text-[#f25f30]" />
                     </div>
                     <h3 className="text-lg font-black mb-2 text-white">{feat.title}</h3>
                     <p className="text-sm text-[#a6a6a6] leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

         {/* CTA Banner with GLOWING edge wrapper */}
        <section className="py-16 bg-[#0c0c0c]">
          <div className="container max-w-[1000px] mx-auto px-6">
             <div className="p-[1px] rounded-[36px] bg-gradient-to-b from-white/10 via-[#f25f30]/5 to-[#f25f30] shadow-2xl shadow-[#f25f30]/10">
                 <div className="bg-[#1e1e1e] rounded-[35px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border border-transparent">
                    {/* Native glowing orb bg replacement */}
                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-[#f25f30]/60 to-transparent rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute left-[-20px] top-[-20px] w-48 h-48 bg-white/5 rounded-full blur-[40px] pointer-events-none" />

                    <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
                       <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#a6a6a6] to-[#a6a6a6] bg-clip-text text-transparent leading-tight py-2">Proven workflows that deliver speed</h2>
                       <div className="pt-2">
                           <Button onClick={() => navigate('/login')} className="rounded-full bg-white text-[#0c0c0c] hover:bg-[#111] hover:text-white font-bold px-6 py-5 flex items-center gap-2 group text-xs uppercase tracking-wider transition-all">
                               Get Started 
                               <img src={`${ASSET_BASE}6799a3da5e5e38693cf6d135_button-dark-arrow.svg`} alt="arrow" className="w-3 group-hover:translate-x-1 transition-transform" />
                           </Button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-l border-[#151515] pl-0 md:pl-12 relative z-10">
                       <div className="text-center md:text-left">
                          <div className="text-4xl font-black text-white">99%</div>
                          <p className="text-xs text-[#a6a6a6] mt-1">Uptime and availability metrics execution accurate.</p>
                       </div>
                       <div className="text-center md:text-left">
                          <div className="text-4xl font-black text-white">3.2<span className="text-[#f25f30]">x</span></div>
                          <p className="text-xs text-[#a6a6a6] mt-1">Faster tasks compilation speed optimization structures.</p>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </section>

        {/* Accordion / FAQ section with background Glow center */}
        <section className="py-24 border-t border-[#151515] bg-[#0c0c0c] relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f25f30] rounded-full filter blur-[220px] opacity-10 pointer-events-none -z-10" />

           <div className="container max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1000px] mx-auto items-center">
                  <div className="relative rounded-[32px] overflow-hidden border border-[#151515] bg-[#111]">
                     <MockFAQPreview />
                  </div>
                  
                  <div className="space-y-6">
                      <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#a6a6a6] to-[#a6a6a6] bg-clip-text text-transparent leading-tight py-2">Unlock full potential setup</h2>
                      
                      <div className="space-y-4">
                         {[
                            { title: "Simplify pipelines", desc: "Coordinate dashboard management configurations for optimal scaling structures.", icon: Zap },
                            { title: "Enhance node meshes", desc: "Streamline dashboard structural setups overlays configuration native parameters.", icon: Users },
                            { title: "Standard workflow deliverables", desc: "Accurately coordinate tracking structures optimization overlays timings.", icon: Clock }
                         ].map((item, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-[#111] border border-[#151515] hover:border-[#f25f30] transition-all duration-300">
                               <div className="flex items-center gap-3 font-black text-white">
                                  <item.icon className="w-4 h-4 text-[#f25f30]" />
                                  <span className="text-sm">{item.title}</span>
                               </div>
                               <p className="text-xs text-[#a6a6a6] mt-2 leading-relaxed">{item.desc}</p>
                            </div>
                         ))}
                      </div>
                  </div>
              </div>
           </div>
        </section>

        <TokkoShowcase />

        {/* Footer with Edge Radiance border mask wrapper */}
        <footer className="pt-24 pb-12 bg-[#0c0c0c] border-t border-[#151515]">
           <div className="container max-w-[1200px] mx-auto px-6">
               <div className="p-[1px] rounded-[24px] bg-gradient-to-b from-white/5 via-[#f25f30]/5 to-[#f25f30]">
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#111] p-8 md:p-12 rounded-[23px] relative overflow-hidden">
                       <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#f25f30] rounded-full filter blur-[100px] opacity-15 pointer-events-none" />
                       
                       <div className="md:col-span-4 space-y-4 relative z-10">
                           <div className="font-black text-white uppercase text-base">Biotra</div>
                           <p className="text-xs text-[#a6a6a6] max-w-[240px] leading-relaxed">The premier standalone link and QR code generation engine available at biotra.cc.</p>
                       </div>

                       <div className="md:col-span-4 max-w-[360px] space-y-4 relative z-10">
                           <h4 className="text-xs font-black uppercase tracking-wider text-white">Stay updated</h4>
                           <div className="flex gap-2">
                              <input type="email" placeholder="Email Address" className="h-9 px-4 bg-[#0c0c0c] border border-[#151515] rounded-full text-xs text-white focus:outline-none w-full" />
                              <Button className="h-9 bg-[#f25f30] text-white hover:bg-white hover:text-black rounded-full font-bold text-xs transition-all px-4">Subscribe</Button>
                           </div>
                       </div>

                       <div className="md:col-span-4 grid grid-cols-2 gap-8 relative z-10">
                           <div>
                              <h4 className="text-xs font-black uppercase tracking-wider mb-3 text-white">Categories</h4>
                              <div className="flex flex-col gap-2 text-xs text-[#a6a6a6]">
                                  <a href="#" className="hover:text-[#f25f30] transition-colors">Framework</a>
                                  <a href="#" className="hover:text-[#f25f30] transition-colors">Resources</a>
                              </div>
                           </div>
                           <div>
                              <h4 className="text-xs font-black uppercase tracking-wider mb-3 text-white">System</h4>
                              <div className="flex flex-col gap-2 text-xs text-[#a6a6a6]">
                                  <a href="#" className="hover:text-[#f25f30] transition-colors">Guide line</a>
                                  <a href="#" className="hover:text-[#f25f30] transition-colors">Policy</a>
                              </div>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="border-t border-[#151515] mt-12 pt-8 flex justify-between items-center text-xs text-[#a6a6a6]/60">
                   <div>© 2026 biotra.cc. All rights reserved.</div>
                   <div className="flex gap-4">
                        <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
                        <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
                   </div>
               </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
