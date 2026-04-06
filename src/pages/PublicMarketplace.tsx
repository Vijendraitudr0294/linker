import { motion } from "framer-motion";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import Footer from "@/components/landing/Footer";
import { Search, ShoppingBag } from "lucide-react";

const products = [
  { title: "Motion Frameworks V1", price: "$49", creator: "Alex Volkov", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400" },
  { title: "Brand Strategy Handbook", price: "$129", creator: "Elena Rostova", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" },
  { title: "Sound Pack: Vol 3", price: "$29", creator: "Marcus Kane", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=400" },
  { title: "UX Research Plan", price: "$59", creator: "Sarah Chen", image: "https://images.unsplash.com/photo-1542744173-8e7e3b413300?auto=format&fit=crop&q=80&w=400" }
];

const PublicMarketplace = () => {
  return (
    <div className="min-h-screen bg-[#08080a] text-white relative noise-overlay dark">
      <RedesignedNavbar />

      <section className="pt-32 lg:pt-48 pb-10 relative overflow-hidden">
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[44px] md:text-[64px] font-black leading-[1.05] tracking-tight text-foreground text-center mb-6"
          >
             Browse <span className="text-primary">Catalog.</span>
          </motion.h1>
          <p className="text-xl text-muted-foreground font-medium text-center max-w-[480px] mx-auto mb-12">
             Digital assets and services sold directly by elite creators.
          </p>

          {/* Dummy Search Bar */}
          <div className="relative max-w-[500px] mx-auto mb-16">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5" />
             <input type="text" placeholder="Search frameworks, sounds, guides..." className="w-full h-14 pl-14 pr-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:border-primary/50" />
          </div>
        </div>
      </section>

      <section className="py-10 pb-32">
         <div className="container max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item, i) => (
               <motion.div
                 key={item.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="group relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden hover:border-white/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
               >
                  <div className="aspect-[4/5] relative overflow-hidden rounded-2xl m-2">
                     <img src={item.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-105" alt="product" />
                     <div className="absolute inset-x-3 bottom-3 p-4 rounded-xl border border-white/10 bg-background/60 backdrop-blur-xl flex justify-between items-center">
                        <div>
                           <div className="text-[10px] font-black uppercase text-white/50 tracking-widest">Price</div>
                           <div className="text-md font-black text-white">{item.price}</div>
                        </div>
                        <div className="flex items-center gap-1 text-white/80 font-bold text-xs">
                           <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        </div>
                     </div>
                  </div>
                  <div className="p-5">
                     <h4 className="text-[15px] font-black uppercase tracking-widest text-white leading-none mb-1">{item.title}</h4>
                     <p className="text-xs text-muted-foreground font-medium">{item.creator}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicMarketplace;
