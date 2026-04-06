import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { useLinks } from "@/hooks/useLinksApi";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/links": "My Links",
  "/dashboard/catalog": "Catalog / Products",
  "/dashboard/orders": "Orders / Bookings",
  "/dashboard/analytics": "Analytics",
  "/dashboard/appearance": "Design Studio",
  "/dashboard/messages": "Messages",
  "/dashboard/settings": "My Profile",
  "/dashboard/admin": "Admin",
  "/dashboard/admin/settings": "System",
};

const DashboardLayout = () => {
  const location = useLocation();
  const title = location.pathname.startsWith("/dashboard/admin/user/")
    ? "Edit User"
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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background selection:bg-primary/20 selection:text-foreground relative">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 origin-top">
             <style>{`
               @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
               .font-script { font-family: 'Dancing Script', cursive; }
               .gradient-glow-1 { background: radial-gradient(circle, #f25f30 0%, transparent 70%); }
               .gradient-glow-2 { background: radial-gradient(circle, #0079FF 0%, transparent 70%); }
             `}</style>
             <div className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%] gradient-glow-1 opacity-[0.08] blur-[120px]" />
             <div className="absolute top-[30%] -left-[10%] w-[50%] h-[50%] gradient-glow-2 opacity-[0.05] blur-[100px]" />
          </div>

          <header className="h-14 flex items-center justify-between px-5 border-b border-surface-border bg-surface-glass backdrop-blur-3xl sticky top-0 z-40 transition-all duration-300">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8 hover:bg-white/5 rounded-lg transition-all active:scale-95 text-muted-foreground hover:text-foreground" />
              <div className="h-4 w-px bg-surface-border hidden sm:block" />
              <AnimatePresence mode="wait">
                <motion.h2
                  key={title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] hidden sm:block"
                >
                  {title}
                </motion.h2>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden min-[450px]:flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Node Operational</span>
              </div>
              
              <div className="h-4 w-px bg-surface-border mx-1 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <NotificationsPanel />
                <ThemeToggle />
                
                <div className="h-6 w-px bg-surface-border mx-1" />
                
                <div className="flex items-center gap-3 pl-1 group cursor-pointer" onClick={() => window.location.assign("/dashboard/settings")}>
                  <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[11px] font-black text-foreground leading-none mb-1 group-hover:text-primary transition-colors">{user?.name?.split(" ")[0] || user?.username}</span>
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] leading-none">Pro Plan</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface-glass border border-surface-border flex items-center justify-center shadow-sm group-hover:border-primary/40 group-hover:scale-105 transition-all">
                    <span className="text-[11px] font-black text-primary uppercase">
                      {user?.username?.[0] || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 relative z-10 overflow-x-hidden">
            <div className="p-[clamp(1rem,2vw,1.5rem)] mx-auto max-w-[1440px] w-full min-h-[calc(100vh-3.5rem)]">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
