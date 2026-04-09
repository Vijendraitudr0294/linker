import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PublicProfile from "./pages/PublicProfile";
import PublicServices from "./pages/PublicServices";
import Onboarding from "./pages/Onboarding";
import RedesignedPage from "./pages/RedesignedPage";
import DataryLanding from "./pages/DataryLanding";
import TokkoLanding from "./pages/TokkoLanding";
import LutherLanding from "./pages/LutherLanding";
import CreativeLanding from "./pages/CreativeLanding";
import About from "./pages/About";
import FeaturesPage from "./pages/FeaturesPage";
import PublicMarketplace from "./pages/PublicMarketplace";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import AppsIntegrationsPage from "./pages/dashboard/AppsIntegrationsPage";
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
import SocialflowPage from "./pages/dashboard/SocialflowPage";
import QRForgePage from "./pages/dashboard/QRForgePage";
import FormsPage from "./pages/dashboard/FormsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import PublicRouteErrorBoundary from "./components/PublicRouteErrorBoundary";
import DashboardRouteErrorBoundary from "./components/DashboardRouteErrorBoundary";
import QRRedirectPage from "./pages/QRRedirectPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Blog from "./pages/Blog";
import HelpCenter from "./pages/HelpCenter";
import ApiDocs from "./pages/ApiDocs";
import StatusPage from "./pages/StatusPage";
import Changelog from "./pages/Changelog";
import FAQPage from "./pages/FAQPage";
import SitemapPage from "./pages/SitemapPage";
import SecurityPage from "./pages/SecurityPage";
import PublicFormPage from "./pages/PublicFormPage";

const queryClient = new QueryClient();

const AppInit = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const fetchAppearance = useAppearanceStore((s) => s.fetchSettings);

  useEffect(() => { 
    initialize(); 
  }, [initialize]);

  useEffect(() => {
    if (user?.user_id) {
      fetchAppearance(user.user_id);
    }
  }, [user?.user_id, fetchAppearance]);

  useEffect(() => {
    // Capture referral ID from URL params (e.g., ?ref=abc123)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      localStorage.setItem('last_referral_id', ref);
    }
  }, []);

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
              <Route path="/home" element={<Index />} />
              <Route path="/luther" element={<LutherLanding />} />
              <Route path="/datary" element={<DataryLanding />} />
              <Route path="/redesigned" element={<RedesignedPage />} />
              <Route path="/tokko" element={<TokkoLanding />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/marketplace" element={<PublicMarketplace />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/welcome" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/p" element={<PublicRouteErrorBoundary><PublicProfile /></PublicRouteErrorBoundary>} />
              <Route path="/forms/:slug" element={<PublicFormPage />} />
              <Route path="/p/:username" element={<PublicRouteErrorBoundary><PublicProfile /></PublicRouteErrorBoundary>} />
              <Route path="/p/:username/services" element={<PublicRouteErrorBoundary><PublicServices /></PublicRouteErrorBoundary>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouteErrorBoundary><DashboardLayout /></DashboardRouteErrorBoundary></ProtectedRoute>}>
                <Route index element={<DashboardOverview />} />
                <Route path="apps" element={<AppsIntegrationsPage />} />
                <Route path="links" element={<LinkEditor />} />
                <Route path="forms" element={<FormsPage />} />
                <Route path="appearance" element={<AppearancePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="socialflow" element={<SocialflowPage />} />
                <Route path="qrforge" element={<QRForgePage />} />
                <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                <Route path="admin/settings" element={<ProtectedRoute adminOnly><PlatformSettingsPage /></ProtectedRoute>} />
                <Route path="admin/user/:userId" element={<ProtectedRoute adminOnly><AdminUserEditPage /></ProtectedRoute>} />
              </Route>
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/r/:shortCode" element={<QRRedirectPage />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInit>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;

