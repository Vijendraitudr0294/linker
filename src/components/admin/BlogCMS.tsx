import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, Save, X, Search, FileText, Check,
  Layout, Image as ImageIcon, Calendar, Clock, Tag,
  Globe, Eye, ChevronRight, MessageSquare, Newspaper
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
      const { data, error } = await supabase.from("pricing_plans" as any).select("*").order("sort_order", { ascending: true });
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
        .order("sort_order", { ascending: true });
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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      // In local dev without the table, we might need some initial data
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
      read_time: "5 min read"
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
          sort_order: faqs.length,
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-black" /> Content Matrix
          </h2>
          <p className="text-gray-400 text-sm font-medium">Global orchestration of platform narratives and intelligence.</p>
        </div>
        <div className="flex flex-wrap flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl sm:mr-4 border-2 border-black/5">
             <button 
              onClick={() => setActiveTab("blog")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "blog" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >Articles</button>
             <button 
              onClick={() => setActiveTab("faq")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "faq" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >FAQ Matrix</button>
             <button 
              onClick={() => setActiveTab("pricing")}
              className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all", activeTab === "pricing" ? "bg-black text-white shadow-md" : "text-black/40 hover:text-black")}
             >Pricing Units</button>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Filter Stream..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 w-full sm:w-48 border-2 border-gray-100 focus:border-black rounded-xl text-xs font-bold uppercase tracking-widest bg-white"
            />
          </div>
          <Button 
            onClick={() => {
              if (activeTab === "blog") handleCreate();
              else if (activeTab === "faq") {
                setCurrentFaq({ question: "", answer: "" });
                setIsEditing(true);
              } else {
                setCurrentPlan({ name: "", price: "0", features: [] });
                setIsEditing(true);
              }
            }}
            className="h-11 px-6 bg-black text-white font-black uppercase tracking-widest rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === "blog" ? "Post" : activeTab === "faq" ? "FAQ" : "Plan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {activeTab === "blog" ? filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="group relative border-2 border-black p-0 overflow-hidden bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.05)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 h-auto sm:min-h-full bg-gray-50 flex flex-row sm:flex-col items-center justify-center p-4 border-b-2 sm:border-b-0 sm:border-r-2 border-black select-none gap-4 sm:gap-0">
                     <div className="w-12 h-12 rounded-xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-gray-200" />
                     </div>
                     <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest">No Media</span>
                  </div>
                  <div className="flex-1 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                        post.published ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {post.published ? "Live" : "Draft"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] font-black text-gray-400">{format(new Date(post.created_at), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-black leading-tight uppercase line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-xs font-medium line-clamp-2 italic">"{post.excerpt}"</p>
                    
                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-black/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{post.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(post)}
                          className="w-8 h-8 rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(post.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )) : activeTab === "faq" ? faqs.map((faq) => (
             <motion.div
               key={faq.id}
               layout
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white border-2 border-black rounded-2xl p-6 flex items-start gap-4 group hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
             >
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-black text-xs">Q</div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-black uppercase tracking-tight text-sm mb-2">{faq.question}</h4>
                   <p className="text-gray-500 text-xs font-medium line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex flex-col gap-2">
                   <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => { setCurrentFaq(faq); setIsEditing(true); }}><Edit3 className="w-3 h-3" /></Button>
                   <Button size="icon" variant="ghost" className="w-8 h-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteFaq(faq.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
             </motion.div>
          )) : plans.map((plan) => (
             <motion.div 
               key={plan.id}
               className="bg-white border-2 border-black rounded-3xl p-8 relative overflow-hidden group hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all"
             >
                {plan.is_popular && <div className="absolute top-0 right-0 bg-yellow-400 border-l-2 border-b-2 border-black px-4 py-1 text-[8px] font-black uppercase">Popular</div>}
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">{plan.name}</span>
                     <div className="text-3xl font-[1000] mt-1">{plan.currency || "$"}{plan.price}</div>
                   </div>
                   <div className="flex gap-2">
                     <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => { setCurrentPlan(plan); setIsEditing(true); }}><Edit3 className="w-3 h-3" /></Button>
                   </div>
                </div>
                <div className="space-y-2 mb-8">
                   {plan.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="text-[10px] font-bold uppercase flex items-center gap-2">
                         <Check className="w-3 h-3 text-emerald-500" /> {f}
                      </div>
                   ))}
                </div>
                <Badge className={cn("text-[9px] font-black uppercase", plan.published ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                   {plan.published ? "Public Grid" : "Internal Only"}
                </Badge>
             </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white border-4 border-dashed border-gray-100 rounded-3xl">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-200" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight mb-2">The editor's desk is empty</h3>
             <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">Start writing your first article and share it with the BIOTRA community.</p>
             <Button 
              onClick={handleCreate}
              className="mt-6 bg-black text-white font-black uppercase tracking-widest h-11 px-8 rounded-xl"
             >
               Initialize Stream
             </Button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white border-2 border-black rounded-[40px] shadow-3xl overflow-hidden flex flex-col"
            >
              {/* Internal Header */}
              <div className="p-6 sm:p-8 border-b-2 border-black bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-10 w-full overflow-hidden">
                <div className="flex items-center gap-4 max-w-full">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-black text-white flex items-center justify-center">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none truncate">
                      {currentPost?.id ? "Edit Narrative" : "New Creation"}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 truncate">Article Stream Interface</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="font-black uppercase tracking-widest text-xs h-11 px-6 rounded-xl hover:bg-gray-50"
                  >
                    Discard Changes
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="bg-emerald-500 text-white font-black uppercase tracking-widest h-11 px-8 rounded-xl shadow-[4px_4px_0_0_rgba(16,185,129,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" /> Commit to Matrix
                  </Button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
                {activeTab === "blog" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Content Inputs */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2 flex items-center gap-2">
                          <Layout className="w-3.5 h-3.5 text-black" /> Attention Headline
                        </label>
                        <Input 
                          value={currentPost?.title}
                          onChange={(e) => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                          className="h-16 text-2xl font-black uppercase border-2 border-gray-100 focus:border-black rounded-2xl px-6 bg-gray-50/30"
                          placeholder="Enter dynamic headline..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2 flex items-center gap-2">
                          <Newspaper className="w-3.5 h-3.5 text-black" /> Narrative Body (Markdown Supported)
                        </label>
                        <Textarea 
                          value={currentPost?.content}
                          onChange={(e) => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                          className="min-h-[400px] font-mono text-sm border-2 border-gray-100 focus:border-black rounded-[32px] p-8 bg-gray-50/30 leading-relaxed"
                          placeholder="# Your story starts here..."
                        />
                      </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <div className="space-y-8 p-8 bg-gray-50/50 border-2 border-black rounded-[32px]">
                      <h4 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Globe className="w-4 h-4" /> Global Settings
                      </h4>
                      
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Engagement Hook (Excerpt)</label>
                          <Textarea 
                            value={currentPost?.excerpt}
                            onChange={(e) => setCurrentPost(prev => ({ ...prev, excerpt: e.target.value }))}
                            className="text-xs font-bold border-2 border-black/5 focus:border-black rounded-xl p-4 min-h-[100px]"
                            placeholder="Brief preview text..."
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Classification</label>
                            <Input 
                              value={currentPost?.category}
                              onChange={(e) => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                              className="h-11 border-2 border-black/5 focus:border-black rounded-xl text-xs font-bold uppercase"
                              placeholder="e.g. GROWTH, PRODUCT"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Temporal Slug</label>
                            <Input 
                              value={currentPost?.slug}
                              onChange={(e) => setCurrentPost(prev => ({ ...prev, slug: e.target.value }))}
                              className="h-11 border-2 border-black/5 focus:border-black rounded-xl text-xs font-bold lowercase"
                              placeholder="custom-slug-here"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Temporal Duration</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                            <Input 
                              value={currentPost?.read_time}
                              onChange={(e) => setCurrentPost(prev => ({ ...prev, read_time: e.target.value }))}
                              className="pl-10 h-11 border-2 border-black/5 focus:border-black rounded-xl text-xs font-bold"
                              placeholder="5 min read"
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-black/10">
                          <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-2xl">
                            <div>
                              <p className="text-[10px] font-black uppercase">Publish Node</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Visible to Public Grid</p>
                            </div>
                            <motion.button
                              onClick={() => setCurrentPost(prev => ({ ...prev, published: !prev?.published }))}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-colors border-2 border-black",
                                currentPost?.published ? "bg-emerald-500" : "bg-gray-200"
                              )}
                            >
                              <motion.div 
                                animate={{ x: currentPost?.published ? 24 : 2 }}
                                className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5"
                              />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "faq" ? (
                  <div className="max-w-2xl mx-auto space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Core Question</label>
                        <Input 
                          value={currentFaq?.question}
                          onChange={(e) => setCurrentFaq(prev => ({ ...prev, question: e.target.value }))}
                          className="h-14 text-xl font-black uppercase border-2 border-black focus:border-primary rounded-xl px-6"
                          placeholder="WHAT IS THE MEANING OF..."
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Established Answer</label>
                        <Textarea 
                          value={currentFaq?.answer}
                          onChange={(e) => setCurrentFaq(prev => ({ ...prev, answer: e.target.value }))}
                          className="min-h-[200px] text-sm font-bold border-2 border-black focus:border-primary rounded-[24px] p-6"
                          placeholder="PROVIDE THE CORE TRUTH HERE..."
                        />
                     </div>
                     <Button 
                      onClick={handleSaveFaq}
                      className="w-full h-14 bg-black text-white font-black uppercase tracking-widest rounded-xl"
                     >Commit FAQ to Database</Button>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase">Plan Title</label>
                           <Input 
                            value={currentPlan?.name}
                            onChange={(e) => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))}
                            className="h-14 font-black uppercase border-2 border-black"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase">Price Point</label>
                           <Input 
                            value={currentPlan?.price}
                            onChange={(e) => setCurrentPlan(prev => ({ ...prev, price: e.target.value }))}
                            className="h-14 font-black border-2 border-black"
                           />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase">Feature Protocol (One per line)</label>
                        <Textarea 
                          value={currentPlan?.features?.join('\n')}
                          onChange={(e) => setCurrentPlan(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                          className="min-h-[150px] font-bold border-2 border-black"
                        />
                     </div>
                     <div className="flex flex-wrap items-center gap-4 sm:gap-8 p-6 bg-gray-50 border-2 border-dashed border-black rounded-2xl">
                        <button 
                          onClick={() => setCurrentPlan(prev => ({ ...prev, is_popular: !prev?.is_popular }))}
                          className={cn("px-4 py-2 text-[10px] font-black uppercase border-2 border-black transition-all", currentPlan?.is_popular ? "bg-yellow-400" : "bg-white")}
                        >Popularity Flag</button>
                        <button 
                          onClick={() => setCurrentPlan(prev => ({ ...prev, published: !prev?.published }))}
                          className={cn("px-4 py-2 text-[10px] font-black uppercase border-2 border-black transition-all", currentPlan?.published ? "bg-emerald-500 text-white" : "bg-white")}
                        >Visibility Sync</button>
                     </div>
                     <Button 
                      onClick={async () => {
                        try {
                          let error;
                          if (currentPlan?.id) {
                            const { error: err } = await supabase.from("pricing_plans" as any).update(currentPlan).eq("id", currentPlan.id);
                            error = err;
                          } else {
                            const { error: err } = await supabase.from("pricing_plans" as any).insert([currentPlan]);
                            error = err;
                          }
                          if (error) throw error;
                          toast.success("Pricing optimized");
                          setIsEditing(false);
                          fetchPlans();
                        } catch (err) { toast.error("Fail"); }
                      }}
                      className="w-full h-14 bg-black text-white font-black uppercase tracking-widest rounded-xl"
                     >Update Pricing Architecture</Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
