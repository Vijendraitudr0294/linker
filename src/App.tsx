import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PublicProfile from "./pages/PublicProfile";
import PublicServices from "./pages/PublicServices";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import LinkEditor from "./pages/dashboard/LinkEditor";
import AppearancePage from "./pages/dashboard/AppearancePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import AdminPage from "./pages/dashboard/AdminPage";
import PlatformSettingsPage from "./pages/dashboard/PlatformSettingsPage";
import AdminUserEditPage from "./pages/dashboard/AdminUserEditPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import CatalogPage from "./pages/dashboard/CatalogPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRouteErrorBoundary from "./components/PublicRouteErrorBoundary";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Blog from "./pages/Blog";
import HelpCenter from "./pages/HelpCenter";
import ApiDocs from "./pages/ApiDocs";
import StatusPage from "./pages/StatusPage";
import Changelog from "./pages/Changelog";

const queryClient = new QueryClient();

const AppInit = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppInit>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/p" element={<PublicRouteErrorBoundary><PublicProfile /></PublicRouteErrorBoundary>} />
              <Route path="/p/:username" element={<PublicRouteErrorBoundary><PublicProfile /></PublicRouteErrorBoundary>} />
              <Route path="/p/:username/services" element={<PublicRouteErrorBoundary><PublicServices /></PublicRouteErrorBoundary>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardOverview />} />
                <Route path="links" element={<LinkEditor />} />
                <Route path="appearance" element={<AppearancePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/settings" element={<PlatformSettingsPage />} />
                <Route path="admin/user/:userId" element={<AdminUserEditPage />} />
              </Route>
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInit>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
