import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { useLinks } from "@/hooks/useLinksApi";
import { Search, User, Globe, LayoutGrid, Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/apps": "Apps & Integrations",
  "/dashboard/links": "Links",
  "/dashboard/forms": "Forms",
  "/dashboard/catalog": "Shop",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/appearance": "Design",
  "/dashboard/messages": "Messages",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin",
  "/dashboard/qrforge": "QR Codes",
  "/dashboard/socialflow": "Social Flow",
};

const DashboardLayout = () => {
  const location = useLocation();
  const title = location.pathname.startsWith("/dashboard/admin/user/")
    ? "User Edit"
    : pageTitles[location.pathname] || "Dashboard";
  const user = useAuthStore((s) => s.user);
  const { fetchSettings } = useAppearanceStore();
  
  useCatalogItems(user?.user_id);
  useLinks(user?.user_id);

  useEffect(() => {
    if (user?.user_id) {
      fetchSettings(user.user_id);
    }
  }, [fetchSettings, user?.user_id]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex w-full bg-[#f8f9fa] font-bruddle relative overflow-hidden">
        
        {/* Subtle Architectural Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply">
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          
          <header className="min-h-[84px] md:h-24 flex items-center justify-between px-4 md:px-10 py-3 md:py-0 bg-transparent shrink-0">
            <div className="flex items-center gap-3 md:gap-6">
              <div>
                <SidebarTrigger className="h-10 w-10 md:h-12 md:w-12 border-2 border-black bg-white rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center hover:bg-black hover:text-white hover:shadow-none hover:translate-y-[4px] hover:translate-x-[4px] transition-all" />
              </div>
              <div>
                <h2 className="text-[10px] md:text-sm font-black text-black/20 uppercase tracking-[0.25em] md:tracking-[0.4em] mb-1">My Link Page</h2>
                <h1 className="text-xl md:text-2xl font-black text-black tracking-tight">{title}</h1>
                <div className="mt-2 md:mt-3 inline-flex items-center gap-1 rounded-full border-2 border-black bg-white p-1 overflow-x-auto max-w-[75vw] md:max-w-none">
                  {[
                    { label: "Links", path: "/dashboard/links" },
                    { label: "Forms", path: "/dashboard/forms" },
                    { label: "Shop", path: "/dashboard/catalog" },
                    { label: "Design", path: "/dashboard/appearance" },
                  ].map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${
                          active
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-transparent hover:border-black/30"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
               <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black rounded-2xl shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Active Substrate</span>
               </div>

               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-sm hover:shadow-[4px_4px_0_0_rgba(16,185,129,1)] transition-all cursor-pointer">
                      <Bell size={20} className="text-black" />
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-sm hover:shadow-[4px_4px_0_0_rgba(244,114,182,1)] transition-all cursor-pointer overflow-hidden p-1">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                  </div>
               </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 pt-0 scroll-smooth">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
