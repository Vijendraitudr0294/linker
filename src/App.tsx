import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { posthog } from "@/lib/posthog";
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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
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

const queryClient = new QueryClient();

const AppInit = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((s) => s.initialize);
  const navigate = useNavigate();

  useEffect(() => { 
    initialize(); 
    
    // Deep Linking / Referral Logic (Smart Redirect System)
    const handleDeepLink = async () => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referrer');
      
      if (ref) {
         console.log("Deep link detected:", ref);
         localStorage.setItem('last_referral_id', ref);
         
         // PostHog Tracking (Step 4)
         posthog.capture('app_open', { 
           referral_id: ref,
           campaign: params.get('campaign'),
           platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
         });
         
         // Fetch data to redirect to correct screen (Step 4 of user's request)
         try {
           const { data: qr } = await (supabase.from('qr_codes') as any)
             .select('*')
             .eq('short_code', ref)
             .single();
             
           if (qr) {
              // Redirect logic based on type
              if (qr.type === 'vcard_plus') {
                 // Open profile page
                 try {
                    const config = JSON.parse(qr.content);
                    // navigate(`/p/${config.username}`); // if we have it
                 } catch(e) {}
              }
              
              // Standard behavior: if it's a dynamic link to an internal product/profile
              // We could navigate here. But mostly, we just store the ref and let the app handle it.
           }
         } catch(e) {}
      }
    };
    
    handleDeepLink();
  }, [initialize, navigate]);
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
              <Route path="/" element={<CreativeLanding />} />
              <Route path="/luther" element={<LutherLanding />} />
              <Route path="/datary" element={<DataryLanding />} />
              <Route path="/home" element={<Index />} />
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
              <Route path="/p/:username" element={<PublicRouteErrorBoundary><PublicProfile /></PublicRouteErrorBoundary>} />
              <Route path="/p/:username/services" element={<PublicRouteErrorBoundary><PublicServices /></PublicRouteErrorBoundary>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouteErrorBoundary><DashboardLayout /></DashboardRouteErrorBoundary></ProtectedRoute>}>
                <Route index element={<DashboardOverview />} />
                <Route path="links" element={<LinkEditor />} />
                <Route path="appearance" element={<AppearancePage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="socialflow" element={<SocialflowPage />} />
                <Route path="qrforge" element={<QRForgePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/settings" element={<PlatformSettingsPage />} />
                <Route path="admin/user/:userId" element={<AdminUserEditPage />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInit>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;

