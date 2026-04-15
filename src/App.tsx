import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { useEffect, useState, lazy, Suspense } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import PublicRouteErrorBoundary from "./components/PublicRouteErrorBoundary";
import DashboardRouteErrorBoundary from "./components/DashboardRouteErrorBoundary";
import PageLoader from "./components/PageLoader";

const queryClient = new QueryClient();

// Lazy load layout and pages for better performance
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const PublicServices = lazy(() => import("./pages/PublicServices"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const RedesignedPage = lazy(() => import("./pages/RedesignedPage"));
const DataryLanding = lazy(() => import("./pages/DataryLanding"));
const TokkoLanding = lazy(() => import("./pages/TokkoLanding"));
const LutherLanding = lazy(() => import("./pages/LutherLanding"));
const CreativeLanding = lazy(() => import("./pages/CreativeLanding"));
const About = lazy(() => import("./pages/About"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PublicMarketplace = lazy(() => import("./pages/PublicMarketplace"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const AppsIntegrationsPage = lazy(() => import("./pages/dashboard/AppsIntegrationsPage"));
const LinkEditor = lazy(() => import("./pages/dashboard/LinkEditor"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const AdminPage = lazy(() => import("./pages/dashboard/AdminPage"));
const PlatformSettingsPage = lazy(() => import("./pages/dashboard/PlatformSettingsPage"));
const AdminUserEditPage = lazy(() => import("./pages/dashboard/AdminUserEditPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const CatalogPage = lazy(() => import("./pages/dashboard/CatalogPage"));
const OrdersPage = lazy(() => import("./pages/dashboard/OrdersPage"));
const SocialflowPage = lazy(() => import("./pages/dashboard/SocialflowPage"));
const QRForgePage = lazy(() => import("./pages/dashboard/QRForgePage"));
const FormsPage = lazy(() => import("./pages/dashboard/FormsPage"));
const TemplatesPage = lazy(() => import("./pages/dashboard/TemplatesPage"));
const AppearancePage = lazy(() => import("./pages/dashboard/AppearancePage"));
const QRRedirectPage = lazy(() => import("./pages/QRRedirectPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const Changelog = lazy(() => import("./pages/Changelog"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const PublicFormPage = lazy(() => import("./pages/PublicFormPage"));
const Offline = lazy(() => import("./pages/Offline"));

const AppInit = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const fetchAppearance = useAppearanceStore((s) => s.fetchSettings);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => { 
    initialize(); 
  }, [initialize]);

  useEffect(() => {
    if (user?.user_id) {
      fetchAppearance(user.user_id);
    }
  }, [user?.user_id, fetchAppearance]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Capture referral ID from URL params (e.g., ?ref=abc123)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      localStorage.setItem('last_referral_id', ref);
    }
  }, []);

  if (isOffline) {
    return <Offline />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppInit>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/forms" element={<Navigate to="/dashboard/forms" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardRouteErrorBoundary><DashboardLayout /></DashboardRouteErrorBoundary></ProtectedRoute>}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="apps" element={<AppsIntegrationsPage />} />
                  <Route path="links" element={<LinkEditor />} />
                  <Route path="forms" element={<FormsPage />} />
                  <Route path="appearance" element={<AppearancePage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="catalog" element={<CatalogPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="socialflow" element={<SocialflowPage />} />
                  <Route path="qrforge" element={<QRForgePage />} />
                  <Route path="admin" element={<ProtectedRoute superAdminOnly><AdminPage /></ProtectedRoute>} />
                  <Route path="admin/settings" element={<ProtectedRoute superAdminOnly><PlatformSettingsPage /></ProtectedRoute>} />
                  <Route path="admin/user/:userId" element={<ProtectedRoute superAdminOnly><AdminUserEditPage /></ProtectedRoute>} />
                </Route>
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
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
            </Suspense>
          </AppInit>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;

