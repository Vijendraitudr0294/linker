import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "Switched from Linktree and it's not even close. The built-in shop feature is insane for free.", name: "Priya K.", handle: "@priyacreates", category: "🎨 Creator" },
  { quote: "I run my entire food menu through BIOTRA. Customers order directly from my bio link. Game changer.", name: "Carlos M.", handle: "@tacosbycarlos", category: "🍕 Restaurant" },
  { quote: "My coaching clients book through my BIOTRA page. The analytics help me see which content converts.", name: "Sam W.", handle: "@samcoaches", category: "🏋️ Fitness Coach" },
  { quote: "As a musician, having my Spotify, merch shop, and tour dates all in one beautiful page is everything.", name: "Jade L.", handle: "@jadebeats", category: "🎵 Musician" },
  { quote: "I manage 15 client pages from one dashboard. The themes are gorgeous and the AI features save hours.", name: "Alex R.", handle: "@alexagency", category: "💼 Agency" },
  { quote: "Free? With these features? I kept looking for the catch. There is none. This is the real deal.", name: "Nina T.", handle: "@ninashoots", category: "📸 Photographer" },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 mesh-gradient-premium opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="glow-orb glow-orb-accent w-[500px] h-[500px] top-20 -right-40 opacity-20 blur-[130px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-black text-primary uppercase tracking-[0.35em] mb-8 shadow-sm">
            Community Voices 💬
          </span>
          <h2 className="text-[3.2rem] leading-[0.95] sm:text-[5rem] lg:text-[6.5rem] font-black mb-8 tracking-tighter text-foreground text-balance">
            Loved by <span className="text-holographic">50K+ creators</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-6 font-medium leading-relaxed">
            From viral musicians to local boutiques, BIOTRA powers the world's most creative bio links.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.handle}
              className="p-8 rounded-[2.5rem] glass-premium card-hover border border-white/5 relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-lg lg:text-xl text-foreground font-medium leading-relaxed italic opacity-90">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center font-black text-primary">
                   {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-bold tracking-tighter">{t.handle}</p>
                </div>
                <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-primary">
                  {t.category.split(" ")[1]}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
