import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "Switched from Linktree and it's not even close. The built-in shop feature is insane for free.", name: "Priya K.", handle: "@priyacreates", category: "🎨 Creator" },
  { quote: "I run my entire food menu through LinkVertex. Customers order directly from my bio link. Game changer.", name: "Carlos M.", handle: "@tacosbycarlos", category: "🍕 Restaurant" },
  { quote: "My coaching clients book through my LinkVertex page. The analytics help me see which content converts.", name: "Sam W.", handle: "@samcoaches", category: "🏋️ Fitness Coach" },
  { quote: "As a musician, having my Spotify, merch shop, and tour dates all in one beautiful page is everything.", name: "Jade L.", handle: "@jadebeats", category: "🎵 Musician" },
  { quote: "I manage 15 client pages from one dashboard. The themes are gorgeous and the AI features save hours.", name: "Alex R.", handle: "@alexagency", category: "💼 Agency" },
  { quote: "Free? With these features? I kept looking for the catch. There is none. This is the real deal.", name: "Nina T.", handle: "@ninashoots", category: "📸 Photographer" },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      <div className="glow-orb glow-orb-accent w-[400px] h-[400px] top-20 -right-40" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Real People 💬</span>
          <h2 className="text-[2.25rem] leading-[1.2] sm:text-5xl lg:text-6xl font-heading font-bold mb-4 px-4 text-balance">
            Loved by <span className="text-gradient">50K+ creators</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.handle}
              className="p-6 rounded-2xl glass card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.handle}</p>
                </div>
                <span className="text-xs font-medium glass px-3 py-1.5 rounded-full text-foreground/70">
                  {t.category}
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
