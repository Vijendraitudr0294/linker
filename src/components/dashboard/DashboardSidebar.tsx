import { LayoutDashboard, Link2, BarChart3, Palette, Settings, LogOut, Shield, Mail, ShoppingBag, Package, ExternalLink, Zap, Settings2, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigate, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const allMainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, feature: null },
  { title: "Links", url: "/dashboard/links", icon: Link2, feature: null },
  { title: "Catalog", url: "/dashboard/catalog", icon: ShoppingBag, feature: "feature_catalog" as const },
  { title: "Orders", url: "/dashboard/orders", icon: Package, feature: "feature_catalog" as const },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, feature: "feature_analytics" as const },
  { title: "Appearance", url: "/dashboard/appearance", icon: Palette, feature: null },
  { title: "Messages", url: "/dashboard/messages", icon: Mail, feature: "feature_contact_form" as const },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, feature: null },
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
  const isSuperAdmin = user?.role === "superadmin";

  const mainItems = allMainItems.filter((item) => {
    if (!item.feature) return true;
    if (isAdmin) return true;
    if (!platformSettings) return true;
    return platformSettings[item.feature];
  });

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} className="border-r border-border bg-card shadow-xl transition-all duration-300">
      <SidebarContent className={cn("p-1.5 md:p-3", collapsed && "items-center !px-0")}>
        <SidebarGroup className={cn("w-full transition-all duration-300", collapsed && "p-0 items-center")}>
          <div className={cn("flex items-center gap-3 px-2 py-4 mb-6 transition-all duration-300", collapsed && "justify-center px-0 mb-4")}>
            <div className={cn(
              "rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-all duration-300",
              collapsed ? "w-8 h-8 rounded-xl" : "w-10 h-10"
            )}>
              <Zap className={cn("text-white transition-all", collapsed ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-black text-foreground text-lg tracking-tighter">LinkVertex</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-1">Creator Hub</span>
              </div>
            )}
          </div>

          <SidebarGroupContent className="w-full">
            <SidebarMenu className={cn("space-y-1.5 transition-all duration-300", collapsed && "items-center px-1")}>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="w-full flex justify-center">
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={cn("rounded-xl transition-all duration-300", collapsed ? "w-9 h-9 p-0 justify-center" : "h-11")}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={cn("group flex items-center gap-3 transition-all", collapsed ? "justify-center w-full" : "w-full px-3")}
                      activeClassName="bg-primary/10 text-primary !font-black"
                    >
                      <item.icon className={cn("transition-all group-hover:scale-110 shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5", isActive(item.url) ? 'text-primary' : 'text-foreground/80')} />
                      {!collapsed && (
                        <span className="text-sm font-bold tracking-tight">{item.title}</span>
                      )}
                      {isActive(item.url) && !collapsed && (
                        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup className={cn("mt-6 w-full", collapsed && "p-0 items-center")}>
            {!collapsed && (
              <div className="px-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Management</span>
              </div>
            )}
            <SidebarGroupContent className="w-full">
              <SidebarMenu className={cn("space-y-1.5 transition-all duration-300", collapsed && "items-center px-1")}>
                <SidebarMenuItem className="w-full flex justify-center">
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/admin") && !location.pathname.includes("/admin/settings")} className={cn("rounded-xl transition-all duration-300", collapsed ? "w-9 h-9 p-0 justify-center" : "h-11")}>
                    <NavLink
                      to="/dashboard/admin"
                      className={cn("group flex items-center gap-3 transition-all", collapsed ? "justify-center w-full" : "w-full px-3")}
                      activeClassName="bg-primary/10 text-primary !font-black"
                    >
                      <Users className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="text-sm font-bold tracking-tight">Users</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="w-full flex justify-center">
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/admin/settings")} className={cn("rounded-xl transition-all duration-300", collapsed ? "w-9 h-9 p-0 justify-center" : "h-11")}>
                    <NavLink
                      to="/dashboard/admin/settings"
                      className={cn("group flex items-center gap-3 transition-all", collapsed ? "justify-center w-full" : "w-full px-3")}
                      activeClassName="bg-primary/10 text-primary !font-black"
                    >
                      <Settings2 className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="text-sm font-bold tracking-tight">System</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2 border-t border-white/5">
        {!collapsed && user?.username && (
          <div className="px-3 py-4 mb-2 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Brand Profile</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent overflow-hidden flex items-center justify-center text-[11px] font-black text-white">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || user.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.name || user.username).charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate">{user.name || `@${user.username}`}</p>
                <p className="text-[11px] font-semibold text-muted-foreground truncate">@{user.username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-[10px] font-black uppercase tracking-tighter h-8 rounded-full border-primary/20 hover:bg-primary hover:text-white"
              onClick={() => window.open(`/p/${user.username}`, '_blank')}
            >
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Live Page
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-11 rounded-xl px-4"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {!collapsed && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}



