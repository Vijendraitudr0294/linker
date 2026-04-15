import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Zap } from "lucide-react";
import { motion } from "framer-motion";
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
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

// Simple markdown to HTML (handles headings, bold, italic, links, lists)
const renderMarkdown = (md: string): string => {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-black uppercase tracking-tight mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-black uppercase tracking-tight mt-10 mb-4 border-b-4 border-black pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black uppercase tracking-tighter mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 underline decoration-2 hover:text-black transition-colors" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm font-bold text-black/70 flex items-start gap-2 mb-2"><span class="text-emerald-500 mt-1">▸</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-sm font-bold text-black/70 flex items-start gap-2 mb-2"><span class="text-emerald-500 font-black">$1.</span><span>$2</span></li>')
    .replace(/\n\n/g, '</p><p class="text-sm font-medium text-black/70 leading-relaxed mb-4">')
    .replace(/\n/g, '<br/>');
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();
        if (error) throw error;
        setPost(data as BlogPost);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  // Dynamic document title & meta for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.seo_title || post.title} | Biotra Blog`;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.seo_description || post.excerpt);
      
      // Update OG tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", post.seo_title || post.title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", post.seo_description || post.excerpt);
      if (post.image_url) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute("content", post.image_url);
      }
    }
    
    return () => {
      document.title = "Biotra – The #1 Commission-Free Link in Bio for Creators";
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] font-sans">
        <BiotraCCNavbar />
        <div className="pt-40 pb-24 px-6 text-center">
          <h1 className="text-6xl font-black uppercase">404</h1>
          <p className="text-sm font-bold text-black/40 uppercase mt-4">Post not found</p>
          <Link to="/blog" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-black text-white font-black uppercase text-xs rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <article className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black mb-8 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All Posts
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#22C55E] border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_black]">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-black text-black/30 uppercase">
                <Calendar className="w-3 h-3" />
                {new Date(post.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-black text-black/30 uppercase">
                <Clock className="w-3 h-3" />
                {post.read_time}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              {post.title}
            </h1>

            <p className="text-sm font-bold text-black/50 uppercase tracking-wide leading-relaxed max-w-xl">
              {post.excerpt}
            </p>
          </motion.header>

          {/* Cover Image */}
          {post.image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 rounded-[24px] border-4 border-black overflow-hidden shadow-[8px_8px_0_0_black]"
            >
              <img src={post.image_url} alt={post.title} className="w-full h-64 sm:h-80 object-cover" />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose-biotra bg-white border-4 border-black rounded-[32px] p-8 sm:p-12 shadow-[8px_8px_0_0_rgba(0,0,0,0.05)]"
          >
            <div
              className="text-sm font-medium text-black/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: `<p class="text-sm font-medium text-black/70 leading-relaxed mb-4">${renderMarkdown(post.content)}</p>` }}
            />
          </motion.div>

          {/* Footer CTA */}
          <div className="mt-16 text-center space-y-6 bg-white border-4 border-black rounded-[32px] p-10 shadow-[8px_8px_0_0_rgba(34,197,94,0.3)]">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#22C55E] border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_black]">
              <Zap className="w-3 h-3 fill-black" /> Ready to grow?
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Start Building Your Bio Page</h3>
            <p className="text-xs font-bold text-black/40 uppercase">Join 50,000+ creators using Biotra. Free forever.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 h-14 px-10 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(34,197,94,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              GET STARTED FREE
            </Link>
          </div>

          {/* SEO Keywords (hidden visually, helpful for crawlers) */}
          {post.seo_keywords && (
            <div className="sr-only" aria-hidden="true">
              Keywords: {post.seo_keywords}
            </div>
          )}
        </div>
      </article>

      <BiotraCCFooter />
    </div>
  );
};

export default BlogPostPage;
