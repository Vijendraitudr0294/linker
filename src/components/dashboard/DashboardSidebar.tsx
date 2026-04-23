import { LayoutDashboard, Palette, QrCode, ShieldCheck, Target, Search, Phone, Puzzle, Link2, ShoppingBag, FileText, LayoutTemplate, LogOut, Settings, Zap } from "lucide-react";
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
  accentColor?: string;
};

const primaryNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview",    path: "/dashboard",              feature: null,                    accentColor: "#34d399" },
  { icon: Palette,         label: "Themes",      path: "/dashboard/appearance",   feature: null,      badge: "Elite", accentColor: "#a78bfa" },
  { icon: LayoutTemplate,  label: "Templates",   path: "/dashboard/templates",    feature: null,                    accentColor: "#60a5fa" },
  { icon: Link2,           label: "Links",       path: "/dashboard/links",        feature: "feature_social_links",  accentColor: "#34d399" },
  { icon: ShoppingBag,     label: "Store",       path: "/dashboard/catalog",      feature: "feature_catalog",       accentColor: "#f472b6" },
  { icon: FileText,        label: "Courses",     path: "/dashboard/courses",      feature: null,                    accentColor: "#a78bfa", badge: "Elite" },
  { icon: Target,          label: "Analytics",   path: "/dashboard/analytics",    feature: "feature_analytics",     accentColor: "#38bdf8" },
  { icon: LayoutTemplate,  label: "Leads",       path: "/dashboard/forms",        feature: "feature_contact_form",  accentColor: "#fbbf24" },
  { icon: Zap,             label: "AutoDM",      path: "/dashboard/socialflow",   feature: null,                    accentColor: "#818cf8", badge: "Beta" },
  { icon: QrCode,          label: "QR Codes",    path: "/dashboard/qrforge",      feature: null,                    accentColor: "#34d399" },
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

  const visibleItems = primaryNavItems.filter((item) => {
    if (!item.feature) return true;
    if (isAdmin) return true;
    if (!platformSettings) return true;
    return platformSettings[item.feature as keyof typeof platformSettings] === true;
  });

  const initials = (user?.name?.[0] || user?.username?.[0] || "?").toUpperCase();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 transition-all duration-300 font-bruddle"
      style={{ background: "#0a0a0f" }}
    >
      {/* ── HEADER ───────────────────────────────────────────── */}
      <SidebarHeader className={cn("px-5 pt-6 pb-4", collapsed && "px-3")}>
        <div className={cn("flex items-center gap-3 transition-all", collapsed && "justify-center")}>
          {/* Brutalist logo mark */}
          <div className="w-9 h-9 bg-[#34d399] border border-gray-200 rounded-[10px] shadow-sm flex items-center justify-center shrink-0 rotate-0">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-[15px] font-black tracking-tight text-white leading-none">Biotra</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-0.5">Creator OS</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <SidebarContent className={cn("px-3 pt-2 select-none overflow-y-auto", collapsed && "px-2")}>
        {!collapsed && (
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 px-3 mb-3">My Workspace</p>
        )}

        <SidebarMenu className="space-y-1">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={cn(
                    "h-10 rounded-xl transition-all duration-200 w-full group relative overflow-hidden",
                    collapsed ? "justify-center px-0" : "px-3",
                    active
                      ? "bg-white/10 shadow-sm"
                      : "hover:bg-white/[0.05]"
                  )}
                >
                  <Link to={item.path} className={cn("flex items-center w-full gap-3", collapsed && "justify-center")}>
                    {/* Active accent bar */}
                    {active && !collapsed && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                        style={{ backgroundColor: item.accentColor || "#34d399" }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                        active
                          ? "shadow-sm"
                          : "bg-white/5 group-hover:bg-white/10"
                      )}
                      style={active ? { backgroundColor: `${item.accentColor}22`, border: `1.5px solid ${item.accentColor}55` } : {}}
                    >
                      <item.icon
                        className="w-[14px] h-[14px] transition-colors"
                        style={active ? { color: item.accentColor } : { color: "rgba(255,255,255,0.45)" }}
                      />
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        className={cn(
                          "text-[12px] font-semibold transition-colors flex-1",
                          active ? "text-white" : "text-white/50 group-hover:text-white/80"
                        )}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {item.badge && !collapsed && (
                      <span
                        className="text-[8px] font-medium text-sm px-1.5 py-0.5 rounded-md border"
                        style={
                          item.badge === "Elite"
                            ? { background: "rgba(167,139,250,0.15)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }
                            : { background: "rgba(52,211,153,0.15)", color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Help & Support */}
        {!collapsed && (
          <div className="mt-4 px-2">
            <div className="h-px bg-white/[0.06] mb-4" />
            <Link
              to="/help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <Phone className="w-[13px] h-[13px]" />
              </div>
              <span className="text-[12px] font-medium">Help & Support</span>
            </Link>
          </div>
        )}

        {/* Super Admin */}
        {isSuperAdmin && !collapsed && (
          <div className="mt-3 px-2">
            <div className="h-px bg-white/[0.06] mb-3" />
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 px-3 mb-2">Admin</p>
            <Link
              to="/dashboard/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                location.pathname.startsWith("/dashboard/admin")
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <ShieldCheck className="w-[13px] h-[13px]" />
              </div>
              <span className="text-[12px] font-medium">Concierge</span>
            </Link>
          </div>
        )}
      </SidebarContent>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <SidebarFooter className={cn("p-3 border-t border-white/[0.07]", collapsed && "p-2")}>
        {!collapsed ? (
          <div className="space-y-3">
            {/* User Card — Brutalist style */}
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-black text-[12px] font-black shrink-0 border border-gray-200 shadow-sm"
                style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate leading-tight">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-[10px] text-white/30 truncate">{user?.email || ""}</p>
              </div>
            </div>

            {/* Settings & Logout */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard/settings"
                className="h-9 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 text-white/50 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all"
              >
                <Settings className="w-3 h-3" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="h-9 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-[11px] font-bold uppercase tracking-wider transition-all"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-black text-[11px] font-black border border-gray-200"
              style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-full h-9 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

