import { motion } from "framer-motion";
import { Star, Eye, Heart, MessageCircle, Bookmark, Gamepad, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOKKO_ASSET_BASE = "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/";

export default function TokkoLanding() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] as any } }
  };

  const images = [
    { src: `${TOKKO_ASSET_BASE}694bb777569d5b4b8cdad7a9_mohamed-hamdi-JDrTqKyYPEY-unsplash.avif`, rotate: -18 },
    { src: `${TOKKO_ASSET_BASE}694bb7772c2eb27535104738_vooglam-eyewear-eWlFJZ9xw5c-unsplash.avif`, rotate: 18 },
    { src: `${TOKKO_ASSET_BASE}694bb777e4c57776c4842c84_michael-soto-SO8kGjaSZes-unsplash.avif`, rotate: -18 },
    { src: `${TOKKO_ASSET_BASE}694bb777206ab0af9dfeb48e_oladimeji-odunsi-Wu3yqve2gnc-unsplash.avif`, rotate: 18 }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-[#ea384c] selection:text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container max-w-[1200px] mx-auto px-6 text-center relative z-10"
        >
          <motion.h1 
            variants={itemVariants} 
            className="text-[48px] md:text-[68px] lg:text-[84px] font-black leading-[1.05] tracking-tight text-black max-w-[800px] mx-auto"
          >
            Take over the timeline
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-[#5d6c7b] max-w-[600px] mx-auto mt-4 font-medium leading-relaxed"
          >
            Unlock the content tactics creators use to blow up fast and stay at the top of the feed.
          </motion.p>
          
          {/* Floating Sticker Pills */}
          <div className="relative mt-8 max-w-[400px] mx-auto h-20 md:h-12 flex justify-center flex-wrap gap-4">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }} className="absolute -top-12 left-0 bg-white border border-[#fafafa] shadow-lg px-4 py-2 rounded-full flex items-center gap-2 transform -rotate-12 cursor-pointer hover:scale-105 transition-transform">
                  <Eye className="w-4 h-4 text-[#758696]" /> <span className="text-xs font-bold">8600</span>
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="absolute -top-4 right-2 bg-white border border-[#fafafa] shadow-lg px-4 py-2 rounded-full flex items-center gap-2 transform rotate-12 cursor-pointer hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4 text-[#ea384c]" /> <span className="text-xs font-bold">1520</span>
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }} className="absolute -bottom-16 left-8 bg-white border border-[#fafafa] shadow-lg px-4 py-2 rounded-full flex items-center gap-2 transform rotate-12 cursor-pointer hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4 text-[#3898ec]" /> <span className="text-xs font-bold">1160</span>
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }} className="absolute -bottom-8 right-8 bg-white border border-[#fafafa] shadow-lg px-4 py-2 rounded-full flex items-center gap-2 transform -rotate-12 cursor-pointer hover:scale-105 transition-transform">
                  <Bookmark className="w-4 h-4 text-[#ea384c]" /> <span className="text-xs font-bold">730</span>
              </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex justify-center gap-4 mt-16">
            <Button className="rounded-2xl bg-[#ea384c] text-white hover:bg-[#ea384c]/90 px-8 py-6 font-bold text-sm shadow-xl shadow-[#ea384c]/20">Enroll Now</Button>
            <Button variant="outline" className="rounded-2xl border-[#e2e2e2] px-8 py-6 font-bold text-sm hover:bg-[#fafafa]">See Details</Button>
          </motion.div>

          {/* Scattered Image Collage section Node 0 */}
          <motion.div variants={itemVariants} className="mt-20 flex justify-center max-w-[1000px] mx-auto flex-wrap gap-8 px-4">
             {images.map((img, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ scale: 0.75, opacity: 0, rotate: img.rotate }}
                   whileInView={{ scale: 1, opacity: 1, rotate: img.rotate / 3 }}
                   transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: idx * 0.1 }}
                   viewport={{ once: true }}
                   whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
                   className="w-[160px] md:w-[200px] aspect-[4/5] rounded-[32px] overflow-hidden border border-[#fafafa] shadow-2xl cursor-pointer bg-[#fafafa] group"
                >
                   <img src={img.src} alt="Tokko feature" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </motion.div>
             ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Grid Features Section 1 */}
      <section id="Approach" className="py-24 bg-[#ea384c] text-white">
         <div className="container max-w-[1200px] mx-auto px-6">
            <div className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
                <h2 className="text-3xl md:text-5xl font-black">You’ll love this course</h2>
                <Button variant="ghost" className="rounded-full border border-white hover:bg-white hover:text-black">Our Approach</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                  { img: `${TOKKO_ASSET_BASE}694bb776813747f4be006680_lucas-gouvea-aoEwuEH7YAs-unsplash.avif`, label: "Real momentum", title: "Growth that pops", desc: "Learn how to push your content further and spark growth you can actually see." },
                  { img: `${TOKKO_ASSET_BASE}694bb777e6fb706840cc3ee8_vitaly-otinov-an9BEVXeii8-unsplash.avif`, label: "No more falling off", title: "Posting on lock", desc: "Build a simple posting flow that keeps you showing up without overthinking it." },
                  { img: `${TOKKO_ASSET_BASE}694bb777a996da7077e53beb_karsten-winegeart-VZbWZ5wyoxw-unsplash.avif`, label: "Never stuck again", title: "Content on repeat", desc: "Use proven frameworks that tell you exactly what to post – again and again." }
               ].map((item, idx) => (
                  <motion.div 
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: idx * 0.1 }}
                     viewport={{ once: true }}
                     className="relative aspect-[3/4] rounded-[40px] overflow-hidden group border border-white/5 shadow-2xl"
                  >
                     <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                     <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-black via-black/40 to-transparent">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 block">{item.label}</span>
                          <h3 className="text-2xl font-black mb-2 text-white">{item.title}</h3>
                          <p className="text-sm text-white/80 leading-relaxed">{item.desc}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Video / Video Banner Section 2 */}
      <section className="py-24 bg-white">
         <div className="container max-w-[1200px] mx-auto px-6 text-center">
             <h2 className="text-3xl md:text-[52px] font-black leading-[1.1] max-w-[800px] mx-auto text-black">
                Tokko is a practical course built around a clear system for content and growth.
             </h2>
             <p className="text-[#5d6c7b] mt-4 font-medium max-w-[500px] mx-auto">
                It’s built to make content feel simpler, clearer, and easier to stick with over time.
             </p>

             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mt-16 max-w-[900px] mx-auto aspect-video rounded-[36px] overflow-hidden border border-[#fafafa] shadow-2xl relative group bg-[#fafafa]"
             >
                <img src="https://images.unsplash.com/photo-1542382257-80dedb725088?q=80&w=2000" alt="Promo video poster" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                     <button className="w-16 h-16 bg-[#ea384c] shadow-2xl shadow-[#ea384c]/30 flex items-center justify-center rounded-full text-white hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current" />
                     </button>
                </div>
             </motion.div>
         </div>
      </section>

      {/* Testimonials Scattered Cards Section 3 */}
      <section className="py-24 bg-[#fafafa] border-t border-[#eee]">
         <div className="container max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-16 text-black">Real stories from creators</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center">
               {[
                  { name: "Jordan P.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", text: "This course made consistency feel realistic. Instead of guessing every time, I now follow a process that actually fits my routine.", rotate: 5 },
                  { name: "Alex R.", img: "https://images.unsplash.com/photo-1506794778242-aff803e49090?auto=format&fit=crop&w=150&q=80", text: "I finally understand what to post and why it works. Tokko gave me structure without making content feel forced or overwhelming.", rotate: -5 },
                  { name: "Sofia K.", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", text: "They helped me stop overthinking content and start posting with confidence. Everything feels simpler and easier to stick with.", rotate: 4 }
               ].map((item, idx) => (
                  <motion.div 
                     key={idx}
                     initial={{ scale: 0.9, opacity: 0 }}
                     whileInView={{ scale: 1, opacity: 1, rotate: item.rotate }}
                     transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                     viewport={{ once: true }}
                     className="bg-white p-8 rounded-[36px] border border-[#eee] text-left hover:border-[#ea384c]/20 transition-all shadow-xl shadow-[#00000003] cursor-pointer"
                  >
                     <div className="flex gap-1 mb-4 text-[#ea384c]">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-sm text-[#5d6c7b] leading-relaxed mb-6 font-medium">"{item.text}"</p>
                     
                     <div className="flex items-center gap-3 border-t border-[#eee] pt-4">
                        <img src={item.img} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                           <h4 className="text-xs font-black text-black">{item.name}</h4>
                           <span className="text-[10px] text-[#758696]">Attendee</span>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Banner / CTA Section 4 */}
      <section className="py-24 bg-white">
         <div className="container max-w-[1000px] mx-auto px-6">
             <div className="bg-[#1a1a1a] rounded-[48px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                 <div className="flex justify-center mb-4">
                     <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/5 backdrop-blur-3xl">
                          <Gamepad className="w-4 h-4 text-[#ea384c]" /> <span className="text-xs font-bold uppercase tracking-wide">Take control</span>
                     </span>
                 </div>
                 
                 <h2 className="text-3xl md:text-5xl font-black mb-4">Plan better. Post smarter</h2>
                 <p className="text-white/70 max-w-[450px] mx-auto font-medium text-sm md:text-base mb-8">
                     Stop guessing what works. Start building content with direction and confidence, using a clear system.
                 </p>

                 <div className="flex justify-center gap-4">
                     <Button className="rounded-2xl bg-[#ea384c] text-white hover:bg-[#ea384c]/90 px-8 py-6 font-bold text-sm">Enroll Now</Button>
                     <Button variant="ghost" className="rounded-2xl border border-white/20 text-white hover:bg-white hover:text-black hover:border-white px-8 py-6 font-bold text-sm">View Pricing</Button>
                 </div>
             </div>
         </div>
      </section>
    </div>
  );
}
