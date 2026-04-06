import InfoPageLayout from "@/components/InfoPageLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const blogPosts = [
  {
    title: "How to Get More Clicks on Your Bio Link",
    excerpt: "Learn the psychology behind high-converting link-in-bio pages. From button placement to color contrast, these 7 tips can double your click-through rate.",
    date: "Mar 5, 2026",
    category: "Growth",
    readTime: "5 min read",
  },
  {
    title: "Why We Made BIOTRA 100% Free",
    excerpt: "Most link-in-bio tools charge $5-20/month for basic features. Here's why we decided to make everything free — and how we sustain it.",
    date: "Feb 28, 2026",
    category: "Company",
    readTime: "4 min read",
  },
  {
    title: "10 Best Link-in-Bio Page Examples for 2026",
    excerpt: "Get inspired by real creators, restaurants, and coaches who've built stunning bio link pages. Steal their layouts and strategies.",
    date: "Feb 20, 2026",
    category: "Inspiration",
    readTime: "7 min read",
  },
  {
    title: "How Restaurants Use BIOTRA to Take Orders",
    excerpt: "From digital menus to direct ordering — see how food businesses are replacing expensive third-party apps with a free bio link page.",
    date: "Feb 12, 2026",
    category: "Case Study",
    readTime: "6 min read",
  },
  {
    title: "New Feature: AI Bio Writer",
    excerpt: "Our AI can now write your bio, suggest link titles, and even recommend the best theme for your niche. Here's how to use it.",
    date: "Feb 5, 2026",
    category: "Product",
    readTime: "3 min read",
  },
  {
    title: "Analytics That Actually Matter",
    excerpt: "Forget vanity metrics. Learn which analytics you should focus on to grow your audience and increase conversions from your bio link.",
    date: "Jan 28, 2026",
    category: "Growth",
    readTime: "5 min read",
  },
];

const Blog = () => (
  <InfoPageLayout title="Blog" subtitle="Tips, updates, and stories from the BIOTRA team.">
    <div className="space-y-6 not-prose">
      {blogPosts.map((post, i) => (
        <motion.article
          key={post.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-2xl p-6 card-hover group cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{post.category}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> {post.date}
            </span>
            <span className="text-xs text-muted-foreground">{post.readTime}</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
        </motion.article>
      ))}
    </div>

    <div className="text-center mt-12 not-prose">
      <p className="text-muted-foreground mb-4">More articles coming soon!</p>
      <Link to="/register">
        <Button className="rounded-full btn-glow gap-2">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  </InfoPageLayout>
);

export default Blog;
