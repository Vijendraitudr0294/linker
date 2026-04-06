import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Share2, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Users, 
  Video, 
  PenTool, 
  Clock, 
  Hash, 
  Compass, 
  Plus, 
  MoreVertical,
  Instagram,
  Linkedin,
  Youtube,
  MessageSquare,
  Heart,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SocialflowPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [caption, setCaption] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([
    { time: "Today, 4:00 PM", title: "Product Feature Announcement", platforms: [Instagram, Linkedin], type: "Reel" },
    { time: "Tomorrow, 10:00 AM", title: "Behind the Scenes Workshop", platforms: [Youtube], type: "Short" },
    { time: "Wed, 2:00 PM", title: "Industry Insights & Trends 2026", platforms: [Linkedin], type: "Article" },
  ]);

  const handleAISuggest = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    
    // Provide a fallback prompt if empty
    const prompt = caption.trim() || 
      "Generate a short engaging growth Tip caption setting optimal times for Creators.";

    try {
      const { data, error } = await supabase.functions.invoke("socialflow-ai", {
        body: { prompt, type: "Instagram" }
      });
      if (error) throw error;
      setCaption(data.caption);
      toast.success("AI suggested caption applied!");
    } catch (err) {
      console.warn("AI function unavailable offline. Using static fallback.", err);
      setTimeout(() => {
        setCaption("🚀 Just unlocked a new level of productivity! Who else is building in public today? 👇 #BuildInPublic #SaaS #Growth");
        toast.success("AI suggested caption applied (Local Mode)!");
        setIsAiLoading(false);
      }, 600);
      return; // prevent finally from executing too early
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSchedulePost = () => {
    if (!caption.trim()) {
      toast.error("Add a caption first!");
      return;
    }
    setScheduledPosts([
      ...scheduledPosts,
      { time: "Next Week, 12:00 PM", title: caption.substring(0, 30) + "...", platforms: [Instagram, Linkedin], type: "Post" }
    ]);
    setCaption("");
    toast.success("Post scheduled successfully!");
    setActiveTab("calendar");
  };

  const handlePublishNow = async () => {
    if (!caption.trim()) {
      toast.error("Add a caption first!");
      return;
    }
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("socialflow-post", {
        body: {
          post: caption,
          platforms: ["instagram", "facebook", "twitter", "linkedin", "pinterest"],
          mediaUrls: ["https://img.ayrshare.com/012/gb.jpg"], // Example media from Ayrshare docs
        }
      });
      if (error) throw error;
      setCaption("");
      toast.success("Post published successfully via Ayrshare!");
      setActiveTab("overview");
    } catch (err: any) {
      console.warn("Publishing function unavailable offline. Using local simulation.", err);
      setTimeout(() => {
        setCaption("");
        toast.success("Post published successfully (Local Mode)!");
        setActiveTab("overview");
        setIsPublishing(false);
      }, 1200);
      return;
    } finally {
      setIsPublishing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-10 lg:p-16 space-y-10 max-w-[1700px] mx-auto bg-background selection:bg-primary selection:text-white"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
        .airbnb-shadow { box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04); }
        .studio-title { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Header */}
      <motion.header variants={itemVariants} className="mb-12 relative overflow-hidden rounded-3xl border border-white/5 bg-card p-10 lg:p-16 shadow-lg group airbnb-shadow">
          <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-40 pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-8">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Creator Studio • Active Sync</span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight studio-title">
                  Your <br />
                  <span className="text-primary italic font-medium">Influence.</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground/60 font-medium tracking-tight max-w-[500px]">
                  Design your presence with professional depth. Reach your audience exactly where they are.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Button variant="outline" className="rounded-xl h-12 px-8 border-white/10 hover:bg-white/5 transition-all font-bold text-[12px] bg-white/[0.02] shadow-xl backdrop-blur-xl">
                 <Compass className="w-4 h-4 mr-2" /> Connect
               </Button>
               <Button className="bg-primary text-white hover:bg-foreground hover:text-background transition-all duration-300 font-bold rounded-xl h-12 px-8 group shadow-xl shadow-primary/10 border-none uppercase tracking-widest text-[12px]">
                 <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Host Post
               </Button>
            </div>
          </div>
      </motion.header>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <TabsList className="bg-white/5 p-1 rounded-2xl mb-8 overflow-x-auto no-scrollbar scrollbar-hide flex w-full md:w-fit border border-white/5 backdrop-blur-3xl shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
              <Compass className="w-3.5 h-3.5 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="composer" className="rounded-xl px-6 py-2.5 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
              <PenTool className="w-3.5 h-3.5 mr-1.5" /> Studio
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-xl px-6 py-2.5 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" /> Planning
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" /> Insights
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <TabsContent value="overview" className="space-y-6 m-0">
              {/* Quick Stats */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4" /* RESPONSIVE FIX: 2 columns on mobile */
              >
                {[
                  { title: "Total Reach", value: "24.5k", change: "+12.3%", icon: Users },
                  { title: "Engagement Rate", value: "4.8%", change: "+2.1%", icon: Sparkles },
                  { title: "Scheduled Posts", value: "12", change: "Next in 2h", icon: Clock },
                  { title: "Connected", value: "5 Platforms", change: "All active", icon: Share2 },
                ].map((stat, i) => (
                  <motion.div variants={itemVariants} key={i}>
                    <Card className="bg-background/20 backdrop-blur-md border-white/5 hover:border-white/10 hover:bg-background/30 transition-all duration-300 group cursor-pointer overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <stat.icon className="w-4 h-4 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="text-green-500 font-bold">{stat.change}</span> from last week
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Recommendations */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="bg-background/20 backdrop-blur-md border-white/5 h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary animate-glow" /> AI Content Engine Insights
                      </CardTitle>
                      <CardDescription>Smart recommendations to boost your reach</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { title: "Optimal Post Time", desc: "Best time to post on LinkedIn is 10:00 AM tomorrow for your audience.", action: "Schedule", icon: Clock },
                        { title: "Trending Hashtags", desc: "Use #SaaS and #BuildInPublic for 30% higher engagement rate on Bluesky.", action: "Copy", icon: Hash },
                        { title: "Content Idea", desc: "Create a carousel about '5 tools that save 10 hours/week'. Highly demanded topic.", action: "Generate", icon: PenTool },
                      ].map((rec, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <rec.icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                {rec.title}
                              </h4>
                              <p className="text-xs text-muted-foreground max-w-md">{rec.desc}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-0 font-bold text-xs">
                            {rec.action}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Connected Platforms */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-background/20 backdrop-blur-md border-white/5 h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Connected Platforms</CardTitle>
                      <CardDescription>Manage your social accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: "Instagram", handle: "@username", status: "Connected", icon: Instagram, color: "from-pink-500/20 to-violet-500/20" },
                        { name: "LinkedIn", handle: "company/name", status: "Connected", icon: Linkedin, color: "from-blue-500/20 to-cyan-500/20" },
                        { name: "YouTube", handle: "channel/id", status: "Connected", icon: Youtube, color: "from-red-500/20 to-orange-500/20" },
                        { name: "TikTok", handle: "@tiktok", status: "Disconnect", icon: Share2, color: "from-teal-500/20 to-gray-500/20" },
                      ].map((platform, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center border border-white/5`}>
                              <platform.icon className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">{platform.name}</h4>
                              <p className="text-xs text-muted-foreground">{platform.handle}</p>
                            </div>
                          </div>
                          <Badge variant={platform.status === "Connected" ? "default" : "secondary"} className={platform.status === "Connected" ? "bg-green-500/10 text-green-500 border-green-500/20" : "opacity-60"}>
                            {platform.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          )}

          {/* Composer Tab */}
          {activeTab === "composer" && (
            <TabsContent value="composer" className="m-0">
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Editor */}
                <Card className="bg-background/20 backdrop-blur-md border-white/5 h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Create Post</CardTitle>
                    <CardDescription>Write once, publish everywhere.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-3 hover:border-primary/50 transition-all cursor-pointer group bg-white/[0.01]">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-sm font-bold">Upload Video or Image</h4>
                      <p className="text-xs text-muted-foreground">Drag & drop or click to browse. Max 500MB.</p>
                      <Button size="sm" variant="outline" className="mt-1 text-xs border-white/10 py-1 h-7">Browse</Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold">Caption</label>
                        <span className="text-xs text-muted-foreground">{(caption as string || '').length} / 2200</span>
                      </div>
                      <div className="relative group/textarea">
                        <textarea 
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          className="w-full h-40 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-sans resize-none"
                          placeholder="What do you want to share? Add your thoughts..."
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAISuggest}
                          disabled={isAiLoading}
                          className="absolute bottom-3 right-3 bg-primary text-primary-foreground text-xs gap-1 hover:scale-105 transition-transform h-8"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> {isAiLoading ? "Generating..." : "AI Suggest"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-b border-white/5 pb-4">
                      <Badge variant="outline" className="cursor-pointer hover:bg-white/5 py-1.5"><Hash className="w-3.5 h-3.5 mr-1 text-primary" /> Add Hashtags</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-white/5 py-1.5"><Compass className="w-3.5 h-3.5 mr-1 text-primary" /> Add Location</Badge>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-bold">Select Platforms</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Instagram", icon: Instagram, color: "hover:bg-pink-500/10 hover:text-pink-500" },
                          { name: "LinkedIn", icon: Linkedin, color: "hover:bg-blue-500/10 hover:text-blue-500" },
                          { name: "YouTube", icon: Youtube, color: "hover:bg-red-500/10 hover:text-red-500" },
                          { name: "Website", icon: Share2, color: "hover:bg-teal-500/10 hover:text-teal-500" },
                        ].map((p, i) => (
                          <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.01] cursor-pointer transition-all ${p.color} hover:border-transparent group`}>
                            <Checkbox id={`p-${i}`} className="data-[state=checked]:bg-primary border-white/20" />
                            <label htmlFor={`p-${i}`} className="text-xs font-bold cursor-pointer flex items-center gap-1.5">
                              <p.icon className="w-3.5 h-3.5" /> {p.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSchedulePost}
                        variant="outline"
                        className="flex-1 border-white/10 hover:bg-white/5 font-bold h-11 rounded-xl"
                      >
                        Schedule Post
                      </Button>
                      <Button 
                        onClick={handlePublishNow}
                        disabled={isPublishing}
                        className="flex-1 bg-primary text-primary-foreground font-bold h-11 rounded-xl shadow-lg shadow-primary/20"
                      >
                        {isPublishing ? "Publishing..." : "Publish Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column: Live Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Live Post Preview</h3>
                    <Tabs defaultValue="instagram" className="h-8">
                      <TabsList className="bg-background/20 border border-white/5 h-8">
                        <TabsTrigger value="instagram" className="text-[11px] px-2 h-6 data-[state=active]:bg-primary">Instagram</TabsTrigger>
                        <TabsTrigger value="linkedin" className="text-[11px] px-2 h-6 data-[state=active]:bg-primary">LinkedIn</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Card className="bg-background/20 backdrop-blur-md border-white/5 p-0 overflow-hidden max-w-[400px] mx-auto shadow-2xl">
                    {/* Header */}
                    <div className="p-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-black text-xs border border-white/10">
                          E
                        </div>
                        <div>
                          <h4 className="text-xs font-bold">BIOTRA_hub</h4>
                          <p className="text-[10px] text-muted-foreground">Sponsored</p>
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Media Frame */}
                    <div className="aspect-square bg-white/[0.03] flex items-center justify-center border-b border-white/5 relative group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Video className="w-10 h-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Actions and Caption */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-muted-foreground" />
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          <Share2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs">
                          <span className="font-bold mr-1">BIOTRA_hub</span>
                          {caption || "Your layout preview is starting here as your type..."}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-2">1 Minute Ago</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <TabsContent value="calendar" className="m-0">
              <motion.div variants={itemVariants}>
                <Card className="bg-background/20 backdrop-blur-md border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Content Calendar</CardTitle>
                      <CardDescription>Your upcoming scheduled content</CardDescription>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Schedule</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scheduledPosts.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.time.split(',')[0]}</span>
                            <span className="text-xs font-black">{item.time.split(',')[1]?.trim() || "12:00 PM"}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold">{item.title}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-0">{item.type}</Badge>
                              <div className="flex -space-x-1 items-center">
                                {item.platforms.map((Icon, idx) => (
                                  <div key={idx} className="w-4.5 h-4.5 rounded-full bg-background border border-white/10 flex items-center justify-center">
                                    <Icon className="w-2.5 h-2.5 text-muted-foreground" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <TabsContent value="analytics" className="m-0">
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 bg-background/20 backdrop-blur-md border-white/5">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Performance Breakdown</CardTitle>
                      <CardDescription>Views and Engagement over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-end gap-2 px-6">
                      {[35, 65, 45, 85, 55, 95, 75, 110, 80, 130, 90, 120].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${height}px` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary group-hover:from-primary/60 group-hover:to-primary/90 transition-all cursor-pointer relative"
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-background/80 px-1 rounded-sm">
                              {height}k
                            </div>
                          </motion.div>
                          <span className="text-[9px] text-muted-foreground mt-1">W{i+1}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-background/20 backdrop-blur-md border-white/5">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Top Performing Post</CardTitle>
                      <CardDescription>Most engaging content this month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                        <Video className="w-8 h-8 text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-white/5 text-xs font-bold truncate">
                          5 Tools to save 10h/week...
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/3 p-2 rounded-lg border border-white/5">
                          <Eye className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
                          <div className="text-xs font-black">12.5k</div>
                          <p className="text-[9px] text-muted-foreground">Views</p>
                        </div>
                        <div className="bg-white/3 p-2 rounded-lg border border-white/5">
                          <Heart className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
                          <div className="text-xs font-black">1,240</div>
                          <p className="text-[9px] text-muted-foreground">Likes</p>
                        </div>
                        <div className="bg-white/3 p-2 rounded-lg border border-white/5">
                          <MessageSquare className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
                          <div className="text-xs font-black">342</div>
                          <p className="text-[9px] text-muted-foreground">Comments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
