import { motion } from "framer-motion";
import { Star, Sparkles, Smile, Heart } from "lucide-react";

export const RetroStickers = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    <motion.div 
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 15 }}
      transition={{ type: "spring", delay: 0.5 }}
      className="absolute top-10 left-[5%] text-pink-400 opacity-60"
    >
      <Star className="w-8 h-8 md:w-12 md:h-12 fill-current" />
    </motion.div>
    <motion.div 
      initial={{ scale: 0, rotate: 20 }}
      animate={{ scale: 1, rotate: -10 }}
      transition={{ type: "spring", delay: 0.7 }}
      className="absolute bottom-40 right-[10%] text-blue-400 opacity-60"
    >
      <Sparkles className="w-10 h-10 md:w-16 md:h-16" />
    </motion.div>
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 0.4 }}
      transition={{ delay: 1 }}
      className="absolute top-[20%] right-[15%] text-yellow-400"
    >
      <Smile className="w-6 h-6 md:w-10 md:h-10 fill-current" />
    </motion.div>
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0]
      }}
      transition={{ duration: 4, repeat: Infinity }}
      className="absolute top-[60%] left-[8%] text-red-400 opacity-50"
    >
      <Heart className="w-5 h-5 md:w-8 md:h-8 fill-current" />
    </motion.div>
  </div>
);
