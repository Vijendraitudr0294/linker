import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Newspaper, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  slug: string;
  published: boolean;
  created_at: string;
  read_time: string;
}

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "How to Get More Clicks on Your Bio Link",
    excerpt: "Learn the psychology behind high-converting link-in-bio pages. From button placement to color contrast, these 7 tips can double your click-through rate.",
    content: "...",
    category: "Growth",
    image_url: "",
    slug: "how-to-get-more-clicks",
    published: true,
    created_at: "2026-03-05T00:00:00Z",
    read_time: "5 min read"
  },
  {
    id: "2",
    title: "Why We Made BIOTRA 100% Free",
    excerpt: "Most link-in-bio tools charge $5-20/month for basic features. Here's why we decided to make everything free — and how we sustain it.",
    content: "...",
    category: "Company",
    image_url: "",
    slug: "why-we-made-biotra-free",
    published: true,
    created_at: "2026-02-28T00:00:00Z",
    read_time: "4 min read"
  },
  {
    id: "3",
    title: "Smart QR Codes: The Future of Offline Marketing",
    excerpt: "QR codes are having a massive comeback. Here's how Biotra's QR Forge lets creators bridge their digital and physical world with zero friction.",
    content: "...",
    category: "Tutorial",
    image_url: "",
    slug: "smart-qr-codes-offline-marketing",
    published: true,
    created_at: "2026-01-15T00:00:00Z",
    read_time: "6 min read"
  },
];

const categoryColors: Record<string, string> = {
  Growth: "bg-[#22C55E] text-black",
  Company: "bg-[#FDE047] text-black",
  Tutorial: "bg-[#FBCFE8] text-black",
  default: "bg-black text-white",
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setPosts(data && data.length > 0 ? data : FALLBACK_POSTS);
      } catch {
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero header */}
          <div className="mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#22C55E] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
              <Zap className="w-3 h-3 fill-black" /> LIVE FEED
            </span>
            <h1 className="text-[80px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85] mb-6">
              THE BLOG.
            </h1>
            <p className="text-sm font-black uppercase tracking-widest text-black/40 max-w-md">
              TIPS, UPDATES, AND STORIES FROM THE BIOTRA TEAM. PUBLISHED WHEN IT MATTERS.
            </p>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">SYNCHRONIZING FEED...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-8">
                {posts.map((post, i) => {
                  const catColor = categoryColors[post.category] || categoryColors.default;
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                      className="group bg-white border-4 border-black rounded-[32px] overflow-hidden shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      <Link to={`/blog/${post.slug}`} className="block">
                        <div className="flex flex-col md:flex-row">
                          {/* Visual */}
                          <div className="md:w-72 h-52 md:h-auto bg-[#F3F4F6] border-b-4 md:border-b-0 md:border-r-4 border-black flex items-center justify-center relative overflow-hidden">
                            <Newspaper className="w-16 h-16 text-black/10 group-hover:scale-110 transition-transform" />
                            <span className={`absolute top-4 left-4 px-3 py-1.5 border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${catColor}`}>
                              {post.category}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-black/30">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {post.read_time}
                                </span>
                              </div>

                              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none group-hover:text-[#22C55E] transition-colors">
                                {post.title}
                              </h2>
                              <p className="text-sm font-bold text-black/50 leading-relaxed line-clamp-2 uppercase tracking-wide">
                                {post.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:text-[#22C55E] transition-colors">
                              READ FULL STORY <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {/* CTA */}
          <div className="text-center mt-24 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">WANT MORE? JOIN THE PLATFORM.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 h-20 px-16 bg-black text-white font-black uppercase tracking-widest text-lg border-4 border-black rounded-3xl shadow-[8px_8px_0_0_rgba(34,197,94,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
            >
              GET STARTED FREE <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default Blog;
