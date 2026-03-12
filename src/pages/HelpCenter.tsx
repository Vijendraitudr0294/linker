import InfoPageLayout from "@/components/InfoPageLayout";
import { motion } from "framer-motion";
import { Search, Link2, Palette, BarChart3, ShoppingBag, MessageCircle, Sparkles, Shield, Mail } from "lucide-react";
import { useState } from "react";

const helpTopics = [
  {
    icon: Link2,
    title: "Getting Started",
    articles: [
      { q: "How do I create an account?", a: "Click 'Sign up free' on the homepage. Enter your email, password, and choose a username. That's it — your page is live instantly." },
      { q: "How do I add links?", a: "Go to Dashboard → Links. Click 'Add Link', enter the title and URL, then drag to reorder. Toggle visibility with the switch." },
      { q: "Can I change my username?", a: "Yes! Go to Dashboard → Settings and update your username. Your public URL will update immediately." },
    ],
  },
  {
    icon: Palette,
    title: "Themes & Appearance",
    articles: [
      { q: "How many themes are available?", a: "We offer 60+ themes across categories: Minimal, Dark, Neon, Pastel, Business, Nature, Gradient, Retro, Photo, and Animated." },
      { q: "Can I customize colors?", a: "Absolutely. Go to Dashboard → Appearance to customize background, text, button colors, fonts, and more." },
      { q: "Can I upload a custom background?", a: "Yes! In the Appearance page, you can upload any image or use our AI background generator." },
    ],
  },
  {
    icon: ShoppingBag,
    title: "Catalog & Orders",
    articles: [
      { q: "How do I add products?", a: "Go to Dashboard → Catalog and click 'Add Item'. Fill in the details, set a price, upload an image, and publish." },
      { q: "How do orders work?", a: "When a visitor places an order through your page, you'll see it in Dashboard → Orders. You'll also get an email notification." },
      { q: "Can I track inventory?", a: "Yes! Enable 'Track Inventory' on any item. Stock decrements automatically with each order, and you'll get low-stock alerts." },
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    articles: [
      { q: "What analytics do I get?", a: "Track page views, link clicks, top referrers, visitor locations, and catalog item views — all in real-time charts." },
      { q: "Can I filter by date?", a: "Yes. Use the date range picker at the top of the Analytics page to filter data by any time period." },
    ],
  },
  {
    icon: MessageCircle,
    title: "Contact Form & Messages",
    articles: [
      { q: "How do visitors message me?", a: "Your public profile includes a contact form. Messages appear in Dashboard → Messages, and you get email notifications." },
      { q: "Can I disable the contact form?", a: "Platform administrators can toggle the contact form feature in Platform Settings." },
    ],
  },
  {
    icon: Shield,
    title: "Account & Security",
    articles: [
      { q: "How do I reset my password?", a: "Click 'Forgot password?' on the login page. We'll send a reset link to your email." },
      { q: "Is my data secure?", a: "Yes. We use enterprise-grade encryption, row-level security, and GDPR-compliant practices." },
      { q: "How do I delete my account?", a: "Go to Dashboard → Settings and scroll to the danger zone. Account deletion is permanent." },
    ],
  },
];

const HelpCenter = () => {
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  return (
    <InfoPageLayout title="Help Center" subtitle="Find answers to common questions.">
      <div className="not-prose space-y-4">
        {helpTopics.map((topic, i) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenTopic(openTopic === i ? null : i)}
              className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <topic.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-foreground">{topic.title}</h3>
                <p className="text-xs text-muted-foreground">{topic.articles.length} articles</p>
              </div>
              <span className="text-muted-foreground text-xl">{openTopic === i ? "−" : "+"}</span>
            </button>
            {openTopic === i && (
              <div className="px-5 pb-5 space-y-4 border-t border-border/20 pt-4">
                {topic.articles.map((article) => (
                  <div key={article.q}>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{article.q}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{article.a}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="not-prose glass rounded-2xl p-8 text-center mt-10">
        <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="font-heading font-bold text-foreground mb-2">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-1">Email us at <span className="text-primary">support@linkvertex.com</span></p>
        <p className="text-xs text-muted-foreground">We typically respond within 24 hours.</p>
      </div>
    </InfoPageLayout>
  );
};

export default HelpCenter;
