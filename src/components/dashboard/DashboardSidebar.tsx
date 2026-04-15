import { LayoutDashboard, Palette, QrCode, ShieldCheck, Target, Search, Phone, Puzzle, Link2, ShoppingBag, FileText, LayoutTemplate, ChevronDown, LogOut, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { isAdminUser, isSuperAdminUser } from "@/lib/authRoles";
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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    group: "My Bio",
    items: [
      { icon: LayoutDashboard, label: "Overview", path: "/dashboard", feature: null },
      { icon: Palette, label: "Themes", path: "/dashboard/appearance", feature: null, badge: "Elite" },
      { icon: LayoutTemplate, label: "Templates", path: "/dashboard/templates", feature: null },
      { icon: Link2, label: "Links", path: "/dashboard/links", feature: "feature_social_links" },
      { icon: ShoppingBag, label: "Shop", path: "/dashboard/catalog", feature: "feature_catalog" },
      { icon: Puzzle, label: "Apps", path: "/dashboard/apps", feature: null },
      { icon: Target, label: "Analytics", path: "/dashboard/analytics", feature: "feature_analytics" },
      { icon: FileText, label: "Forms", path: "/dashboard/forms", feature: "feature_contact_form", badge: "New" },
      { icon: Search, label: "Social Flow", path: "/dashboard/socialflow", feature: null },
      { icon: QrCode, label: "QR Codes", path: "/dashboard/qrforge", feature: null },
    ]
  }
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

  const isAdmin = isAdminUser(user);
  const isSuperAdmin = isSuperAdminUser(user);

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
             return platformSettings[item.feature as keyof typeof platformSettings] === true;
           });

           if (visibleItems.length === 0) return null;

           if (group.group === "My Bio") {
             return (
               <SidebarGroup key={idx} className="mb-2">
                 <SidebarMenu>
                   <Collapsible defaultOpen className="group/collapsible">
                     <SidebarMenuItem>
                       <CollapsibleTrigger asChild>
                         <SidebarMenuButton className="px-2 text-white hover:bg-white/5 h-10">
                            <Link2 className="w-[14px] h-[14px] opacity-60" />
                           <span className="text-[12px] font-bold uppercase tracking-wider text-white/80">My Bio</span>
                           <ChevronDown className="ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 opacity-40" />
                         </SidebarMenuButton>
                       </CollapsibleTrigger>
                       <CollapsibleContent>
                         <div className="pl-4 mt-2 space-y-[2px] border-l border-white/5 ml-4">
                           {visibleItems.map((item) => {
                             const active = isActive(item.path);
                             return (
                               <SidebarMenuItem key={item.path}>
                                 <SidebarMenuButton
                                   asChild
                                   isActive={active}
                                   className={cn(
                                     "h-9 rounded-md transition-all duration-200 w-full flex items-center justify-between",
                                     active 
                                       ? "bg-white/10 text-white" 
                                       : "text-white/60 hover:bg-white/5 hover:text-white"
                                   )}
                                 >
                                   <Link to={item.path} className="flex items-center w-full px-2">
                                     <div className="flex items-center gap-3">
                                         <item.icon className={cn("w-[14px] h-[14px]", active ? "text-white" : "opacity-60")} />
                                         <span className="text-[12px] font-medium">{item.label}</span>
                                     </div>
                                     {item.badge && (
                                        <div className="ml-auto px-1.5 py-[1px] bg-emerald-500 rounded text-[9px] font-bold text-black">
                                           {item.badge}
                                        </div>
                                     )}
                                   </Link>
                                 </SidebarMenuButton>
                               </SidebarMenuItem>
                             );
                           })}
                         </div>
                       </CollapsibleContent>
                     </SidebarMenuItem>
                   </Collapsible>
                 </SidebarMenu>
               </SidebarGroup>
             );
           }

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
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
             </SidebarGroup>
           );
        })}


        {!collapsed && (
           <div className="px-6 py-2 mt-2">
              <Link to="/help" className="text-[12px] font-medium text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-3">
                 <Phone className="w-[14px] h-[14px]" /> Help & Support
              </Link>
           </div>
        )}

        {isSuperAdmin && !collapsed && (
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

      <SidebarFooter className="p-4 border-t border-white/10">
         {!collapsed ? (
           <div className="space-y-3">
             {/* User Profile Card */}
             <div className="flex items-center gap-3 px-2 py-2">
               <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-black text-[11px] font-black shrink-0 border border-white/10">
                 {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?"}
               </div>
               <div className="min-w-0">
                 <p className="text-[12px] font-bold text-white truncate">{user?.name || user?.username || "User"}</p>
                 <p className="text-[10px] text-white/40 truncate">{user?.email || ""}</p>
               </div>
             </div>

             {/* Settings & Logout */}
             <div className="flex items-center gap-2">
               <Link
                 to="/dashboard/settings"
                 className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-medium transition-all"
               >
                 <Settings className="w-3.5 h-3.5" />
                 Settings
               </Link>
               <button
                 onClick={handleLogout}
                 className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[11px] font-medium transition-all"
               >
                 <LogOut className="w-3.5 h-3.5" />
                 Sign Out
               </button>
             </div>
           </div>
         ) : (
           <button
             onClick={handleLogout}
             title="Sign Out"
             className="w-full h-10 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
           >
             <LogOut className="w-4 h-4" />
           </button>
         )}
      </SidebarFooter>
    </Sidebar>
  );
}
