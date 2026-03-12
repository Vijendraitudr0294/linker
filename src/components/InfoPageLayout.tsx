import { ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

const InfoPageLayout = ({ title, subtitle, lastUpdated, children }: InfoPageLayoutProps) => (
  <div className="min-h-screen bg-background relative noise-overlay flex flex-col">
    <Navbar />

    <div className="flex-1 container mx-auto px-4 pt-28 pb-16 max-w-3xl relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground mb-2">{subtitle}</p>}
        {lastUpdated && <p className="text-sm text-muted-foreground/60 mb-10">Last updated: {lastUpdated}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="prose prose-invert prose-sm max-w-none
          [&>h2]:text-2xl [&>h2]:font-heading [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-10 [&>h2]:mb-4
          [&>h3]:text-lg [&>h3]:font-heading [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-3
          [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4
          [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6
          [&>ol]:text-muted-foreground [&>ol]:space-y-2 [&>ol]:mb-6
          [&>li]:text-muted-foreground
          [&>a]:text-primary [&>a]:underline
        "
      >
        {children}
      </motion.div>
    </div>

    <Footer />
  </div>
);

export default InfoPageLayout;
