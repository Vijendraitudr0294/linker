import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Sparkles, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      setLoading(false);
      toast.error(result.error || "Login failed");
      return;
    }

    // Check if admin and redirect them to admin login
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const profile = await useAuthStore.getState().fetchProfile(authUser.id);
      if (profile?.role === "superadmin") {
        await useAuthStore.getState().logout();
        setLoading(false);
        toast.error("Super Admin accounts must use the admin login portal.");
        navigate("/admin-login");
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel - creator visual */}
      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-orange-500 p-12 items-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_45%),radial-gradient(circle_at_80%_80%,#fde68a_0%,transparent_40%)]" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 w-full max-w-xl text-primary-foreground"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            LinkVertex
          </Link>

          <h2 className="text-4xl font-heading font-semibold leading-tight mb-4">
            Build your creator world in one page.
          </h2>
          <p className="text-primary-foreground/85 text-lg mb-8 max-w-md">
            Launch links, products, bookings, and social content with a page that feels alive.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/25 bg-black/25 p-3 backdrop-blur-md">
              <Users className="w-4 h-4 mb-2 text-white/85" />
              <p className="text-xs text-white/85">Audience</p>
              <p className="text-sm font-semibold">Global</p>
            </div>
            <div className="rounded-xl border border-white/25 bg-black/25 p-3 backdrop-blur-md">
              <TrendingUp className="w-4 h-4 mb-2 text-white/85" />
              <p className="text-xs text-white/85">Growth</p>
              <p className="text-sm font-semibold">Fast setup</p>
            </div>
            <div className="rounded-xl border border-white/25 bg-black/25 p-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 mb-2 text-white/85" />
              <p className="text-xs text-white/85">Ready</p>
              <p className="text-sm font-semibold">No code</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="w-full max-w-sm space-y-7"
        >
          <div className="lg:hidden mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xl font-heading font-bold">LinkVertex</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 transition-all duration-200 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 transition-all duration-200 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

