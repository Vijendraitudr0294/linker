import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Outlet, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLinksStore } from "@/stores/linksStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useCatalogStore } from "@/stores/catalogStore";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/links": "Links",
  "/dashboard/catalog": "Catalog",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/appearance": "Appearance",
  "/dashboard/messages": "Messages",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin",
};

const DashboardLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";
  const user = useAuthStore((s) => s.user);
  const { fetchLinks } = useLinksStore();
  const { fetchSettings } = useAppearanceStore();
  const { fetchItems } = useCatalogStore();

  useEffect(() => {
    if (user?.user_id) {
      fetchLinks(user.user_id);
      fetchSettings(user.user_id);
      fetchItems(user.user_id);
    }
  }, [user?.user_id]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background selection:bg-primary/30 selection:text-foreground">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Background Mesh for Dashboard */}
          <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <header className="h-16 flex items-center justify-between border-b border-border/10 px-4 md:px-8 bg-background/95 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-10 w-10 hover:bg-primary/10 rounded-xl transition-all active:scale-95" />
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <h2 className="text-base md:text-lg font-heading font-black text-foreground tracking-tight">
                  {title}
                </h2>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPanel />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 xl:p-10 scrollbar-hide overflow-y-auto relative z-10" style={{ height: 'calc(100vh - 4rem)' }}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="min-h-full"
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
