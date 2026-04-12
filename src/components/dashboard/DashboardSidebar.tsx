import { LayoutDashboard, Palette, QrCode, ShieldCheck, Target, Search, Phone, Puzzle, Link2, ShoppingBag, FileText, LayoutTemplate } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import React from "react";

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  feature: string | null;
  badge?: string;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const primaryNavGroups: NavGroup[] = [
  {
    group: "Build",
    items: [
      { icon: Link2, label: "Links", path: "/dashboard/links", feature: null },
      { icon: FileText, label: "Forms", path: "/dashboard/forms", feature: null, badge: "New" },
      { icon: ShoppingBag, label: "Shop", path: "/dashboard/catalog", feature: "feature_catalog" },
    ]
  }
];

const moreNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", feature: null },
  { icon: Puzzle, label: "Apps", path: "/dashboard/apps", feature: null },
  { icon: Target, label: "Analytics", path: "/dashboard/analytics", feature: null },
  { icon: Search, label: "Social Flow", path: "/dashboard/socialflow", feature: null },
  { icon: QrCode, label: "QR Codes", path: "/dashboard/qrforge", feature: null },
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

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-[#000000] text-white transition-all duration-300 font-bruddle">
      <SidebarHeader className="p-6 pb-2">
        <div className={cn("flex items-center gap-2 transition-all", collapsed && "justify-center px-0")}>
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
             <div className="w-5 h-5 bg-emerald-400 rounded-sm rotate-45" />
          </div>
          {!collapsed && (
            <h2 className="text-[15px] font-bold tracking-tight text-white leading-none ml-1">
              Biotra
            </h2>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-6 select-none">
        {primaryNavGroups.map((group, idx) => {
           const visibleItems = group.items.filter((item) => {
             if (!item.feature) return true;
             if (isAdmin) return true;
             if (!platformSettings) return true;
             return platformSettings[item.feature as keyof typeof platformSettings];
           });

           if (visibleItems.length === 0) return null;

           return (
             <SidebarGroup key={idx} className="mb-4">
                {!collapsed && (
                  <SidebarGroupLabel className="px-2 text-[10px] font-medium text-white/40 mb-2 uppercase tracking-wide">
                    {group.group}
                  </SidebarGroupLabel>
                )}
                <SidebarMenu className="space-y-[2px]">
                  {visibleItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={cn(
                            "h-9 rounded-md transition-all duration-200 relative group w-full flex items-center justify-between",
                            collapsed ? "justify-center p-0" : "px-2",
                            active 
                              ? "bg-white/10 text-white" 
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link to={item.path} className="flex items-center w-full">
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-[14px] h-[14px]", active ? "text-white" : "opacity-60")} />
                                {!collapsed && <span className="text-[12px] font-medium">{item.label}</span>}
                            </div>
                            {item.badge && !collapsed && (
                               <div className="ml-auto px-1.5 py-[1px] bg-emerald-500 rounded text-[9px] font-bold text-black">
                                  {item.badge}
                               </div>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
             </SidebarGroup>
           );
        })}

        <SidebarGroup className="mb-4">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-medium text-white/40 mb-2 uppercase tracking-wide">
              More
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="space-y-[2px]">
            {!collapsed && (
              <SidebarMenuItem>
                <div className="h-9 rounded-md px-2 flex items-center text-white/80">
                  <span className="text-[12px] font-medium">More</span>
                </div>
              </SidebarMenuItem>
            )}
            {moreNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "h-9 rounded-md transition-all duration-200 relative group w-full flex items-center justify-between",
                      collapsed ? "justify-center p-0" : "px-2",
                      active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Link to={item.path} className="flex items-center w-full">
                      <div className={cn("flex items-center gap-3", !collapsed && "pl-4")}>
                        <item.icon className={cn("w-[14px] h-[14px]", active ? "text-white" : "opacity-60")} />
                        {!collapsed && <span className="text-[12px] font-medium">{item.label}</span>}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {!collapsed && (
           <div className="px-6 py-2 mt-2">
              <span className="text-[12px] font-medium text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-3">
                 <Phone className="w-[14px] h-[14px]" /> Help & Support
              </span>
           </div>
        )}

        {isAdmin && !collapsed && (
           <SidebarGroup className="mt-8 border-t border-white/10 pt-4">
              <SidebarGroupLabel className="px-2 text-[10px] font-medium text-white/40 mb-2 uppercase tracking-wide">
                Admin
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/dashboard/admin")}
                    className={cn(
                      "h-9 rounded-md px-2 transition-all duration-200",
                      location.pathname.startsWith("/dashboard/admin") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Link to="/dashboard/admin" className="flex items-center gap-3">
                      <ShieldCheck className="w-[14px] h-[14px]" />
                      <span className="text-[12px] font-medium">Concierge</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
           </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
         {/* Footer completely removed for ultra-clean look like reference image. Handled via top-bar. */}
      </SidebarFooter>
    </Sidebar>
  );
}
