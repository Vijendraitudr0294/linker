import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, Save, X, Search, FileText, Check,
  Layout, Image as ImageIcon, Calendar, Clock, Tag,
  Globe, Eye, ChevronRight, MessageSquare, Newspaper,
  Sparkles, Wand2, Loader2, TrendingUp, Zap, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper: call Gemini API
const callGemini = async (prompt: string, maxTokens = 4096): Promise<string> => {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env");
  
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty AI response");
  return text;
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  author_id: string;
  slug: string;
  published: boolean;
  created_at: string;
  read_time: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  currency: string;
  billing_cycle: string;
  description: string;
  features: string[];
  button_text: string;
  is_popular: boolean;
  published: boolean;
}

export const ContentCMS = () => {
  const [activeTab, setActiveTab ] = useState<"blog" | "faq" | "pricing">("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [currentFaq, setCurrentFaq] = useState<Partial<FAQItem> | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<PricingPlan> | null>(null);
  const [search, setSearch] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiWriting, setAiWriting] = useState(false);
  const [aiImageGen, setAiImageGen] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (activeTab === "blog") fetchPosts();
    else if (activeTab === "faq") fetchFaqs();
    else fetchPlans();
  }, [activeTab]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("pricing_plans" as any).select("*").order("sort_order", { ascending: true }) as { data: PricingPlan[] | null, error: any };
      if (error) throw error;
      setPlans(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("faq_items" as any)
        .select("*")
        .order("sort_order", { ascending: true }) as { data: FAQItem[] | null, error: any };
      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .order("created_at", { ascending: false }) as { data: BlogPost[] | null, error: any };
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      if (posts.length === 0) {
         setPosts([
           {
             id: "1",
             title: "How to Get More Clicks on Your Bio Link",
             excerpt: "Learn the psychology behind high-converting link-in-bio pages.",
             content: "Full content here...",
             category: "Growth",
             image_url: "",
             author_id: "admin",
             slug: "how-to-get-more-clicks",
             published: true,
             created_at: new Date().toISOString(),
             read_time: "5 min read"
           }
         ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentPost({
      title: "",
      excerpt: "",
      content: "",
      category: "General",
      published: false,
      slug: "",
      read_time: "5 min read",
      seo_title: "",
      seo_description: "",
      seo_keywords: ""
    });
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const { error } = await supabase.from("blog_posts" as any).delete().eq("id", id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const handleSave = async () => {
    if (!currentPost?.title || !currentPost?.content) {
      toast.error("Title and Content are required");
      return;
    }

    try {
      const slug = currentPost.slug || currentPost.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      const postToSave = {
        ...currentPost,
        slug,
        updated_at: new Date().toISOString()
      };

      let error;
      if (currentPost.id) {
        const { error: err } = await supabase.from("blog_posts" as any).update(postToSave).eq("id", currentPost.id);
        error = err;
      } else {
        const { error: err } = await supabase.from("blog_posts" as any).insert([postToSave]);
        error = err;
      }

      if (error) throw error;
      
      toast.success("Post saved successfully");
      setIsEditing(false);
      setCurrentPost(null);
      fetchPosts();
    } catch (err) {
      toast.error("Failed to save post");
    }
  };

  const handleSaveFaq = async () => {
    if (!currentFaq?.question || !currentFaq?.answer) {
      toast.error("Question and Answer are required");
      return;
    }

    try {
      let error;
      if (currentFaq.id) {
        const { error: err } = await supabase.from("faq_items" as any).update(currentFaq).eq("id", currentFaq.id);
        error = err;
      } else {
        const { error: err } = await supabase.from("faq_items" as any).insert([{
          ...currentFaq,
          sort_order: faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order || 0)) + 1 : 0,
          published: true
        }]);
        error = err;
      }

      if (error) throw error;
      
      toast.success("FAQ saved successfully");
      setIsEditing(false);
      setCurrentFaq(null);
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to save FAQ");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await supabase.from("faq_items" as any).delete().eq("id", id);
      fetchFaqs();
      toast.success("FAQ purged");
    } catch (err) { toast.error("Failed"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      setUploadingImage(true);
      
      const { error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      setCurrentPost(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Write — generates full blog content from title
  const handleAIWrite = async () => {
    const title = currentPost?.title?.trim();
    if (!title) {
      toast.error("Enter a title first so AI knows what to write about");
      return;
    }

    setAiWriting(true);
    try {
      const text = await callGemini(`You are a professional blog writer for Biotra (biotra.cc), a link-in-bio platform for creators.

Write a complete SEO-optimized blog post about: "${title}"

Requirements:
- Write in markdown format
- Include a compelling intro paragraph (hook the reader in first 2 sentences)
- Use 3-5 subheadings (## format)
- Include actionable tips, real-world examples, and statistics
- Keep it between 800-1200 words
- Professional but friendly tone
- Naturally include keywords related to the topic
- End with a call-to-action mentioning Biotra
- Make it rank-worthy for Google

Provide at the TOP of your response (before the markdown content):
EXCERPT: [1-2 sentence compelling description for SEO meta description, max 160 chars]
CATEGORY: [one of: Growth, Product, Tips, Marketing, Design, Creator Economy]
READ_TIME: [X min read]
SEO_TITLE: [60 char max SEO title with primary keyword]
SEO_KEYWORDS: [5-8 comma-separated keywords]
---
[full markdown blog content here]`);

      const excerptMatch = text.match(/EXCERPT:\s*(.+)/i);
      const categoryMatch = text.match(/CATEGORY:\s*(.+)/i);
      const readTimeMatch = text.match(/READ_TIME:\s*(.+)/i);
      const seoTitleMatch = text.match(/SEO_TITLE:\s*(.+)/i);
      const seoKeywordsMatch = text.match(/SEO_KEYWORDS:\s*(.+)/i);
      const contentStart = text.indexOf("---");
      const content = contentStart !== -1 ? text.slice(contentStart + 3).trim() : text;

      setCurrentPost(prev => ({
        ...prev,
        content,
        excerpt: excerptMatch?.[1]?.trim() || prev?.excerpt || "",
        category: categoryMatch?.[1]?.trim() || prev?.category || "General",
        read_time: readTimeMatch?.[1]?.trim() || prev?.read_time || "5 min read",
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        seo_title: seoTitleMatch?.[1]?.trim() || title,
        seo_keywords: seoKeywordsMatch?.[1]?.trim() || "",
        seo_description: excerptMatch?.[1]?.trim() || "",
      }));

      toast.success("AI content generated!");
    } catch (err: any) {
      console.error("AI Write error:", err);
      toast.error(err.message || "AI generation failed");
    } finally {
      setAiWriting(false);
    }
  };

  // AI Image — generates blog cover image from Unsplash
  const handleAIImage = async () => {
    const title = currentPost?.title?.trim();
    if (!title) {
      toast.error("Enter a title first");
      return;
    }

    setAiImageGen(true);
    try {
      const query = await callGemini(
        `Given this blog post title: "${title}"\n\nGenerate a single short search query (3-5 words) to find a perfect stock photo for this blog post's cover. Return ONLY the search query, nothing else.`,
        100
      );

      const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(query.trim())}`;
      setCurrentPost(prev => ({ ...prev, image_url: imageUrl }));
      toast.success(`Cover image set for: "${query.trim()}"`);
    } catch (err: any) {
      console.error("AI Image error:", err);
      toast.error(err.message || "Image generation failed");
    } finally {
      setAiImageGen(false);
    }
  };

  // Auto Generate SEO Blog — AI picks a trending topic and writes a full post
  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    try {
      const topicResponse = await callGemini(`You are a content strategist for Biotra (biotra.cc), a link-in-bio platform for creators worldwide.

Generate a trending, SEO-valuable blog post idea that would:
1. Rank well on Google for creator economy / link in bio related searches
2. Be relevant to creators, influencers, small businesses, restaurants, real estate agents
3. Target long-tail keywords with low competition but good traffic
4. Be timely and relevant to current market trends

Consider these categories: Growth Hacks, Social Media Tips, Creator Economy, Link in Bio, Digital Marketing, Small Business, SEO, Personal Branding, TikTok/Instagram Strategy

Return ONLY the blog post title, nothing else. Make it compelling and keyword-rich.`, 100);

      const title = topicResponse.trim().replace(/^["']|["']$/g, '');
      
      // Set the title and trigger AI write
      setCurrentPost({
        title,
        excerpt: "",
        content: "",
        category: "General",
        published: false,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        read_time: "5 min read",
      });
      setIsEditing(true);

      toast.success(`Topic generated: "${title}". Click 'AI Write' to generate the full post!`);
    } catch (err: any) {
      console.error("Auto generate error:", err);
      toast.error(err.message || "Auto generation failed");
    } finally {
      setAutoGenerating(false);
    }
  };

  // ─── EDITOR VIEW (Full Page) ───
  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsEditing(false); setCurrentPost(null); setCurrentFaq(null); setCurrentPlan(null); }}
              className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {activeTab === "blog" ? (currentPost?.id ? "Edit Post" : "New Post") : activeTab === "faq" ? "Edit FAQ" : "Edit Plan"}
              </h2>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Full Editor Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => { setIsEditing(false); setCurrentPost(null); setCurrentFaq(null); setCurrentPlan(null); }}
              className="font-black uppercase tracking-widest text-xs h-10 px-5 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={activeTab === "blog" ? handleSave : activeTab === "faq" ? handleSaveFaq : async () => {
                try {
                  let error;
                  if (currentPlan?.id) {
                    const { error: err } = await supabase.from("pricing_plans" as any).update(currentPlan).eq("id", currentPlan.id);
                    error = err;
                  } else {
                    const { error: err } = await supabase.from("pricing_plans" as any).insert([{
                      ...currentPlan,
                      sort_order: plans.length > 0 ? Math.max(...plans.map(p => (p as any).sort_order || 0)) + 1 : 0,
                      published: currentPlan?.published ?? true
                    }]);
                    error = err;
                  }
                  if (error) throw error;
                  toast.success("Saved!");
                  setIsEditing(false);
                  fetchPlans();
                } catch (err) { toast.error("Failed"); }
              }}
              className="bg-emerald-500 text-white font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl shadow-[4px_4px_0_0_rgba(16,185,129,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Save className="w-4 h-4 mr-2" /> Save & Publish
            </Button>
          </div>
        </div>

        {/* Blog Editor */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1 flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5" /> Headline
                </label>
                <Input 
                  value={currentPost?.title || ""}
                  onChange={(e) => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                  className="h-14 text-xl font-black uppercase border-2 border-black/10 focus:border-black rounded-2xl px-5 bg-white"
                  placeholder="Your blog post title..."
                />
              </div>

              {/* AI Buttons */}
              <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-violet-50 to-amber-50 border-2 border-dashed border-black/10 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-widest text-black/40 flex items-center gap-1 mr-2"><Sparkles className="w-3 h-3" /> AI Tools</span>
                <Button
                  type="button"
                  onClick={handleAIWrite}
                  disabled={aiWriting || !currentPost?.title?.trim()}
                  className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[9px] rounded-lg transition-all disabled:opacity-40"
                >
                  {aiWriting ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Writing...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Write</>}
                </Button>
                <Button
                  type="button"
                  onClick={handleAIImage}
                  disabled={aiImageGen || !currentPost?.title?.trim()}
                  className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[9px] rounded-lg transition-all disabled:opacity-40"
                >
                  {aiImageGen ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Finding...</> : <><Wand2 className="w-3.5 h-3.5 mr-1.5" /> AI Image</>}
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1 flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5" /> Content (Markdown)
                </label>
                <Textarea 
                  value={currentPost?.content || ""}
                  onChange={(e) => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[450px] font-mono text-sm border-2 border-black/10 focus:border-black rounded-2xl p-5 bg-white leading-relaxed"
                  placeholder="# Your story starts here..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Excerpt */}
              <Card className="p-5 border-2 border-black rounded-2xl space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" /> SEO & Meta
                </h4>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Excerpt / Meta Description</label>
                  <Textarea 
                    value={currentPost?.excerpt || ""}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="text-xs font-bold border-2 border-black/5 focus:border-black rounded-xl p-3 min-h-[80px]"
                    placeholder="Brief preview text for search results..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">SEO Keywords</label>
                  <Input 
                    value={currentPost?.seo_keywords || ""}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    className="h-10 border-2 border-black/5 focus:border-black rounded-xl text-xs font-bold"
                    placeholder="keyword1, keyword2, keyword3..."
                  />
                </div>
              </Card>

              {/* Cover Image */}
              <Card className="p-5 border-2 border-black rounded-2xl space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Cover Image
                </h4>
                
                <div className="flex gap-2">
                  <Input 
                    value={currentPost?.image_url || ""}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, image_url: e.target.value }))}
                    className="h-10 border-2 border-black/5 focus:border-black rounded-xl text-xs font-bold flex-1"
                    placeholder="https://..."
                  />
                  <div className="relative shrink-0">
                    <Button variant="outline" size="sm" className={cn("h-10 border-2 border-black/5 rounded-xl", uploadingImage && "opacity-50")}>
                      <ImageIcon className="w-3.5 h-3.5 mr-1" /> {uploadingImage ? "..." : "Upload"}
                    </Button>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingImage} />
                  </div>
                </div>
                {currentPost?.image_url && (
                  <div className="w-full h-36 rounded-xl border-2 border-black overflow-hidden">
                    <img src={currentPost.image_url} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </Card>

              {/* Settings */}
              <Card className="p-5 border-2 border-black rounded-2xl space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Settings
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-black/40">Category</label>
                    <Input 
                      value={currentPost?.category || ""}
                      onChange={(e) => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                      className="h-10 border-2 border-black/5 rounded-xl text-xs font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-black/40">Read Time</label>
                    <Input 
                      value={currentPost?.read_time || ""}
                      onChange={(e) => setCurrentPost(prev => ({ ...prev, read_time: e.target.value }))}
                      className="h-10 border-2 border-black/5 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-black/40">URL Slug</label>
                  <Input 
                    value={currentPost?.slug || ""}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, slug: e.target.value }))}
                    className="h-10 border-2 border-black/5 rounded-xl text-xs font-bold lowercase"
                    placeholder="auto-generated-slug"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black/5 rounded-xl">
                  <div>
                    <p className="text-[10px] font-black uppercase">Publish</p>
                    <p className="text-[8px] text-black/40 font-bold uppercase">Visible on /blog</p>
                  </div>
                  <button
                    onClick={() => setCurrentPost(prev => ({ ...prev, published: !prev?.published }))}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-colors border-2 border-black",
                      currentPost?.published ? "bg-emerald-500" : "bg-gray-200"
                    )}
                  >
                    <div 
                      className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                      style={{ left: currentPost?.published ? '22px' : '2px' }}
                    />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* FAQ Editor */}
        {activeTab === "faq" && (
          <div className="max-w-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Question</label>
              <Input 
                value={currentFaq?.question || ""}
                onChange={(e) => setCurrentFaq(prev => ({ ...prev, question: e.target.value }))}
                className="h-14 text-lg font-black uppercase border-2 border-black rounded-xl px-5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Answer</label>
              <Textarea 
                value={currentFaq?.answer || ""}
                onChange={(e) => setCurrentFaq(prev => ({ ...prev, answer: e.target.value }))}
                className="min-h-[200px] text-sm font-bold border-2 border-black rounded-xl p-5"
              />
            </div>
          </div>
        )}

        {/* Pricing Editor */}
        {activeTab === "pricing" && (
          <div className="max-w-2xl space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Plan Name</label>
                <Input value={currentPlan?.name || ""} onChange={(e) => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))} className="h-12 font-black uppercase border-2 border-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Price</label>
                <Input value={currentPlan?.price || ""} onChange={(e) => setCurrentPlan(prev => ({ ...prev, price: e.target.value }))} className="h-12 font-black border-2 border-black" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Features (one per line)</label>
              <Textarea value={currentPlan?.features?.join('\n') || ""} onChange={(e) => setCurrentPlan(prev => ({ ...prev, features: e.target.value.split('\n') }))} className="min-h-[120px] font-bold border-2 border-black" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPlan(prev => ({ ...prev, is_popular: !prev?.is_popular }))} className={cn("px-4 py-2 text-[10px] font-black uppercase border-2 border-black rounded-lg", currentPlan?.is_popular ? "bg-yellow-400" : "bg-white")}>Popular Flag</button>
              <button onClick={() => setCurrentPlan(prev => ({ ...prev, published: !prev?.published }))} className={cn("px-4 py-2 text-[10px] font-black uppercase border-2 border-black rounded-lg", currentPlan?.published ? "bg-emerald-500 text-white" : "bg-white")}>Published</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-black" /> Content Matrix
          </h2>
          <p className="text-gray-400 text-sm font-medium">Manage blog posts, FAQs, and pricing.</p>
        </div>
        <div className="flex flex-wrap flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Tabs */}
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl sm:mr-2 border-2 border-black/5">
             <button 
              onClick={() => setActiveTab("blog")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "blog" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >Articles</button>
             <button 
              onClick={() => setActiveTab("faq")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "faq" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >FAQ</button>
             <button 
              onClick={() => setActiveTab("pricing")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "pricing" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >Pricing</button>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 w-full sm:w-40 border-2 border-gray-100 focus:border-black rounded-xl text-xs font-bold"
            />
          </div>

          {/* Auto Generate */}
          {activeTab === "blog" && (
            <Button 
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
              className="h-10 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-[3px_3px_0_0_rgba(139,92,246,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {autoGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</> : <><TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Auto SEO Post</>}
            </Button>
          )}

          {/* Add button */}
          <Button 
            onClick={() => {
              if (activeTab === "blog") handleCreate();
              else if (activeTab === "faq") { setCurrentFaq({ question: "", answer: "" }); setIsEditing(true); }
              else { setCurrentPlan({ name: "", price: "0", features: [] }); setIsEditing(true); }
            }}
            className="h-10 px-5 bg-black text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-[3px_3px_0_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add {activeTab === "blog" ? "Post" : activeTab === "faq" ? "FAQ" : "Plan"}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {activeTab === "blog" ? filteredPosts.map((post) => (
            <motion.div key={post.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="group relative border-2 border-black p-0 overflow-hidden bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-28 h-28 sm:h-auto bg-gray-50 flex items-center justify-center border-b-2 sm:border-b-0 sm:border-r-2 border-black relative overflow-hidden">
                     {post.image_url ? (
                       <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                     ) : (
                       <ImageIcon className="w-8 h-8 text-gray-200" />
                     )}
                  </div>
                  <div className="flex-1 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                        post.published ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {post.published ? "Live" : "Draft"}
                      </Badge>
                      <span className="text-[8px] font-black text-black/30">{format(new Date(post.created_at), "MMM dd, yyyy")}</span>
                    </div>
                    <h3 className="text-sm font-black leading-tight uppercase line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-[11px] font-medium line-clamp-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-black/30">{post.category}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="w-7 h-7 rounded-lg hover:bg-black hover:text-white"><Edit3 className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )) : activeTab === "faq" ? faqs.map((faq) => (
             <motion.div key={faq.id} className="bg-white border-2 border-black rounded-2xl p-6 flex gap-4 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all">
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase">{faq.question}</h3>
                  <p className="text-[11px] text-black/50 font-medium mt-2 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex flex-col gap-1">
                   <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => { setCurrentFaq(faq); setIsEditing(true); }}><Edit3 className="w-3 h-3" /></Button>
                   <Button size="icon" variant="ghost" className="w-7 h-7 text-red-500 hover:bg-red-50" onClick={() => handleDeleteFaq(faq.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
             </motion.div>
          )) : plans.map((plan) => (
             <motion.div key={plan.id} className="bg-white border-2 border-black rounded-2xl p-6 relative hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all">
                {plan.is_popular && <div className="absolute top-0 right-0 bg-yellow-400 border-l-2 border-b-2 border-black px-3 py-1 text-[8px] font-black uppercase">Popular</div>}
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">{plan.name}</span>
                     <div className="text-2xl font-[1000] mt-1">{plan.currency || "$"}{plan.price}</div>
                   </div>
                   <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => { setCurrentPlan(plan); setIsEditing(true); }}><Edit3 className="w-3 h-3" /></Button>
                </div>
                <div className="space-y-1.5 mb-4">
                   {plan.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="text-[10px] font-bold uppercase flex items-center gap-2"><Check className="w-3 h-3 text-emerald-500" /> {f}</div>
                   ))}
                </div>
                <Badge className={cn("text-[8px] font-black uppercase", plan.published ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                   {plan.published ? "Live" : "Draft"}
                </Badge>
             </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
