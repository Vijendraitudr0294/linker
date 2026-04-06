import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, MoveUp, MoveDown, Layers, Palette, User, Link2, Type, LayoutGrid, Rows3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SettingsPanelProps {
  studio: any;
  selectedBlock: string;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  updateProfile: (key: string, value: any) => void;
  updateLink: (key: string, value: string) => void;
  updateItem: (id: string, key: string, value: any) => void;
  patchStudio: (updater: any) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: "up" | "down") => void;
  onLoadPreset: () => void;
}

export const SettingsPanel = ({
  studio,
  selectedBlock,
  settingsTab,
  setSettingsTab,
  updateProfile,
  updateLink,
  updateItem,
  patchStudio,
  onRemoveItem,
  onMoveItem,
  onLoadPreset,
}: SettingsPanelProps) => {
  const { profile, gradient, template } = studio;
  const selectedItem = selectedBlock.startsWith("card:") 
    ? profile.items.find((item: any) => item.id === selectedBlock.replace("card:", "")) 
    : null;

  const inputClass = "rounded-2xl border-white/10 bg-black/20 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium";
  const labelClass = "text-[11px] font-black uppercase tracking-widest text-white/70 mb-2 block";
  const cardClass = "rounded-3xl border border-white/20 bg-white/5 p-6 space-y-6 shadow-xl";

  return (
    <aside className="w-[380px] flex flex-col rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <Tabs value={settingsTab} onValueChange={setSettingsTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5 rounded-2xl p-1 gap-1">
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <User className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Link2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Layers className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="style" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Palette className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {settingsTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className={cardClass}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Identity</h4>
                    <Button variant="ghost" size="sm" onClick={onLoadPreset} className="h-7 text-[10px] font-black px-2 hover:bg-white/5">Restore Default</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={labelClass}>Profile Name</Label>
                      <Input 
                        value={profile.name} 
                        onChange={(e) => updateProfile("name", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    
                    <div className="space-y-2">
                       <Label className={labelClass}>Headline</Label>
                       <Input 
                        value={profile.headline} 
                        onChange={(e) => updateProfile("headline", e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={labelClass}>Bio</Label>
                      <Textarea 
                        value={profile.bio} 
                        onChange={(e) => updateProfile("bio", e.target.value)}
                        rows={4}
                        className={cn(inputClass, "resize-none")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div>
                        <Label className="text-sm font-black text-white/90">Verified Badge</Label>
                        <p className="text-[10px] font-medium text-white/40">Toggle official verification icon</p>
                      </div>
                      <Switch 
                        checked={profile.verified}
                        onCheckedChange={(checked) => updateProfile("verified", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                   <h4 className="text-sm font-black uppercase tracking-widest text-primary border-b border-white/5 pb-4">Realtime Stats</h4>
                   <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                        <Label className="text-sm font-black text-white/90">Show Statistics</Label>
                        <Switch 
                          checked={profile.showStats}
                          onCheckedChange={(checked) => updateProfile("showStats", checked)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className={labelClass}>Followers</Label>
                          <Input value={profile.followers} onChange={(e) => updateProfile("followers", e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className={labelClass}>Likes</Label>
                          <Input value={profile.likes} onChange={(e) => updateProfile("likes", e.target.value)} className={inputClass} />
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {settingsTab === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className={cardClass}>
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Social Links</h4>
                    <div className="space-y-4">
                      {["instagram", "facebook", "youtube", "website"].map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className={labelClass}>{field}</Label>
                          <Input 
                            value={profile.links[field]} 
                            onChange={(e) => updateLink(field, e.target.value)}
                            className={inputClass}
                            placeholder={`https://${field}.com/username`}
                          />
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className={cardClass}>
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Direct Communication</h4>
                    <div className="space-y-4">
                      {["phone", "email", "location"].map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className={labelClass}>{field}</Label>
                          <Input 
                            value={profile.links[field]} 
                            onChange={(e) => updateLink(field, e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {settingsTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Global Content Settings */}
                <div className={cardClass}>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Section Identity</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={labelClass}>Section Title</Label>
                      <Input value={profile.sectionTitle} onChange={(e) => updateProfile("sectionTitle", e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <Button 
                         variant={profile.viewMode === "thumbnail" ? "default" : "outline"}
                         onClick={() => updateProfile("viewMode", "thumbnail")}
                         className="rounded-2xl h-12"
                       >
                         <LayoutGrid className="mr-2 h-4 w-4" /> Thumbnail
                       </Button>
                       <Button 
                         variant={profile.viewMode === "card" ? "default" : "outline"}
                         onClick={() => updateProfile("viewMode", "card")}
                         className="rounded-2xl h-12"
                       >
                         <Rows3 className="mr-2 h-4 w-4" /> Cards
                       </Button>
                    </div>
                  </div>
                </div>

                {/* Selected Item Editor */}
                <AnimatePresence mode="wait">
                  {selectedItem && (
                    <motion.div
                      key={selectedItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cardClass}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                        <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase py-0.5 px-3 border-primary/30 text-primary">Card: {selectedItem.title}</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onRemoveItem(selectedItem.id)}
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className={labelClass}>Card Title</Label>
                          <Input value={selectedItem.title} onChange={(e) => updateItem(selectedItem.id, "title", e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className={labelClass}>Description / Hint</Label>
                          <Textarea value={selectedItem.subtitle} onChange={(e) => updateItem(selectedItem.id, "subtitle", e.target.value)} rows={3} className={cn(inputClass, "resize-none")} />
                        </div>
                        <div className="space-y-2">
                          <Label className={labelClass}>Destination URL</Label>
                          <Input value={selectedItem.url} onChange={(e) => updateItem(selectedItem.id, "url", e.target.value)} className={cn(inputClass, "font-mono text-[11px]")} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reorder List */}
                <div className={cardClass}>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Rearrange Contents</h4>
                   <div className="space-y-3">
                      {profile.items.map((item: any, idx: number) => (
                        <div key={item.id} className={cn(
                          "flex items-center gap-3 p-3 rounded-[1.2rem] border border-white/5 bg-black/20 transition-all",
                          selectedBlock === `card:${item.id}` ? "border-primary/50 bg-primary/5" : ""
                        )}>
                           <div className="flex-1 min-w-0" onClick={() => setSettingsTab("content")}>
                              <p className="text-xs font-black text-white/90 truncate">{item.title}</p>
                              <p className="text-[9px] uppercase font-black text-white/30 tracking-widest truncate">{item.type} · {item.layoutStyle}</p>
                           </div>
                           <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={idx === 0}
                                onClick={() => onMoveItem(item.id, "up")}
                                className="h-7 w-7 rounded-lg hover:bg-white/10 disabled:opacity-30"
                              >
                                <MoveUp className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={idx === profile.items.length - 1}
                                onClick={() => onMoveItem(item.id, "down")}
                                className="h-7 w-7 rounded-lg hover:bg-white/10 disabled:opacity-30"
                              >
                                <MoveDown className="h-3 w-3" />
                              </Button>
                           </div>
                        </div>
                      ))}
                      {profile.items.length === 0 && (
                        <p className="text-center text-[10px] py-4 text-white/30 font-bold uppercase tracking-widest">No cards added yet</p>
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {settingsTab === "style" && (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className={cardClass}>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Interactive Gradient</h4>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className={labelClass}>Azure Intensity</Label>
                        <span className="text-[10px] font-black text-primary">{gradient.blue}%</span>
                      </div>
                      <Slider 
                        max={100} 
                        step={1} 
                        value={[gradient.blue]} 
                        onValueChange={([val]) => patchStudio((curr: any) => ({ ...curr, gradient: { ...curr.gradient, blue: val } }))}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className={labelClass}>Neon Pink Pulse</Label>
                        <span className="text-[10px] font-black text-primary">{gradient.pink}%</span>
                      </div>
                      <Slider 
                        max={100} 
                        step={1} 
                        value={[gradient.pink]} 
                        onValueChange={([val]) => patchStudio((curr: any) => ({ ...curr, gradient: { ...curr.gradient, pink: val } }))}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className={labelClass}>Vibrant Blend</Label>
                        <span className="text-[10px] font-black text-primary">{gradient.blend}%</span>
                      </div>
                      <Slider 
                        max={100} 
                        step={1} 
                        value={[gradient.blend]} 
                        onValueChange={([val]) => patchStudio((curr: any) => ({ ...curr, gradient: { ...curr.gradient, blend: val } }))}
                      />
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Typography & Presets</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className={labelClass}>Page Template</Label>
                       <Select 
                        value={template} 
                        onValueChange={(val) => patchStudio((curr: any) => ({ ...curr, template: val }))}
                       >
                         <SelectTrigger className={inputClass}>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                           {["Minimal Grid", "Interactive Showcase", "Vertical Story Feed", "Carousel Showcase"].map(t => (
                             <SelectItem key={t} value={t} className="rounded-xl focus:bg-primary focus:text-primary-foreground">{t}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </aside>
  );
};
