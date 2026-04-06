import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function TokkoShowcase() {
  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 40 },
    visible: (custom: { rotate: number }) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      rotate: custom.rotate,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }
    })
  };

  const images = [
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb777569d5b4b8cdad7a9_mohamed-hamdi-JDrTqKyYPEY-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb7772c2eb27535104738_vooglam-eyewear-eWlFJZ9xw5c-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb777e4c57776c4842c84_michael-soto-SO8kGjaSZes-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb777206ab0af9dfeb48e_oladimeji-odunsi-Wu3yqve2gnc-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb776813747f4be006680_lucas-gouvea-aoEwuEH7YAs-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb777e6fb706840cc3ee8_vitaly-otinov-an9BEVXeii8-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb777a996da7077e53beb_karsten-winegeart-VZbWZ5wyoxw-unsplash.avif",
    "https://cdn.prod.website-files.com/694ba75ca8333c7e1ac8998c/694bb7778db1e04ecedbb582_anni-peng-8I5FjeMSq_I-unsplash.avif"
  ];

  const testimonials = [
    { name: "Jordan P.", role: "Creator", quote: "This layout made consistency feel realistic. I now follow a process that actually fits my routine.", rotate: -5 },
    { name: "Alex R.", role: "Influencer", quote: "I finally understand what to post and why it works. Given complete structure without feeling forced.", rotate: 4 },
    { name: "Sofia K.", role: "Artist", quote: "They helped me stop overthinking content and start posting with absolute confidence.", rotate: -3 },
    { name: "Emily T.", role: "Musician", quote: "The biggest change for me was confidence. Everything feels simpler and easier to stick with.", rotate: 5 },
    { name: "Marcus L.", role: "Streamer", quote: "The absolute speed of getting setups configured with that aesthetic is magical.", rotate: -4 },
    { name: "Sara V.", role: "Writer", quote: "Coordinates standard standard pipelines absolute overlays configuration native parameters setups.", rotate: 3 },
    { name: "Lina S.", role: "Producer", quote: "Dials and nodes layout are beautifully constructed flawlessly standard absolute layout setup.", rotate: -5 },
    { name: "Danny M.", role: "Designer", quote: "Visual absolute graphics scaling coordinated accurately with absolute performance metrics.", rotate: 4 }
  ];

  return (
    <section className="py-24 border-t border-[#151515] bg-[#0c0c0c] relative overflow-hidden">
      {/* Background Orbs accurate mesh setup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f25f30] rounded-full filter blur-[240px] opacity-10 pointer-events-none -z-10" />

      <div className="container max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-white via-[#a6a6a6] to-[#a6a6a6] bg-clip-text text-transparent mb-16 max-w-[600px] mx-auto leading-tight py-2">
          Capture the feed with rotated scatter layout grid
        </h2>

        {/* Floating Images Scatter Gallery: Section 0 recreation */}
        <div className="flex justify-center flex-wrap gap-6 mb-24 max-w-[800px] mx-auto">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              custom={{ rotate: idx % 2 === 0 ? -6 : 6 }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
              className="relative w-[150px] md:w-[170px] aspect-[3/4] rounded-2xl overflow-hidden border border-[#151515] shadow-xl hover:shadow-[#f25f30]/20 transition-shadow cursor-pointer bg-[#111]"
            >
              <img src={img} alt="scatter layout" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Scattered Card Testimonials Grid: Section 3 recreation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              custom={{ rotate: item.rotate }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 20 }}
              className="bg-[#111] p-6 rounded-3xl border border-[#151515] text-left hover:border-[#f25f30]/30 transition-all shadow-xl backdrop-blur-3xl"
            >
              <div className="flex gap-1 mb-4 text-[#f25f30]">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-[#a6a6a6] leading-relaxed mb-6 font-medium">"{item.quote}"</p>
              <div className="flex items-center gap-3 border-t border-[#151515] pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f25f30] to-[#f25f30]/30 flex items-center justify-center font-bold text-white text-xs">
                  {item.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{item.name}</h4>
                  <span className="text-[10px] text-[#a6a6a6]/60">{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
