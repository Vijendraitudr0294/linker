import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, MoveUp, MoveDown, Layout, Type, Image as ImageIcon, Link as LinkIcon, Eye, Settings, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MarketingPage, MarketingSection } from "@/types/marketing";
import { DEFAULT_HOME_PAGE } from "@/lib/marketingDefaults";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const MarketingCMS = () => {
  const [page, setPage] = useState<MarketingPage>(DEFAULT_HOME_PAGE);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from("marketing_content")
        .select("*")
        .eq("slug", "home")
        .single();
      
      if (data) {
        setPage(data as MarketingPage);
      }
    } catch (err) {
      console.warn("No marketing content found in DB, using defaults.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("marketing_content")
        .upsert([{
          id: page.id || "home",
          slug: page.slug || "home",
          title: page.title || "Home Page",
          sections: page.sections,
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      toast.success("Design saved to Master Database");
    } catch (err) {
      toast.error("Cloud synchronization failed");
    }
  };

  const updateSection = (id: string, updates: Partial<MarketingSection>) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = page.sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === page.sections.length - 1) return;

    const newSections = [...page.sections];
    const item = newSections.splice(index, 1)[0];
    newSections.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    
    setPage(prev => ({ ...prev, sections: newSections }));
  };

  const addSection = (type: MarketingSection['type']) => {
    const newId = `${type}-${Date.now()}`;
    const newSection: MarketingSection = {
      id: newId,
      type,
      enabled: true,
      order: page.sections.length,
      content: getDefaultsForType(type)
    };
    setPage(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setActiveSectionId(newId);
  };

  const removeSection = (id: string) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, itemIdx?: number) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `marketing/${fileName}`;

      setUploading(true);
      
      const { error: uploadError } = await supabase.storage
        .from('blog_images') // Reusing the same bucket for now, or use a specific one if exists
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      if (itemIdx !== undefined) {
        setPage(prev => ({
          ...prev,
          sections: prev.sections.map(s => {
            if (s.id === sectionId) {
              const newItems = [...(s.content.items || [])];
              if (newItems[itemIdx]) {
                newItems[itemIdx] = { ...newItems[itemIdx], image_url: data.publicUrl };
              }
              return { ...s, content: { ...s.content, items: newItems } };
            }
            return s;
          })
        }));
      } else {
        updateSection(sectionId, { content: { ...page.sections.find(s => s.id === sectionId)?.content, image_url: data.publicUrl } });
      }
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Pulling design specs...</span>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Globe className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Main Orchestrator</h2>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">Live Page Editor</p>
           </div>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-black text-white font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-[6px_6px_0_0_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <Save className="w-4 h-4 mr-2" /> Commit to Cloud
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sections Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 bg-white border-2 border-black rounded-[32px] shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
               <Layout className="w-4 h-4" /> Component Stack
            </h3>
            
            <div className="space-y-3">
              {page.sections.map((section) => (
                <div 
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                    activeSectionId === section.id 
                      ? "border-black bg-gray-50 translate-x-1" 
                      : "border-transparent hover:bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-black/10 tabular-nums">0{section.order + 1}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                      {section.type} • {section.id.split('-')[1] || 'Unit'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} className="p-1 hover:bg-white rounded-md border border-gray-100"><MoveUp className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} className="p-1 hover:bg-white rounded-md border border-gray-100"><MoveDown className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded-md border border-red-100"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 grid grid-cols-2 gap-3">
               <button onClick={() => addSection('hero')} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-50 hover:border-black transition-all bg-gray-50/20 group">
                  <Layout className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Hero</span>
               </button>
               <button onClick={() => addSection('features')} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-50 hover:border-black transition-all bg-gray-50/20 group">
                  <Settings className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Units</span>
               </button>
               <button onClick={() => addSection('team')} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-50 hover:border-black transition-all bg-gray-50/20 group">
                  <User className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Team</span>
               </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-8">
           {activeSectionId ? (
              <div className="p-10 bg-white border-2 border-black rounded-[40px] shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] space-y-10 min-h-[500px]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border-2 border-black">
                       <Settings className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight">Configuration Matrix</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Section ID: {activeSectionId}</p>
                    </div>
                 </div>

                 <SectionEditor 
                  section={page.sections.find(s => s.id === activeSectionId)!}
                  onChange={(updates) => updateSection(activeSectionId, updates)}
                  onImageUpload={(e, itemIdx) => handleImageUpload(e, activeSectionId, itemIdx)}
                  isUploading={uploading}
                 />
              </div>
           ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50/30 border-4 border-dashed border-gray-100 rounded-[40px] text-center p-20">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 mb-6 group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8 text-gray-200" />
                 </div>
                 <h4 className="text-lg font-black uppercase tracking-tight mb-2 opacity-30">Stack Inactive</h4>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 max-w-xs">Select a stack component from the left sidebar to begin manual overrides.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const SectionEditor = ({ 
  section, 
  onChange, 
  onImageUpload,
  isUploading
}: { 
  section: MarketingSection, 
  onChange: (updates: Partial<MarketingSection>) => void,
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, itemIdx?: number) => void,
  isUploading: boolean
}) => {
  const content = section.content;

  const handleChange = (key: string, value: any) => {
    onChange({ content: { ...content, [key]: value } });
  };

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
               <Type className="w-3.5 h-3.5" /> Core Headline
            </label>
            <input 
              value={content.title || content.heading}
              onChange={(e) => handleChange(content.title !== undefined ? 'title' : 'heading', e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-black outline-none font-black text-sm uppercase"
              placeholder="Headline..."
            />
         </div>
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
               <ImageIcon className="w-3.5 h-3.5" /> Unit Visibility
            </label>
            <div className="flex gap-4">
               <button 
                onClick={() => onChange({ enabled: !section.enabled })}
                className={cn("flex-1 h-11 rounded-xl border-2 font-black text-[10px] uppercase transition-all", section.enabled ? "bg-emerald-500 border-black text-white" : "bg-gray-50 border-gray-100")}
               >
                 {section.enabled ? "Live Status" : "Offline Stage"}
               </button>
            </div>
         </div>
      </div>

      {section.type === 'hero' && (
         <div className="space-y-3 pt-4">
           <label className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Hero Visual Asset
           </label>
           <div className="flex gap-4">
             <input 
               value={content.image_url || ""}
               onChange={(e) => handleChange('image_url', e.target.value)}
               className="flex-1 p-4 rounded-xl border-2 border-gray-100 focus:border-black outline-none font-bold text-xs"
               placeholder="Direct public URL..."
             />
             <div className="relative">
                <Button variant="outline" className="h-11 rounded-xl border-2 border-black/10 hover:border-black font-black text-[10px] uppercase">
                   {isUploading ? "..." : "Upload"}
                </Button>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => onImageUpload(e)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
             </div>
           </div>
           {content.image_url && (
             <div className="mt-4 w-full h-40 rounded-2xl border-2 border-black overflow-hidden relative">
                <img src={content.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
             </div>
           )}
         </div>
       )}

      {(content.subtitle || content.description) !== undefined && (
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
             <Type className="w-3.5 h-3.5" /> Narrative Context
          </label>
          <textarea 
            value={content.subtitle || content.description}
            onChange={(e) => handleChange(content.subtitle !== undefined ? 'subtitle' : 'description', e.target.value)}
            className="w-full p-6 rounded-2xl border-2 border-gray-100 focus:border-black outline-none font-bold text-xs min-h-[120px]"
            placeholder="Description..."
          />
        </div>
      )}

      {content.primaryCTA && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-2 border-gray-50">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Action Label</label>
            <input 
              value={content.primaryCTA.label}
              onChange={(e) => handleChange('primaryCTA', { ...content.primaryCTA, label: e.target.value })}
              className="w-full p-4 h-14 rounded-xl border-2 border-gray-100 focus:border-black outline-none font-black text-xs uppercase"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Destination Protocol</label>
            <input 
              value={content.primaryCTA.href}
              onChange={(e) => handleChange('primaryCTA', { ...content.primaryCTA, href: e.target.value })}
              className="w-full p-4 h-14 rounded-xl border-2 border-gray-100 focus:border-black outline-none font-bold text-xs"
            />
          </div>
        </div>
      )}

      {section.type === 'features' && content.items && (
        <div className="space-y-4 pt-8 border-t-2 border-gray-50">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Unit Modules</label>
          {content.items.map((item: any, idx: number) => (
            <div key={idx} className="p-6 rounded-3xl border-2 border-gray-100 bg-gray-50/20 flex gap-6 group hover:border-black transition-all">
               <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-gray-200 group-hover:text-black transition-colors" />
               </div>
               <div className="flex-1 space-y-3">
                   <div className="flex justify-between items-start">
                     <input 
                       value={item.title}
                       onChange={(e) => {
                         const newItems = [...content.items];
                         newItems[idx] = { ...item, title: e.target.value };
                         handleChange('items', newItems);
                       }}
                       className="bg-transparent border-none outline-none font-black text-sm uppercase tracking-tight flex-1"
                       placeholder="Module Title"
                     />
                     <div className="relative">
                       <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors overflow-hidden relative">
                         <ImageIcon className={cn("w-4 h-4", item.image_url ? "text-emerald-500" : "text-gray-300")} />
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => onImageUpload(e, idx)}
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           disabled={isUploading}
                         />
                       </button>
                     </div>
                   </div>
                  <input 
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...content.items];
                      newItems[idx] = { ...item, description: e.target.value };
                      handleChange('items', newItems);
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs text-gray-500 font-medium"
                    placeholder="Narrative summary..."
                  />
                  {item.image_url && (
                     <div className="mt-2 w-full h-24 rounded-lg border-2 border-black/5 overflow-hidden">
                       <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                     </div>
                   )}
               </div>
            </div>
          ))}
        </div>
      )}

       {section.type === 'team' && content.members && (
        <div className="space-y-4 pt-8 border-t-2 border-gray-50">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Team Grid Nodes</label>
          {content.members.map((member: any, idx: number) => (
            <div key={idx} className="p-6 rounded-3xl border-2 border-gray-100 bg-gray-50/20 flex gap-6 group hover:border-black transition-all">
               <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                       <User className="w-6 h-6 text-black/10" />
                    </div>
                  )}
               </div>
               <div className="flex-1 space-y-3">
                   <div className="flex justify-between items-start">
                     <div className="flex-1 space-y-1">
                        <input 
                          value={member.name}
                          onChange={(e) => {
                            const newMembers = [...content.members];
                            newMembers[idx] = { ...member, name: e.target.value };
                            handleChange('members', newMembers);
                          }}
                          className="bg-transparent border-none outline-none font-black text-sm uppercase tracking-tight w-full"
                          placeholder="Node Name"
                        />
                        <input 
                          value={member.role}
                          onChange={(e) => {
                            const newMembers = [...content.members];
                            newMembers[idx] = { ...member, role: e.target.value };
                            handleChange('members', newMembers);
                          }}
                          className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-emerald-600 block w-full"
                          placeholder="Protocol Role"
                        />
                     </div>
                     <div className="relative">
                       <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors overflow-hidden relative">
                         <ImageIcon className={cn("w-4 h-4", member.image_url ? "text-emerald-500" : "text-gray-300")} />
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => onImageUpload(e, idx)}
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           disabled={isUploading}
                         />
                       </button>
                     </div>
                   </div>
                   <textarea 
                     value={member.bio}
                     onChange={(e) => {
                       const newMembers = [...content.members];
                       newMembers[idx] = { ...member, bio: e.target.value };
                       handleChange('members', newMembers);
                     }}
                     className="w-full bg-transparent border-none outline-none text-xs text-gray-500 font-medium resize-none"
                     rows={2}
                     placeholder="Mission objective..."
                   />
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultsForType(type: MarketingSection['type']) {
  switch(type) {
    case 'hero': return { title: "NEW HORIZON HERO", subtitle: "Define your digital frontier here.", primaryCTA: { label: "Initialize", href: "/register" } };
    case 'features': return { heading: "ELITE CAPABILITIES", items: [{ title: "SYNC PROTOCOL", description: "Seamless data orchestration." }] };
    case 'team': return { 
      heading: "THE LEGENDS", 
      members: [
        { name: "Mia", role: "CEO", bio: "Shih Tzu Dog. Lead visionary and strategic biscuits enthusiast.", image_url: "" },
        { name: "Billu", role: "CTO", bio: "White Indi Cat. Chief Technical Orchestrator. Master of system purr-formance.", image_url: "" },
        { name: "Myra", role: "CMO", bio: "Chow Chow Dog. Chief Marketing Officer. Expert in brand fluffiness.", image_url: "" },
        { name: "Brandy", role: "CXO", bio: "Indian Brown & White Cat. Chief eXperience Orchestrator.", image_url: "" }
      ] 
    };
    default: return { heading: "NEW MODULE UNIT" };
  }
}
