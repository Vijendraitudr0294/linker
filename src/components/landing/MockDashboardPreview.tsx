import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Link2, MousePointerClick, ShoppingBag, Palette, Users2, Smartphone } from "lucide-react";

export default function MockDashboardPreview() {
  const stats = [
    { label: "Profile Views", value: "24,592", icon: Eye, trend: "+12%" },
    { label: "Total Clicks", value: "8,204", icon: MousePointerClick, trend: "+5%" },
    { label: "Active Links", value: "66", icon: Link2, trend: "4 New" },
    { label: "CTR", value: "33.4%", icon: BarChart3, trend: "High" },
  ];

  const actions = [
    { icon: Users2, title: "Profile", color: "from-primary/20", desc: "Identity & Bio" },
    { icon: Link2, title: "Links", color: "from-blue-500/20", desc: "Social & Web" },
    { icon: ShoppingBag, title: "Products", color: "from-orange-500/20", desc: "Sell items" },
    { icon: Palette, title: "Design", color: "from-emerald-500/20", desc: "Theme & Style" },
  ];

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white p-6 md:p-8 overflow-hidden select-none" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="mb-6 text-left">
        <div className="inline-flex items-center gap-2 mb-3 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Management Hub
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Welcome, Biotra Creator</h1>
        <p className="text-[#a6a6a6] text-sm max-w-[400px]">Manage your links, offline datasets, and profile analytics from one centralized proxy hub.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#111] border-[#222] p-4 md:p-5 rounded-2xl flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-black text-white">{s.value}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] md:text-xs text-[#a6a6a6] font-medium">{s.label}</span>
                <span className="text-[9px] md:text-[10px] text-green-400 opacity-60 font-bold">{s.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((a, i) => (
          <Card key={i} className="bg-[#111] border-[#222] p-4 flex items-center gap-4 rounded-2xl">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center border border-white/5`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white leading-tight">{a.title}</h4>
              <p className="text-xs text-[#a6a6a6]">{a.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Bottom fade out gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent z-10" />
    </div>
  );
}
