import { LayoutDashboard, Link2, LogOut, ShoppingBag, Palette, Sparkles, QrCode, ShieldCheck, Heart, User, Settings, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard", feature: null },
  { icon: Link2, label: "Links", path: "/dashboard/links", feature: null },
  { icon: ShoppingBag, label: "Store", path: "/dashboard/catalog", feature: "feature_catalog" as const },
  { icon: Sparkles, label: "Social", path: "/dashboard/socialflow", feature: null },
  { icon: QrCode, label: "QR Studio", path: "/dashboard/qrforge", feature: null },
  { icon: Palette, label: "Style Studio", path: "/dashboard/appearance", feature: null },
];

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { settings: platformSettings, fetchSettings: fetchPlatformSettings } = usePlatformStore();
  const navigate = useNavigate();

  useEffect(() => { fetchPlatformSettings(); }, [fetchPlatformSettings]);

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = mainNavItems.filter((item) => {
    if (!item.feature) return true;
    if (isAdmin) return true;
    if (!platformSettings) return true;
    return platformSettings[item.feature as keyof typeof platformSettings];
  });

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} className="border-r border-white/5 bg-background transition-all duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&display=swap');
        .sidebar-title { font-family: 'Outfit', sans-serif; }
        .airbnb-card { box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
      `}</style>

      <SidebarHeader className="p-6">
        <div className={cn("flex items-center gap-3 transition-all", collapsed && "justify-center px-0")}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0 transition-transform duration-500 hover:rotate-6">
             <Sparkles className="w-5 h-5 text-white fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold sidebar-title text-foreground tracking-tight leading-none">
                Biotra
              </h2>
              <span className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest leading-none">
                Studio
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-[10px] font-bold tracking-widest text-muted-foreground/30 mb-4 uppercase [font-family:'Outfit',sans-serif]">
              Studio Suite
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "h-11 rounded-xl transition-all duration-300",
                      collapsed ? "justify-center p-0" : "px-4",
                      active 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-muted-foreground/60 hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className={cn("w-4.5 h-4.5", active ? "text-white" : "opacity-40 group-hover:opacity-100 transition-opacity")} />
                      {!collapsed && <span className="text-[14px] font-semibold tracking-tight">{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && !collapsed && (
           <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="px-4 text-[10px] font-bold tracking-widest text-muted-foreground/30 mb-4 uppercase [font-family:'Outfit',sans-serif]">
                Admin
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/dashboard/admin")}
                    className={cn(
                      "h-11 rounded-xl px-4",
                      location.pathname.startsWith("/dashboard/admin") ? "bg-primary text-white shadow-md" : "text-muted-foreground/60 hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <Link to="/dashboard/admin" className="flex items-center gap-3">
                      <ShieldCheck className="w-4.5 h-4.5 opacity-40 group-hover:opacity-100" />
                      <span className="text-[14px] font-semibold tracking-tight">Concierge</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
           </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all duration-300",
          collapsed && "justify-center p-2"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center border border-primary/20">
               <img 
                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover rounded-full"
               />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-foreground truncate leading-none mb-0.5">
                  {user?.name || user?.username}
                </p>
                <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest leading-none">
                  Host Pro
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={handleLogout} className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
               <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}



