import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const footerLinks = {
  Product: [
    { label: "Features", to: "/#features" },
    { label: "Themes", to: "/#themes" },
    { label: "Pricing", to: "/#pricing" },
    { label: "Changelog", to: "/changelog" },
  ],
  Resources: [
    { label: "Blog", to: "/blog" },
    { label: "Help Center", to: "/help" },
    { label: "API Docs", to: "/api-docs" },
    { label: "Status", to: "/status" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/cookies" },
  ],
  Connect: [
    { label: "Twitter", to: "https://twitter.com", external: true },
    { label: "Instagram", to: "https://instagram.com", external: true },
    { label: "Discord", to: "https://discord.com", external: true },
    { label: "GitHub", to: "https://github.com", external: true },
    { label: "Admin Portal", to: "/admin-login" },
  ],
};

const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 bg-background overflow-hidden">
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-40 left-1/2 -translate-x-1/2 opacity-20" />

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* CTA Banner - Optimized for high conversion */}
        <motion.div
          className="rounded-[2.5rem] sm:rounded-[4rem] glass-strong glass-glow p-10 sm:p-20 text-center mb-20 relative overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-mesh opacity-10 group-hover:opacity-20 transition-opacity" />
          <h3 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-foreground mb-6 tracking-tighter">
            Stop waiting. <br /><span className="text-gradient">Start creating.</span> 🚀
          </h3>
          <p className="text-base sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto font-medium">
            Join the link-in-bio revolution. Everything you need, <span className="text-foreground font-bold underline decoration-primary/40 underline-offset-4">actually free.</span>
          </p>
          <Link to="/register">
            <Button size="lg" className="h-16 px-12 text-lg font-black tracking-tight btn-glow rounded-full gap-3 group">
              CLAIM YOUR LINK <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-black text-foreground tracking-tight">
                Link<span className="text-gradient">Vertex</span>
              </span>
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              The only link-in-bio tool you'll ever need. Built by creators, for the community.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] mb-6">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm sm:text-base text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Massive Aesthetic Footer Text */}
        <div className="relative pt-10 border-t border-white/5 overflow-hidden">
          <motion.h2
            className="text-[12vw] font-heading font-black text-foreground/[0.03] leading-none select-none pointer-events-none text-center whitespace-nowrap"
            initial={{ x: "10%" }}
            whileInView={{ x: "-10%" }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
          >
            LINK VERTEX • LINK VERTEX • LINK VERTEX
          </motion.h2>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
            <p className="text-sm text-muted-foreground font-medium">
              © 2026. Free forever for the world's best creators.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">
              <span>Privacy</span>
              <span>•</span>
              <span>Terms</span>
              <span>•</span>
              <span>Status</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
